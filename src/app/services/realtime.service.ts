import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from './supabase.service';
import { SuaraLog } from '../models/voting.models';

export interface RealtimeVotePayload {
  siswaId: string;
  paslonId: string;
  wakilSiswiId?: string;
  timestamp: string;
  siswaNama?: string;
  kelas?: string;
  logs?: SuaraLog[];
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Status signals
  readonly isConnected = signal<boolean>(false);
  readonly lastActiveTime = signal<string>('Siap');
  readonly connectionType = signal<'supabase' | 'server' | 'hybrid' | 'offline'>('offline');
  readonly lastIncomingVote = signal<RealtimeVotePayload | null>(null);

  // Clients & Channels
  private supabaseClient: SupabaseClient | null = null;
  private supabaseChannel: RealtimeChannel | null = null;
  private sseSource: EventSource | null = null;
  private wsClient: WebSocket | null = null;
  private broadcastChannel: BroadcastChannel | null = null;

  // Event callbacks
  private voteCallbacks: ((payload: RealtimeVotePayload) => void)[] = [];
  private resetCallbacks: (() => void)[] = [];
  private syncCallbacks: (() => void)[] = [];

  constructor() {
    if (this.isBrowser) {
      this.initRealtime();
    }
  }

  private initRealtime(): void {
    try {
      // 1. Inisialisasi Supabase Realtime Client
      this.initSupabaseRealtime();

      // 2. Inisialisasi Server EventSource (SSE) / WebSocket
      this.initServerStream();

      // 3. Inisialisasi Browser BroadcastChannel (Antar-Tab pada perangkat yang sama)
      this.initBroadcastChannel();

      this.isConnected.set(true);
      this.lastActiveTime.set('Terhubung');
    } catch (err) {
      console.warn('Realtime initialization warning:', err);
    }
  }

  // --------------------------------------------------------------------------
  // 1. SUPABASE REALTIME (Cloud Broadcast & DB Changes)
  // --------------------------------------------------------------------------
  private initSupabaseRealtime(): void {
    try {
      this.supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });

      this.supabaseChannel = this.supabaseClient.channel('pemilu-live-stream', {
        config: {
          broadcast: { self: false }
        }
      });

      // Dengarkan siaran vote dari perangkat lain
      this.supabaseChannel
        .on('broadcast', { event: 'VOTE_CAST' }, ({ payload }) => {
          this.handleIncomingVote(payload as RealtimeVotePayload, 'supabase');
        })
        .on('broadcast', { event: 'VOTE_RESET' }, () => {
          this.handleIncomingReset('supabase');
        })
        .on('broadcast', { event: 'DATA_SYNC' }, () => {
          this.handleIncomingSync('supabase');
        });

      // Dengarkan perubahan database langsung jika replikasi Supabase aktif
      this.supabaseChannel
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'suara_log' }, (payload) => {
          const newRow = payload.new as Record<string, unknown>;
          if (newRow) {
            const votePayload: RealtimeVotePayload = {
              siswaId: String(newRow['siswa_id'] || ''),
              paslonId: String(newRow['kandidat_id'] || ''),
              timestamp: String(newRow['waktu_memilih'] || new Date().toISOString()),
              siswaNama: String(newRow['siswa_nama'] || ''),
              kelas: String(newRow['kelas'] || '')
            };
            this.handleIncomingVote(votePayload, 'supabase-db');
          }
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'suara_log' }, () => {
          this.handleIncomingReset('supabase-db');
        });

      this.supabaseChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.isConnected.set(true);
          this.connectionType.set('hybrid');
        }
      });
    } catch (err) {
      console.debug('Supabase realtime init notice:', err);
    }
  }

  // --------------------------------------------------------------------------
  // 2. SERVER REALTIME (SSE & WebSocket)
  // --------------------------------------------------------------------------
  private initServerStream(): void {
    if (!this.isBrowser) return;

    // A. Coba Server-Sent Events (SSE)
    try {
      this.sseSource = new EventSource('/api/realtime/stream');

      this.sseSource.addEventListener('connected', () => {
        this.isConnected.set(true);
        this.connectionType.set('hybrid');
      });

      this.sseSource.addEventListener('vote_cast', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data && data.payload) {
            this.handleIncomingVote(data.payload as RealtimeVotePayload, 'server-sse');
          }
        } catch {
          // ignore parsing error
        }
      });

      this.sseSource.addEventListener('reset_suara', () => {
        this.handleIncomingReset('server-sse');
      });

      this.sseSource.addEventListener('data_sync', () => {
        this.handleIncomingSync('server-sse');
      });

      this.sseSource.onerror = () => {
        // SSE error, coba sambung via WebSocket
        this.tryWebSocketFallback();
      };
    } catch {
      this.tryWebSocketFallback();
    }
  }

  private tryWebSocketFallback(): void {
    if (!this.isBrowser || this.wsClient) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      this.wsClient = new WebSocket(wsUrl);

      this.wsClient.onopen = () => {
        this.isConnected.set(true);
      };

      this.wsClient.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.event === 'vote_cast' && msg.payload) {
            this.handleIncomingVote(msg.payload as RealtimeVotePayload, 'server-ws');
          } else if (msg.event === 'reset_suara') {
            this.handleIncomingReset('server-ws');
          } else if (msg.event === 'data_sync') {
            this.handleIncomingSync('server-ws');
          }
        } catch {
          // ignore
        }
      };

      this.wsClient.onclose = () => {
        this.wsClient = null;
      };
    } catch {
      // WS unsupported or blocked
    }
  }

  // --------------------------------------------------------------------------
  // 3. BROWSER BROADCAST CHANNEL (Antar Tab / Perangkat Lokal)
  // --------------------------------------------------------------------------
  private initBroadcastChannel(): void {
    if (!this.isBrowser || typeof BroadcastChannel === 'undefined') return;

    try {
      this.broadcastChannel = new BroadcastChannel('pemilu_osis_realtime');
      this.broadcastChannel.onmessage = (event: MessageEvent) => {
        const msg = event.data;
        if (!msg) return;

        if (msg.type === 'VOTE_CAST' && msg.payload) {
          this.handleIncomingVote(msg.payload, 'broadcast-channel');
        } else if (msg.type === 'VOTE_RESET') {
          this.handleIncomingReset('broadcast-channel');
        } else if (msg.type === 'DATA_SYNC') {
          this.handleIncomingSync('broadcast-channel');
        }
      };
    } catch {
      // Ignore broadcast channel failure
    }
  }

  // --------------------------------------------------------------------------
  // DISTRIBUTED BROADCAST METHODS (Panggil saat memilih / reset)
  // --------------------------------------------------------------------------

  /**
   * Siarkan suara yang baru dicoblos ke seluruh perangkat yang terhubung
   */
  async broadcastVote(payload: RealtimeVotePayload): Promise<void> {
    const timeStr = new Date().toLocaleTimeString('id-ID');
    this.lastActiveTime.set(`Suara dikirim ${timeStr}`);

    // 1. Kirim via Supabase Realtime Channel
    if (this.supabaseChannel) {
      try {
        await this.supabaseChannel.send({
          type: 'broadcast',
          event: 'VOTE_CAST',
          payload
        });
      } catch (err) {
        console.debug('Broadcast Supabase notice:', err);
      }
    }

    // 2. Kirim via Server Broadcast API
    if (this.isBrowser) {
      try {
        fetch('/api/realtime/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'vote_cast',
            payload
          })
        }).catch(() => {
          // non-fatal
        });
      } catch {
        // non-fatal
      }
    }

    // 3. Kirim via WebSocket jika terbuka
    if (this.wsClient && this.wsClient.readyState === WebSocket.OPEN) {
      try {
        this.wsClient.send(JSON.stringify({
          event: 'vote_cast',
          payload
        }));
      } catch {
        // non-fatal
      }
    }

    // 4. Kirim via local BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'VOTE_CAST',
          payload
        });
      } catch {
        // non-fatal
      }
    }
  }

  /**
   * Siarkan reset suara ke seluruh perangkat
   */
  async broadcastReset(): Promise<void> {
    if (this.supabaseChannel) {
      try {
        await this.supabaseChannel.send({
          type: 'broadcast',
          event: 'VOTE_RESET',
          payload: {}
        });
      } catch {
        // non-fatal
      }
    }

    if (this.isBrowser) {
      try {
        fetch('/api/realtime/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'reset_suara', payload: {} })
        }).catch((err) => {
          console.debug('Broadcast reset notice:', err);
        });
      } catch {
        // non-fatal
      }
    }

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'VOTE_RESET' });
      } catch {
        // non-fatal
      }
    }
  }

  /**
   * Siarkan permintaan sinkronisasi data
   */
  async broadcastSync(): Promise<void> {
    if (this.supabaseChannel) {
      try {
        await this.supabaseChannel.send({
          type: 'broadcast',
          event: 'DATA_SYNC',
          payload: {}
        });
      } catch {
        // non-fatal
      }
    }

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'DATA_SYNC' });
      } catch {
        // non-fatal
      }
    }
  }

  // --------------------------------------------------------------------------
  // EVENT DISPATCHERS & HANDLERS
  // --------------------------------------------------------------------------

  private handleIncomingVote(payload: RealtimeVotePayload, source: string): void {
    const timeStr = new Date().toLocaleTimeString('id-ID');
    this.lastActiveTime.set(`Suara masuk (${source} ${timeStr})`);
    this.lastIncomingVote.set(payload);

    for (const cb of this.voteCallbacks) {
      try {
        cb(payload);
      } catch (e) {
        console.error('Error in realtime vote callback:', e);
      }
    }
  }

  private handleIncomingReset(source: string): void {
    const timeStr = new Date().toLocaleTimeString('id-ID');
    this.lastActiveTime.set(`Reset (${source} ${timeStr})`);

    for (const cb of this.resetCallbacks) {
      try {
        cb();
      } catch (e) {
        console.error('Error in realtime reset callback:', e);
      }
    }
  }

  private handleIncomingSync(source: string): void {
    const timeStr = new Date().toLocaleTimeString('id-ID');
    this.lastActiveTime.set(`Sinkronisasi (${source} ${timeStr})`);
    for (const cb of this.syncCallbacks) {
      try {
        cb();
      } catch (e) {
        console.error('Error in realtime sync callback:', e);
      }
    }
  }

  // Registrasi pendengar
  onVote(callback: (payload: RealtimeVotePayload) => void): () => void {
    this.voteCallbacks.push(callback);
    return () => {
      this.voteCallbacks = this.voteCallbacks.filter(c => c !== callback);
    };
  }

  onReset(callback: () => void): () => void {
    this.resetCallbacks.push(callback);
    return () => {
      this.resetCallbacks = this.resetCallbacks.filter(c => c !== callback);
    };
  }

  onSync(callback: () => void): () => void {
    this.syncCallbacks.push(callback);
    return () => {
      this.syncCallbacks = this.syncCallbacks.filter(c => c !== callback);
    };
  }
}
