import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { UiService } from '../../services/ui.service';
import { VotingService } from '../../services/voting.service';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    <header class="h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between border-b border-slate-100/80 bg-white/60 backdrop-blur-xs">
      
      <!-- Left: Sidebar Toggle (Desktop & Mobile) & Welcome Greeting -->
      <div class="flex items-center gap-3">
        <button 
          type="button"
          (click)="onToggleClick()"
          class="flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          [title]="uiService.isSidebarOpen() ? 'Tutup Sidebar' : 'Buka Sidebar'">
          <mat-icon class="text-[20px] w-5 h-5">{{ uiService.isSidebarOpen() ? 'menu_open' : 'menu' }}</mat-icon>
        </button>

        <!-- Dynamic Greeting & Date from image.png -->
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Selamat datang, Panitia OSIS
            </h1>
            <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0062FF] bg-[#EAF2FF] px-2 py-0.5 rounded-full">
              SMP AL MUTTAQIN
            </span>
          </div>
          <p class="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-2">
            <span>Kamis, 8 Oktober 2026</span>
            <span aria-hidden="true" class="text-slate-300">·</span>
            <span>Pemilihan Ketua & Wakil Ketua OSIS</span>
          </p>
        </div>
      </div>

      <!-- Right: Action Controls matching image.png -->
      <div class="flex items-center gap-2.5">
        
        <!-- Dropdown 1: Channels/Filter Pill -->
        <div class="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300 cursor-pointer">
          <span>Kategori Pemilih</span>
          <mat-icon class="text-[16px] w-4 h-4 text-slate-400">keyboard_arrow_down</mat-icon>
        </div>

        <!-- Dropdown 2: Date Picker Pill with Calendar Icon -->
        <div class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300 cursor-pointer">
          <mat-icon class="text-[16px] w-4 h-4 text-slate-400">calendar_today</mat-icon>
          <span>TP. 2026/2027</span>
          <mat-icon class="text-[16px] w-4 h-4 text-slate-400">keyboard_arrow_down</mat-icon>
        </div>

        <!-- Supabase Status Badge -->
        <button 
          type="button"
          (click)="onSyncClick()"
          [disabled]="supabaseService.isSyncing()"
          title="Sinkronisasi Database Supabase"
          class="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors text-slate-700 shadow-2xs">
          <span class="w-2 h-2 rounded-full bg-emerald-500" [class.animate-pulse]="supabaseService.isSyncing()"></span>
          <span class="font-medium text-[11px] hidden sm:inline">
            {{ supabaseService.isSyncing() ? 'Sinkron...' : 'Supabase' }}
          </span>
          <mat-icon class="text-[14px] w-3.5 h-3.5 text-slate-400" [class.animate-spin]="supabaseService.isSyncing()">sync</mat-icon>
        </button>

        <!-- Primary Action Button: Electric Blue Bilik Suara -->
        <a 
          routerLink="/pemungutan-suara"
          class="px-4 py-2 bg-[#0062FF] hover:bg-[#0052D9] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-[0_4px_14px_rgba(0,98,255,0.25)] transition-all whitespace-nowrap">
          <mat-icon class="text-[16px] w-4 h-4">how_to_vote</mat-icon>
          <span>Bilik Suara</span>
        </a>

      </div>

    </header>
  `
})
export class HeaderComponent {
  readonly uiService = inject(UiService);
  readonly votingService = inject(VotingService);
  readonly supabaseService = inject(SupabaseService);

  onToggleClick(): void {
    this.uiService.toggleSidebar();
  }

  onSyncClick(): void {
    this.votingService.sinkronkanSemuaKeSupabase();
  }
}
