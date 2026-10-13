import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { Response } from 'express';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { WebSocketServer, WebSocket } from 'ws';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.use(express.json());

const angularApp = new AngularNodeAppEngine();

// Multi-device realtime clients sets
const sseClients = new Set<Response>();
const wsClients = new Set<WebSocket>();

function broadcastRealtime(event: string, payload: unknown) {
  const message = JSON.stringify({
    event,
    payload,
    timestamp: new Date().toISOString(),
  });

  // 1. Broadcast to Server-Sent Events clients (all browsers on network)
  for (const client of sseClients) {
    try {
      client.write(`event: ${event}\ndata: ${message}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }

  // 2. Broadcast to WebSocket clients
  for (const ws of wsClients) {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    } catch {
      wsClients.delete(ws);
    }
  }
}

// -------------------------------------------------------------
// Realtime API Endpoints (Before Angular SSR)
// -------------------------------------------------------------

// SSE stream for real-time live voting broadcast across devices
app.get('/api/realtime/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*',
  });

  const welcome = JSON.stringify({
    event: 'connected',
    clients: sseClients.size + 1,
    time: new Date().toISOString(),
  });
  res.write(`event: connected\ndata: ${welcome}\n\n`);
  sseClients.add(res);

  // Heartbeat every 15s to maintain persistent HTTP connection
  const heartbeat = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// Broadcast endpoint: any device that votes calls this to instantly notify all other devices
app.post('/api/realtime/broadcast', (req, res) => {
  const { event = 'vote_cast', payload = {} } = req.body || {};
  broadcastRealtime(event, payload);
  res.json({
    success: true,
    sseCount: sseClients.size,
    wsCount: wsClients.size,
    timestamp: new Date().toISOString(),
  });
});

// Status endpoint to check active real-time connections
app.get('/api/realtime/status', (req, res) => {
  res.json({
    online: true,
    sseClients: sseClients.size,
    wsClients: wsClients.size,
    totalConnected: sseClients.size + wsClients.size,
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// Static file serving & SSR handling
// -------------------------------------------------------------

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// WebSocket Server initialization
const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws) => {
  wsClients.add(ws);
  try {
    ws.send(JSON.stringify({ event: 'connected', clients: wsClients.size }));
  } catch {
    // Ignore initial send error
  }

  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      if (parsed.event) {
        broadcastRealtime(parsed.event, parsed.payload);
      }
    } catch {
      // Ignore invalid payload
    }
  });

  ws.on('close', () => {
    wsClients.delete(ws);
  });
});

// WebSocket upgrade middleware
app.use('/api', (req, res, next) => {
  if (req.path === '/live' && req.headers.upgrade?.toLowerCase() === 'websocket') {
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
      wss.emit('connection', ws, req);
    });
    return;
  }
  next();
});

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
