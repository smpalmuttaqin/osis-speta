import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { UiService } from '../../services/ui.service';
import { VotingService } from '../../services/voting.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <!-- Mobile Backdrop Overlay -->
    @if (uiService.isMobileSidebarOpen()) {
      <button 
        type="button"
        aria-label="Tutup Menu"
        (click)="uiService.closeMobileSidebar()"
        class="fixed inset-0 z-40 w-full h-full bg-slate-900/40 backdrop-blur-xs md:hidden transition-opacity cursor-pointer border-0 p-0 text-left">
      </button>
    }

    <!-- Sidebar Container (Tetap di samping saat di-scroll) -->
    <aside 
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-xs"
      [class.translate-x-0]="uiService.isMobileSidebarOpen() || uiService.isSidebarOpen()"
      [class.-translate-x-full]="!(uiService.isMobileSidebarOpen() || uiService.isSidebarOpen())">
      
      <!-- Top Brand & Close Toggle Section -->
      <div>
        <div class="h-20 flex items-center px-4 justify-between border-b border-slate-50">
          <div class="flex items-center gap-3 overflow-hidden">
            <div class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5 shrink-0">
              <img 
                src="https://avrudqubtdtasaaugtjx.supabase.co/storage/v1/object/public/foto_app/LOGO%20SMP%20AL%20MUTTAQIN%20Baru%20(1).png" 
                alt="Logo SMP Al Muttaqin" 
                referrerpolicy="no-referrer"
                class="w-full h-full object-contain" />
            </div>
            <div class="overflow-hidden whitespace-nowrap">
              <span class="text-xs font-black tracking-tight text-slate-900 block leading-tight">
                SMP AL MUTTAQIN
              </span>
              <span class="text-[10px] text-slate-400 font-medium block">
                E-Voting OSIS
              </span>
            </div>
          </div>

          <!-- Close Sidebar Button (Berfungsi di Desktop dan Mobile) -->
          <button 
            type="button"
            (click)="uiService.toggleSidebar()"
            class="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tutup Menu Sidebar">
            <mat-icon class="text-[20px] w-5 h-5">menu_open</mat-icon>
          </button>
        </div>

        <!-- Navigation Links Stack -->
        <nav class="px-3 pt-3 space-y-2">
          
          <!-- 1. Dashboard -->
          <a 
            routerLink="/dashboard" 
            routerLinkActive="active-nav-item" 
            [routerLinkActiveOptions]="{exact: true}"
            (click)="onNavClick()"
            class="nav-link group relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50/80 transition-all">
            <span class="active-indicator hidden"></span>
            <div class="nav-icon-box w-9 h-9 rounded-xl flex items-center justify-center transition-colors">
              <mat-icon class="text-[20px] w-5 h-5">home</mat-icon>
            </div>
            <span class="truncate font-semibold text-xs">Dashboard</span>
          </a>

          <!-- 2. Siswa (DPT) -->
          <a 
            routerLink="/siswa" 
            routerLinkActive="active-nav-item" 
            (click)="onNavClick()"
            class="nav-link group relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50/80 transition-all">
            <span class="active-indicator hidden"></span>
            <div class="nav-icon-box w-9 h-9 rounded-xl flex items-center justify-center transition-colors">
              <mat-icon class="text-[20px] w-5 h-5">people_outline</mat-icon>
            </div>
            <span class="truncate font-semibold text-xs">Daftar Pemilih</span>
          </a>

          <!-- 3. Kandidat Paslon -->
          <a 
            routerLink="/kandidat" 
            routerLinkActive="active-nav-item" 
            (click)="onNavClick()"
            class="nav-link group relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50/80 transition-all">
            <span class="active-indicator hidden"></span>
            <div class="nav-icon-box w-9 h-9 rounded-xl flex items-center justify-center transition-colors">
              <mat-icon class="text-[20px] w-5 h-5">layers</mat-icon>
            </div>
            <span class="truncate font-semibold text-xs">Kandidat Paslon</span>
          </a>

          <!-- 4. Bilik Pemungutan Suara -->
          <a 
            routerLink="/pemungutan-suara" 
            routerLinkActive="active-nav-item" 
            (click)="onNavClick()"
            class="nav-link group relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50/80 transition-all">
            <span class="active-indicator hidden"></span>
            <div class="nav-icon-box w-9 h-9 rounded-xl flex items-center justify-center transition-colors">
              <mat-icon class="text-[20px] w-5 h-5">how_to_vote</mat-icon>
            </div>
            <span class="truncate font-semibold text-xs">Bilik Suara</span>
          </a>

        </nav>
      </div>

      <!-- Bottom Profile Avatar & Quick Close Section -->
      <div class="p-3 border-t border-slate-100 space-y-3">
        
        <!-- Live turnout mini indicator -->
        <div class="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-3 text-xs space-y-1.5">
          <div class="flex items-center justify-between text-slate-400 text-[11px] font-medium">
            <span>Partisipasi</span>
            <span class="font-bold text-slate-800 tabular-nums">
              {{ votingService.persentaseSudah() }}%
            </span>
          </div>
          <div class="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
            <div 
              class="bg-[#0062FF] h-1.5 rounded-full transition-all duration-300"
              [style.width.%]="votingService.persentaseSudah()">
            </div>
          </div>
        </div>

        <!-- Profile Button Avatar -->
        <div class="flex items-center justify-between p-1">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-full bg-[#EAF2FF] text-[#0062FF] flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100/80 shadow-2xs">
              <mat-icon class="text-[20px] w-5 h-5">account_circle</mat-icon>
            </div>
            <div class="overflow-hidden whitespace-nowrap min-w-0">
              <span class="text-xs font-bold text-slate-800 block truncate">
                Panitia OSIS
              </span>
              <span class="text-[10px] text-slate-400 block truncate">
                Administrator
              </span>
            </div>
          </div>

          <!-- Quick Collapse Button on Desktop -->
          <button 
            type="button"
            (click)="uiService.toggleSidebar()"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Sembunyikan Sidebar">
            <mat-icon class="text-[18px] w-4.5 h-4.5">chevron_left</mat-icon>
          </button>
        </div>

        <!-- Logout Button -->
        <button 
          type="button"
          (click)="logout()"
          class="w-full mt-2 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs">
          <mat-icon class="text-[16px] w-4 h-4">logout</mat-icon>
          <span>Keluar / Logout</span>
        </button>

      </div>

    </aside>
  `,
  styles: [`
    .active-nav-item {
      color: #0062ff !important;
      background-color: transparent !important;
    }
    .active-nav-item .active-indicator {
      display: block !important;
      position: absolute;
      left: -12px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 24px;
      background-color: #0062ff;
      border-top-right-radius: 9999px;
      border-bottom-right-radius: 9999px;
    }
    .active-nav-item .nav-icon-box {
      background-color: #eaf2ff !important;
      color: #0062ff !important;
    }
  `]
})
export class SidebarComponent {
  readonly uiService = inject(UiService);
  readonly votingService = inject(VotingService);
  readonly authService = inject(AuthService);
  readonly router = inject(Router);

  onNavClick(): void {
    if (this.uiService.isMobileSidebarOpen()) {
      this.uiService.closeMobileSidebar();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
