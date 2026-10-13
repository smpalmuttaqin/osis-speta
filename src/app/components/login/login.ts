import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-[#f0fdfa] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      
      <!-- Main Container Card (Split Screen Style) -->
      <div class="w-full max-w-5xl bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(13,148,136,0.12)] border border-teal-100/60 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        <!-- Left Side: Login Form -->
        <div class="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between">
          
          <!-- Top Navigation / Brand mini -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold border border-teal-100 shadow-xs">
              <mat-icon class="text-[22px] w-5.5 h-5.5">how_to_vote</mat-icon>
            </div>
            <div>
              <span class="text-xs font-bold text-slate-900 tracking-tight block">OSIS SMP AL MUTTAQIN</span>
              <span class="text-[10px] text-slate-400 font-medium block">E-Voting Portal</span>
            </div>
          </div>

          <!-- Form Area -->
          <div class="my-auto py-8">
            <div class="mb-8">
              <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Login</h2>
              <div class="w-12 h-1 bg-teal-500 rounded-full mt-2"></div>
            </div>

            <form (submit)="onLogin($event)" class="space-y-5">
              <div class="space-y-2">
                <label for="usernameInput" class="block text-xs font-bold text-slate-700 tracking-wider uppercase">Username</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <mat-icon class="text-[20px] w-5 h-5">person_outline</mat-icon>
                  </span>
                  <input 
                    id="usernameInput"
                    type="text" 
                    [(ngModel)]="accessCode" 
                    name="accessCode"
                    placeholder="Masukkan username"
                    class="w-full pl-11 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-2xs"
                    required
                    autocomplete="off"
                  />
                </div>
              </div>

              <button 
                type="submit"
                class="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-teal-600/20 transition-all cursor-pointer flex items-center justify-center gap-2">
                <span>Login</span>
                <mat-icon class="text-[18px] w-4.5 h-4.5">arrow_forward</mat-icon>
              </button>
            </form>
          </div>

          <!-- Footer Copyright -->
          <div class="text-[11px] text-slate-400 font-medium">
            &copy; 2026 OSIS SMP Al Muttaqin Boarding School
          </div>

        </div>

        <!-- Right Side: Mint Graphic Panel with OSIS SMP Al Muttaqin Logo -->
        <div class="lg:col-span-6 bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden text-white">
          <!-- Decorative Background Circles -->
          <div class="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
          <div class="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none"></div>

          <!-- Top Right Action -->
          <div class="flex justify-end relative z-10">
            <div class="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-semibold tracking-wide">
              E-Voting Portal
            </div>
          </div>

          <!-- Center OSIS Logo & Welcome Illustration -->
          <div class="my-auto py-12 flex flex-col items-center text-center relative z-10">
            <!-- OSIS SMP Al Muttaqin Logo Emblem -->
            <div class="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white/10 backdrop-blur-md border border-white/30 p-3 flex items-center justify-center shadow-xl mb-6 relative group">
              <div class="absolute inset-0 rounded-3xl bg-white/5 group-hover:bg-white/15 transition-colors"></div>
              <img 
                src="https://avrudqubtdtasaaugtjx.supabase.co/storage/v1/object/public/foto_app/LOGO%20SMP%20AL%20MUTTAQIN%20Baru%20(1).png" 
                alt="Logo OSIS SMP Al Muttaqin" 
                referrerpolicy="no-referrer"
                class="w-full h-full object-contain relative z-10 drop-shadow-md" 
              />
            </div>

            <h3 class="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">OSIS SMP AL MUTTAQIN</h3>
            <p class="text-teal-100 text-sm max-w-sm font-medium leading-relaxed">
              Pemilihan Ketua & Wakil Ketua OSIS Berbasis Digital yang Jujur, Adil, dan Transparan.
            </p>
          </div>

          <!-- Bottom Feature Badges -->
          <div class="flex items-center justify-between text-xs text-teal-100 font-medium relative z-10 pt-4 border-t border-white/10">
            <span class="flex items-center gap-1.5">
              <mat-icon class="text-[16px] w-4 h-4">verified</mat-icon> Realtime Count
            </span>
            <span class="flex items-center gap-1.5">
              <mat-icon class="text-[16px] w-4 h-4">lock</mat-icon> Secure Voting
            </span>
          </div>

        </div>

      </div>
    </div>
  `
})
export class LoginComponent {
  readonly authService = inject(AuthService);
  readonly router = inject(Router);
  accessCode = '';

  onLogin(event: Event): void {
    event.preventDefault();
    this.executeLogin(this.accessCode);
  }

  quickLogin(code: string): void {
    this.accessCode = code;
    this.executeLogin(code);
  }

  private executeLogin(code: string): void {
    const success = this.authService.login(code);
    if (success) {
      const role = this.authService.currentUser();
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Masuk',
        text: `Masuk sebagai ${role === 'admin' ? 'Admin (admin354)' : 'User (speta123)'}`,
        timer: 1500,
        showConfirmButton: false
      });
      if (role === 'user') {
        this.router.navigate(['/pemungutan-suara']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Masuk',
        text: 'Username tidak valid. Gunakan speta123 (User) atau admin354 (Admin).',
        confirmButtonColor: '#0d9488'
      });
    }
  }
}
