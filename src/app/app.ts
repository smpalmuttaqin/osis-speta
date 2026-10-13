import { ChangeDetectionStrategy, Component, inject, effect } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SidebarComponent } from './components/sidebar/sidebar';
import { LoginComponent } from './components/login/login';
import { UiService } from './services/ui.service';
import { AuthService } from './services/auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, LoginComponent, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly uiService = inject(UiService);
  readonly authService = inject(AuthService);
  readonly router = inject(Router);

  constructor() {
    effect(() => {
      const role = this.authService.currentUser();
      if (role === 'user') {
        const currentUrl = this.router.url;
        if (!currentUrl.includes('pemungutan-suara')) {
          this.router.navigate(['/pemungutan-suara']);
        }
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
