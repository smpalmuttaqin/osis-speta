import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SuaraLog } from '../../models/voting.models';
import { VotingService } from '../../services/voting.service';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="p-4 sm:p-6 lg:p-8 space-y-6">
      
      <!-- STAT CARDS: 2 ROWS OF 4 CARDS -->
      <div class="space-y-4">
        
        <!-- Row 1: 4 Stat Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <!-- Card 1: Total Siswa (DPT) -->
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <span>Daftar Pemilih (DPT)</span>
                <mat-icon class="text-[14px] w-3.5 h-3.5 text-slate-300">info_outline</mat-icon>
              </div>
              <div class="w-8 h-8 rounded-xl bg-[#EBF3FF] text-[#0062FF] flex items-center justify-center">
                <mat-icon class="text-[18px] w-4.5 h-4.5">people_outline</mat-icon>
              </div>
            </div>
            <div class="mt-3">
              <span class="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
                {{ votingService.totalSiswa() }}
              </span>
              <span class="text-xs text-slate-400 ml-1 font-medium">Pemilih</span>
            </div>
            <div class="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#10B981]">
              <mat-icon class="text-[14px] w-3.5 h-3.5">north_east</mat-icon>
              <span>100% Hak Suara Terdaftar</span>
            </div>
          </div>

          <!-- Card 2: Suara Paslon Putra -->
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <span>Suara Paslon Siswa</span>
              </div>
              <div class="w-8 h-8 rounded-xl bg-[#EAF8F0] text-[#10B981] flex items-center justify-center">
                <mat-icon class="text-[18px] w-4.5 h-4.5">how_to_vote</mat-icon>
              </div>
            </div>
            <div class="mt-3">
              <span class="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
                {{ votingService.totalSuaraPaslon() }}
              </span>
              <span class="text-xs text-slate-400 ml-1 font-medium">Suara</span>
            </div>
            <div class="mt-1 flex items-center gap-1 text-[11px] font-semibold text-blue-600">
              <span>{{ votingService.hasilPaslonSiswa().length }} Paslon Ketua & Wakil</span>
            </div>
          </div>

          <!-- Card 3: Suara Wakil Siswi -->
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <span>Suara Wakil Siswi</span>
              </div>
              <div class="w-8 h-8 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center">
                <mat-icon class="text-[18px] w-4.5 h-4.5">how_to_reg</mat-icon>
              </div>
            </div>
            <div class="mt-3">
              <span class="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
                {{ votingService.totalSuaraWakilSiswi() }}
              </span>
              <span class="text-xs text-slate-400 ml-1 font-medium">Suara</span>
            </div>
            <div class="mt-1 flex items-center gap-1 text-[11px] font-semibold text-purple-600">
              <span>{{ votingService.hasilWakilSiswi().length }} Calon Wakil Siswi</span>
            </div>
          </div>

          <!-- Card 4: Pemilih yang Sudah Memilih -->
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <span>Pemilih Hadir</span>
              </div>
              <div class="w-8 h-8 rounded-xl bg-[#FFF6E9] text-[#F59E0B] flex items-center justify-center">
                <mat-icon class="text-[18px] w-4.5 h-4.5">assignment_turned_in</mat-icon>
              </div>
            </div>
            <div class="mt-3">
              <span class="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
                {{ votingService.sudahMemilihCount() }}
              </span>
              <span class="text-xs text-slate-400 ml-1 font-medium">Pemilih</span>
            </div>
            <div class="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#10B981]">
              <span>{{ votingService.persentaseSudah() }}% Partisipasi Pemilih</span>
            </div>
          </div>

        </div>

        <!-- Row 2: 4 Secondary Metric Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <!-- Card 5: Belum Menggunakan Hak Suara -->
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div class="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
              <span>Belum Memilih</span>
              <mat-icon class="text-[14px] w-3.5 h-3.5 text-slate-300">hourglass_empty</mat-icon>
            </div>
            <div class="mt-3">
              <span class="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
                {{ votingService.belumMemilihCount() }}
              </span>
              <span class="text-xs text-slate-400 ml-1 font-medium">Pemilih</span>
            </div>
            <div class="mt-1 flex items-center gap-1 text-[11px] font-semibold text-amber-600">
              <span>{{ votingService.persentaseBelum() }}% Menunggu Giliran</span>
            </div>
          </div>

          <!-- Card 6: Kelas Terdaftar -->
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div class="text-slate-400 text-xs font-medium">
              <span>Rombongan Belajar</span>
            </div>
            <div class="mt-3">
              <span class="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
                {{ votingService.rekapPerKelas().length }}
              </span>
              <span class="text-xs text-slate-400 ml-1 font-medium">Kelas</span>
            </div>
            <div class="mt-1 text-[11px] font-medium text-slate-400">
              Tingkat VII, VIII, IX & Guru
            </div>
          </div>

          <!-- Card 7: Log Suara Valid -->
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div class="text-slate-400 text-xs font-medium">
              <span>Total Transaksi Suara</span>
            </div>
            <div class="mt-3">
              <span class="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
                {{ votingService.suaraLog().length }}
              </span>
              <span class="text-xs text-slate-400 ml-1 font-medium">Catatan Suara</span>
            </div>
            <div class="mt-1 text-[11px] font-semibold text-[#10B981]">
              100% Enkripsi Suara Sah
            </div>
          </div>

          <!-- Card 8: Status Sistem -->
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div class="text-slate-400 text-xs font-medium">
              <span>Status Pemungutan</span>
            </div>
            <div class="mt-3">
              <span class="text-2xl font-black text-[#10B981] tracking-tight">
                Aktif & Terpisah
              </span>
            </div>
            <div class="mt-1 text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>Supabase Cloud</span>
              <span class="text-[#0062FF] font-semibold">Tersinkron</span>
            </div>
          </div>

        </div>

      </div>

      <!-- MAIN CHART SECTION: LIVE COUNT PEROLEHAN SUARA DENGAN KATEGORI TERPISAH -->
      <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] relative overflow-hidden">
        
        <!-- Header Chart with Category Filter and Action -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-bold text-slate-900 tracking-tight">
                Grafik Perolehan Suara (Live Count)
              </h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0062FF] border border-blue-100">
                Real-Time
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">
              Pemisahan akumulasi suara antara Paslon Siswa (Putra) dan Calon Wakil Siswi
            </p>
          </div>

          <!-- Category Switcher Tabs -->
          <div class="flex items-center gap-2">
            <div class="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
              <button 
                type="button"
                (click)="activeCategory.set('paslon')"
                [class.bg-white]="activeCategory() === 'paslon'"
                [class.text-[#0062FF]]="activeCategory() === 'paslon'"
                [class.shadow-xs]="activeCategory() === 'paslon'"
                [class.text-slate-600]="activeCategory() !== 'paslon'"
                class="px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer">
                <mat-icon class="text-[15px] w-[15px] h-[15px]">groups</mat-icon>
                <span>Paslon Siswa</span>
                <span class="ml-1 text-[10px] px-1.5 py-0.2 rounded-md font-bold"
                  [class.bg-blue-50]="activeCategory() === 'paslon'"
                  [class.text-[#0062FF]]="activeCategory() === 'paslon'"
                  [class.bg-slate-200]="activeCategory() !== 'paslon'">
                  {{ votingService.totalSuaraPaslon() }}
                </span>
              </button>

              <button 
                type="button"
                (click)="activeCategory.set('wakil_siswi')"
                [class.bg-white]="activeCategory() === 'wakil_siswi'"
                [class.text-purple-700]="activeCategory() === 'wakil_siswi'"
                [class.shadow-xs]="activeCategory() === 'wakil_siswi'"
                [class.text-slate-600]="activeCategory() !== 'wakil_siswi'"
                class="px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer">
                <mat-icon class="text-[15px] w-[15px] h-[15px]">face_3</mat-icon>
                <span>Wakil Siswi</span>
                <span class="ml-1 text-[10px] px-1.5 py-0.2 rounded-md font-bold"
                  [class.bg-purple-50]="activeCategory() === 'wakil_siswi'"
                  [class.text-purple-700]="activeCategory() === 'wakil_siswi'"
                  [class.bg-slate-200]="activeCategory() !== 'wakil_siswi'">
                  {{ votingService.totalSuaraWakilSiswi() }}
                </span>
              </button>
            </div>

            <button 
              type="button"
              (click)="onResetSuara()"
              class="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer">
              <mat-icon class="text-[14px] w-3.5 h-3.5">refresh</mat-icon>
              <span>Reset Suara</span>
            </button>
          </div>
        </div>

        <!-- Wave Line Chart Container -->
        <div class="relative w-full h-72 sm:h-80 flex flex-col justify-end">
          
          <!-- Background Grid Lines & Y-Axis Labels -->
          <div class="absolute inset-0 flex flex-col justify-between pointer-events-none text-[11px] text-slate-300 tabular-nums">
            <div class="flex items-center gap-4 border-b border-slate-100/70 pb-1">
              <span class="w-8">100%</span>
              <div class="flex-1 border-b border-dashed border-slate-100"></div>
            </div>
            <div class="flex items-center gap-4 border-b border-slate-100/70 pb-1">
              <span class="w-8">75%</span>
              <div class="flex-1 border-b border-dashed border-slate-100"></div>
            </div>
            <div class="flex items-center gap-4 border-b border-slate-100/70 pb-1">
              <span class="w-8">50%</span>
              <div class="flex-1 border-b border-dashed border-slate-100"></div>
            </div>
            <div class="flex items-center gap-4 border-b border-slate-100/70 pb-1">
              <span class="w-8">25%</span>
              <div class="flex-1 border-b border-dashed border-slate-100"></div>
            </div>
            <div class="flex items-center gap-4">
              <span class="w-8">0%</span>
              <div class="flex-1 border-b border-slate-200"></div>
            </div>
          </div>

          <!-- Dynamic SVG Smooth Wave Curve -->
          <svg class="w-full h-56 pl-10 overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 240">
            <defs>
              <linearGradient id="waveBlueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" [attr.stop-color]="activeCategory() === 'paslon' ? '#0062FF' : '#7C3AED'" stop-opacity="0.22" />
                <stop offset="50%" [attr.stop-color]="activeCategory() === 'paslon' ? '#0062FF' : '#7C3AED'" stop-opacity="0.08" />
                <stop offset="100%" [attr.stop-color]="activeCategory() === 'paslon' ? '#0062FF' : '#7C3AED'" stop-opacity="0.0" />
              </linearGradient>
              <filter id="waveGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" [attr.flood-color]="activeCategory() === 'paslon' ? '#0062FF' : '#7C3AED'" flood-opacity="0.25" />
              </filter>
            </defs>

            <!-- Gradient Area Fill under Curve -->
            <path 
              [attr.d]="svgAreaPath()"
              fill="url(#waveBlueGradient)" />

            <!-- Smooth Wave Stroke -->
            <path 
              [attr.d]="svgLinePath()"
              fill="none" 
              [attr.stroke]="activeCategory() === 'paslon' ? '#0062FF' : '#7C3AED'" 
              stroke-width="3" 
              stroke-linecap="round"
              stroke-linejoin="round"
              filter="url(#waveGlow)" />

            <!-- Dot Points along the curve -->
            @for (pt of chartPoints(); track pt.label) {
              <circle 
                [attr.cx]="pt.x" 
                [attr.cy]="pt.y" 
                r="5.5" 
                [attr.fill]="activeCategory() === 'paslon' ? '#0062FF' : '#7C3AED'" 
                stroke="#FFFFFF" 
                stroke-width="2.5" 
                class="transition-all duration-300 hover:r-7 cursor-pointer" />
            }
          </svg>

          <!-- FLOATING BREAKDOWN CARD IN CENTER -->
          <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[94%] sm:w-[450px] bg-white rounded-2xl shadow-[0_12px_45px_rgba(20,40,80,0.14)] border border-slate-100 p-4 animate-in fade-in zoom-in-95 duration-200">
            
            <!-- Floating Header -->
            <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[11px] font-semibold text-slate-400">
              <span class="w-1/2">
                {{ activeCategory() === 'paslon' ? 'Pasangan Calon Siswa (Putra)' : 'Calon Wakil Siswi' }}
              </span>
              <span class="w-1/6 text-right">Suara</span>
              <span class="w-1/6 text-right">Persen</span>
              <span class="w-1/6 text-right">Status</span>
            </div>

            <!-- Content for Active Category -->
            <div class="space-y-2">
              @if (activeCategory() === 'paslon') {
                @for (item of votingService.hasilPaslonSiswa(); track item.kandidat.id) {
                  <div class="flex items-center justify-between text-xs py-1.5 hover:bg-slate-50/80 rounded-lg px-1.5 transition-colors">
                    <div class="w-1/2 flex items-center gap-2 min-w-0">
                      <span class="w-6 h-6 rounded-full bg-[#EAF2FF] text-[#0062FF] font-extrabold text-[10px] flex items-center justify-center shrink-0">
                        0{{ item.kandidat.nomorUrut || 1 }}
                      </span>
                      <div class="min-w-0">
                        <div class="font-bold text-slate-900 truncate text-[11px] leading-tight">
                          {{ item.kandidat.namaKetua || 'Calon Ketua' }}
                        </div>
                        <div class="text-[10px] text-slate-500 truncate leading-tight">
                          Wakil: {{ item.kandidat.namaWakil }}
                        </div>
                      </div>
                    </div>
                    <div class="w-1/6 text-right font-bold text-slate-900 tabular-nums text-xs">
                      {{ item.jumlahSuara }} <span class="text-[10px] font-normal text-slate-400">suara</span>
                    </div>
                    <div class="w-1/6 text-right font-bold text-[#0062FF] tabular-nums text-xs">
                      {{ item.persentase }}%
                    </div>
                    <div class="w-1/6 text-right">
                      @if (item.jumlahSuara > 0) {
                        <span class="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                          Unggul
                        </span>
                      } @else {
                        <span class="text-[10px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md">
                          Aktif
                        </span>
                      }
                    </div>
                  </div>
                }

                <!-- Total Row Paslon -->
                <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span class="w-1/2 text-[11px] uppercase tracking-wider text-slate-400">TOTAL SUARA PASLON</span>
                  <span class="w-1/6 text-right tabular-nums text-slate-900">{{ votingService.totalSuaraPaslon() }} suara</span>
                  <span class="w-1/6 text-right tabular-nums text-[#0062FF]">100%</span>
                  <span class="w-1/6 text-right text-[10px] text-emerald-600 font-semibold">Sah</span>
                </div>
              } @else {
                <!-- Category: Wakil Siswi -->
                @for (item of votingService.hasilWakilSiswi(); track item.kandidat.id) {
                  <div class="flex items-center justify-between text-xs py-1.5 hover:bg-slate-50/80 rounded-lg px-1.5 transition-colors">
                    <div class="w-1/2 flex items-center gap-2 min-w-0">
                      <span class="w-6 h-6 rounded-full bg-purple-50 text-purple-700 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                        0{{ item.kandidat.nomorUrut || 1 }}
                      </span>
                      <div class="min-w-0">
                        <div class="font-bold text-slate-900 truncate text-[11px] leading-tight">
                          {{ item.kandidat.namaWakil || item.kandidat.namaKetua || 'Calon Wakil Siswi' }}
                        </div>
                        <div class="text-[10px] text-purple-600 truncate leading-tight font-medium">
                          Calon Wakil Ketua Siswi
                        </div>
                      </div>
                    </div>
                    <div class="w-1/6 text-right font-bold text-slate-900 tabular-nums text-xs">
                      {{ item.jumlahSuara }} <span class="text-[10px] font-normal text-slate-400">suara</span>
                    </div>
                    <div class="w-1/6 text-right font-bold text-purple-700 tabular-nums text-xs">
                      {{ item.persentase }}%
                    </div>
                    <div class="w-1/6 text-right">
                      @if (item.jumlahSuara > 0) {
                        <span class="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                          Unggul
                        </span>
                      } @else {
                        <span class="text-[10px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md">
                          Aktif
                        </span>
                      }
                    </div>
                  </div>
                }

                <!-- Total Row Wakil Siswi -->
                <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span class="w-1/2 text-[11px] uppercase tracking-wider text-slate-400">TOTAL SUARA WAKIL SISWI</span>
                  <span class="w-1/6 text-right tabular-nums text-slate-900">{{ votingService.totalSuaraWakilSiswi() }} suara</span>
                  <span class="w-1/6 text-right tabular-nums text-purple-700">100%</span>
                  <span class="w-1/6 text-right text-[10px] text-emerald-600 font-semibold">Sah</span>
                </div>
              }
            </div>

          </div>

        </div>

      </div>

      <!-- BAGIAN 1: PEROLEHAN SUARA PASANGAN CALON (KETUA & WAKIL PUTRA) -->
      <div class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-blue-50 text-[#0062FF] flex items-center justify-center font-bold">
              <mat-icon class="text-[20px] w-5 h-5">groups</mat-icon>
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-900 tracking-tight">
                Perolehan Suara Pasangan Calon Siswa (Putra)
              </h2>
              <p class="text-xs text-slate-400">
                Pemilihan Calon Ketua & Wakil Ketua OSIS Putra
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0062FF] border border-blue-100">
              Total {{ votingService.totalSuaraPaslon() }} Suara Masuk
            </span>
          </div>
        </div>

        @if (votingService.hasilPaslonSiswa().length === 0) {
          <div class="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-100">
            Belum ada pasangan calon siswa (putra) terdaftar.
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (item of votingService.hasilPaslonSiswa(); track item.kandidat.id) {
              <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <!-- Top Nomor Urut & Stats -->
                  <div class="flex items-start justify-between pb-3 border-b border-slate-50">
                    <div class="flex items-center gap-2">
                      <span class="w-8 h-8 rounded-xl bg-[#EAF2FF] text-[#0062FF] font-black text-sm flex items-center justify-center">
                        {{ (item.kandidat.nomorUrut !== undefined && item.kandidat.nomorUrut < 10) ? '0' + item.kandidat.nomorUrut : (item.kandidat.nomorUrut ?? '01') }}
                      </span>
                      <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        PASLON SISWA
                      </span>
                    </div>
                    <div class="text-right">
                      <div class="text-lg font-bold text-slate-900 tabular-nums">
                        {{ item.jumlahSuara }} <span class="text-xs font-normal text-slate-400">Suara</span>
                      </div>
                      <div class="text-xs font-semibold text-[#0062FF] tabular-nums">
                        {{ item.persentase }}%
                      </div>
                    </div>
                  </div>

                  <!-- Photos: Calon Ketua & Calon Wakil -->
                  <div class="grid grid-cols-2 gap-3 my-4">
                    <div class="space-y-1.5">
                      <div class="aspect-3/4 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-2xs">
                        <img 
                          [src]="item.kandidat.fotoKetua" 
                          [alt]="item.kandidat.namaKetua" 
                          referrerpolicy="no-referrer"
                          class="w-full h-full object-cover" />
                      </div>
                      <div class="text-[10px] font-semibold text-slate-400">Calon Ketua</div>
                      <div class="text-xs font-bold text-slate-800 leading-tight">
                        {{ item.kandidat.namaKetua }}
                      </div>
                    </div>

                    <div class="space-y-1.5">
                      <div class="aspect-3/4 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-2xs">
                        <img 
                          [src]="item.kandidat.fotoWakil" 
                          [alt]="item.kandidat.namaWakil" 
                          referrerpolicy="no-referrer"
                          class="w-full h-full object-cover" />
                      </div>
                      <div class="text-[10px] font-semibold text-slate-400">Calon Wakil</div>
                      <div class="text-xs font-bold text-slate-800 leading-tight">
                        {{ item.kandidat.namaWakil }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Progress Bar -->
                <div class="pt-3 border-t border-slate-50">
                  <div class="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span class="text-[11px]">Akumulasi Suara Masuk</span>
                    <span class="font-bold text-[#0062FF] tabular-nums">{{ item.persentase }}%</span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      class="bg-[#0062FF] h-2 rounded-full transition-all duration-300"
                      [style.width.%]="item.persentase">
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- BAGIAN 2: PEROLEHAN SUARA CALON WAKIL KETUA SISWI -->
      <div class="space-y-4 pt-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <mat-icon class="text-[20px] w-5 h-5">face_3</mat-icon>
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-900 tracking-tight">
                Perolehan Suara Calon Wakil Ketua Siswi
              </h2>
              <p class="text-xs text-slate-400">
                Pemilihan Khusus Calon Wakil Ketua OSIS Putri / Siswi
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
              Total {{ votingService.totalSuaraWakilSiswi() }} Suara Masuk
            </span>
          </div>
        </div>

        @if (votingService.hasilWakilSiswi().length === 0) {
          <div class="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-100">
            Belum ada calon wakil ketua siswi terdaftar.
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (item of votingService.hasilWakilSiswi(); track item.kandidat.id) {
              <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <!-- Top Nomor Urut & Stats -->
                  <div class="flex items-start justify-between pb-3 border-b border-slate-50">
                    <div class="flex items-center gap-2">
                      <span class="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 font-black text-sm flex items-center justify-center">
                        {{ (item.kandidat.nomorUrut !== undefined && item.kandidat.nomorUrut < 10) ? '0' + item.kandidat.nomorUrut : (item.kandidat.nomorUrut ?? '01') }}
                      </span>
                      <span class="text-xs font-bold text-purple-700 uppercase tracking-wider">
                        WAKIL SISWI
                      </span>
                    </div>
                    <div class="text-right">
                      <div class="text-lg font-bold text-slate-900 tabular-nums">
                        {{ item.jumlahSuara }} <span class="text-xs font-normal text-slate-400">Suara</span>
                      </div>
                      <div class="text-xs font-semibold text-purple-700 tabular-nums">
                        {{ item.persentase }}%
                      </div>
                    </div>
                  </div>

                  <!-- Photos: Calon Wakil Siswi (Single card with clear name) -->
                  <div class="max-w-[160px] mx-auto text-center space-y-2 my-4">
                    <div class="aspect-3/4 rounded-xl overflow-hidden bg-slate-50 border border-purple-100 shadow-2xs">
                      <img 
                        [src]="item.kandidat.fotoWakil" 
                        [alt]="item.kandidat.namaWakil" 
                        referrerpolicy="no-referrer"
                        class="w-full h-full object-cover" />
                    </div>
                    <div class="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full inline-block">
                      Calon Wakil Siswi
                    </div>
                    <!-- NAMA JELAS DAN SELALU TAMPIL -->
                    <div class="text-sm font-bold text-slate-900 leading-tight">
                      {{ item.kandidat.namaWakil || item.kandidat.namaKetua || 'Calon Wakil Siswi' }}
                    </div>
                  </div>
                </div>

                <!-- Progress Bar -->
                <div class="pt-3 border-t border-slate-50">
                  <div class="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span class="text-[11px]">Akumulasi Suara Masuk</span>
                    <span class="font-bold text-purple-700 tabular-nums">{{ item.persentase }}%</span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      class="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      [style.width.%]="item.persentase">
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- REKAPITULASI PARTISIPASI PER KELAS & LOG PEMILIH -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        <!-- Table: Rekap Per Kelas -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900">
              Partisipasi Per Kelas & Guru
            </h3>
            <span class="text-xs text-slate-400">
              {{ votingService.rekapPerKelas().length }} Rombel / Kategori
            </span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50/60 text-slate-400 font-medium border-b border-slate-100">
                <tr>
                  <th class="px-4 py-2.5">Kelas / Kategori</th>
                  <th class="px-4 py-2.5 text-right">DPT</th>
                  <th class="px-4 py-2.5 text-right">Sudah</th>
                  <th class="px-4 py-2.5 text-right">Persen</th>
                  <th class="px-4 py-2.5 w-24">Progress</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @if (votingService.rekapPerKelas().length === 0) {
                  <tr>
                    <td colspan="5" class="px-4 py-8 text-center text-slate-400">
                      Belum ada data pemilih.
                    </td>
                  </tr>
                } @else {
                  @for (row of votingService.rekapPerKelas(); track row.kelas) {
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="px-4 py-3 font-bold text-slate-800">{{ row.kelas }}</td>
                      <td class="px-4 py-3 text-right text-slate-600 tabular-nums">{{ row.total }}</td>
                      <td class="px-4 py-3 text-right font-semibold text-[#10B981] tabular-nums">{{ row.sudah }}</td>
                      <td class="px-4 py-3 text-right font-bold text-slate-800 tabular-nums">{{ row.persentase }}%</td>
                      <td class="px-4 py-3">
                        <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div class="bg-[#0062FF] h-1.5 rounded-full" [style.width.%]="row.persentase"></div>
                        </div>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Table: Log Pemilih Terkini -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900">
              Log Suara Terakhir
            </h3>
            <span class="text-xs text-slate-400">
              {{ votingService.suaraLog().length }} Riwayat Sah
            </span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50/60 text-slate-400 font-medium border-b border-slate-100">
                <tr>
                  <th class="px-4 py-2.5">Waktu</th>
                  <th class="px-4 py-2.5">Nama Pemilih</th>
                  <th class="px-4 py-2.5">Kelas</th>
                  <th class="px-4 py-2.5">Pilihan</th>
                  <th class="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @if (votingService.suaraLog().length === 0) {
                  <tr>
                    <td colspan="5" class="px-4 py-8 text-center text-slate-400">
                      Belum ada suara yang masuk.
                    </td>
                  </tr>
                } @else {
                  @for (log of votingService.suaraLog().slice(0, 7); track log.id) {
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="px-4 py-3 text-slate-400 tabular-nums text-[11px]">{{ log.timestamp }}</td>
                      <td class="px-4 py-3 font-semibold text-slate-800">{{ log.siswaNama }}</td>
                      <td class="px-4 py-3 text-slate-500">{{ log.kelas }}</td>
                      <td class="px-4 py-3 text-slate-700 font-medium text-[11px]">
                        {{ getNamaPilihanLog(log) }}
                      </td>
                      <td class="px-4 py-3 text-right">
                        <span class="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                          Sah
                        </span>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  `
})
export class DashboardComponent {
  readonly votingService = inject(VotingService);

  readonly activeCategory = signal<'paslon' | 'wakil_siswi'>('paslon');

  readonly chartPoints = computed(() => {
    const isPaslon = this.activeCategory() === 'paslon';
    const list = isPaslon ? this.votingService.hasilPaslonSiswa() : this.votingService.hasilWakilSiswi();
    
    if (list.length === 0) {
      return [
        { x: 50, y: 190, label: '01' },
        { x: 500, y: 190, label: '02' },
        { x: 950, y: 190, label: '03' }
      ];
    }

    const step = 900 / Math.max(list.length - 1, 1);
    return list.map((item, idx) => {
      const x = 50 + (idx * step);
      // Map percentage (0-100%) to SVG height (220 to 30)
      const y = Math.round(220 - (item.persentase * 1.8));
      return {
        x: Math.min(Math.max(x, 50), 960),
        y: Math.min(Math.max(y, 30), 220),
        label: `0${item.kandidat.nomorUrut || idx + 1}`
      };
    });
  });

  readonly svgLinePath = computed(() => {
    const pts = this.chartPoints();
    if (pts.length === 0) return 'M 50 190 L 960 190';
    if (pts.length === 1) return `M 50 ${pts[0].y} L 960 ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 2;
      const cp1y = curr.y;
      const cp2x = curr.x + (next.x - curr.x) / 2;
      const cp2y = next.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    return path;
  });

  readonly svgAreaPath = computed(() => {
    const pts = this.chartPoints();
    if (pts.length === 0) return 'M 50 190 L 960 190 L 960 240 L 50 240 Z';
    const line = this.svgLinePath();
    const lastX = pts[pts.length - 1].x;
    const firstX = pts[0].x;
    return `${line} L ${lastX} 240 L ${firstX} 240 Z`;
  });

  getNamaPilihanLog(log: SuaraLog): string {
    const kand = this.votingService.kandidat().find(k => k.id === log.kandidatId);
    if (!kand) {
      return log.nomorUrut ? `Kandidat No. ${log.nomorUrut}` : 'Suara Sah';
    }
    if (kand.jenisKandidat === 'wakil_siswi') {
      const nama = kand.namaWakil || kand.namaKetua || 'Wakil Siswi';
      return `Wakil Siswi: ${nama}`;
    }
    return `Paslon 0${kand.nomorUrut ?? 1}: ${kand.namaKetua || kand.namaWakil}`;
  }

  onResetSuara(): void {
    if (confirm('Konfirmasi: Reset seluruh suara yang masuk? Data siswa dan kandidat tetap disimpan.')) {
      this.votingService.resetPemungutanSuara();
    }
  }
}
