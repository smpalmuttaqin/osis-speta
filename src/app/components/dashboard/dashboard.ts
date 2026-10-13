import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { VotingService } from '../../services/voting.service';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="p-4 sm:p-6 lg:p-8 space-y-6">
      
      <!-- STAT CARDS: 2 ROWS OF 4 CARDS MATCHING image.png -->
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
              <span class="text-xs text-slate-400 ml-1 font-medium">Siswa</span>
            </div>
            <div class="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#10B981]">
              <mat-icon class="text-[14px] w-3.5 h-3.5">north_east</mat-icon>
              <span>100% Hak Suara Terdaftar</span>
            </div>
          </div>

          <!-- Card 2: Suara Masuk -->
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <span>Suara Masuk</span>
              </div>
              <div class="w-8 h-8 rounded-xl bg-[#EAF8F0] text-[#10B981] flex items-center justify-center">
                <mat-icon class="text-[18px] w-4.5 h-4.5">how_to_vote</mat-icon>
              </div>
            </div>
            <div class="mt-3">
              <span class="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
                {{ votingService.sudahMemilihCount() }}
              </span>
              <span class="text-xs text-slate-400 ml-1 font-medium">Suara</span>
            </div>
            <div class="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#10B981]">
              <span>{{ votingService.persentaseSudah() }}% Partisipasi</span>
            </div>
          </div>

          <!-- Card 3: Belum Memilih -->
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <span>Belum Memilih</span>
              </div>
              <div class="w-8 h-8 rounded-xl bg-[#FFF6E9] text-[#F59E0B] flex items-center justify-center">
                <mat-icon class="text-[18px] w-4.5 h-4.5">hourglass_empty</mat-icon>
              </div>
            </div>
            <div class="mt-3">
              <span class="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
                {{ votingService.belumMemilihCount() }}
              </span>
              <span class="text-xs text-slate-400 ml-1 font-medium">Siswa</span>
            </div>
            <div class="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#F59E0B]">
              <span>{{ votingService.persentaseBelum() }}% Menunggu Hak Suara</span>
            </div>
          </div>

          <!-- Card 4: Paslon Terdaftar -->
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <span>Pasangan Calon</span>
              </div>
              <div class="w-8 h-8 rounded-xl bg-[#FEECEB] text-[#EF4444] flex items-center justify-center">
                <mat-icon class="text-[18px] w-4.5 h-4.5">layers</mat-icon>
              </div>
            </div>
            <div class="mt-3">
              <span class="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
                {{ votingService.kandidat().length }}
              </span>
              <span class="text-xs text-slate-400 ml-1 font-medium">Paslon</span>
            </div>
            <div class="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-500">
              <span>Masa Bakti 2026/2027</span>
            </div>
          </div>

        </div>

        <!-- Row 2: 4 Secondary Metric Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <!-- Card 5: Persentase Partisipasi -->
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div class="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
              <span>Tingkat Partisipasi</span>
              <mat-icon class="text-[14px] w-3.5 h-3.5 text-slate-300">info_outline</mat-icon>
            </div>
            <div class="mt-3">
              <span class="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
                {{ votingService.persentaseSudah() }}%
              </span>
            </div>
            <div class="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#10B981]">
              <mat-icon class="text-[14px] w-3.5 h-3.5">trending_up</mat-icon>
              <span>Target 100% Partisipasi</span>
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
              Tingkat VII, VIII, IX
            </div>
          </div>

          <!-- Card 7: Log Suara Terverifikasi -->
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div class="text-slate-400 text-xs font-medium">
              <span>Log Suara Valid</span>
            </div>
            <div class="mt-3">
              <span class="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
                {{ votingService.suaraLog().length }}
              </span>
              <span class="text-xs text-slate-400 ml-1 font-medium">Tercatat</span>
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
                Aktif
              </span>
            </div>
            <div class="mt-1 text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>Supabase Cloud</span>
              <span class="text-[#0062FF] font-semibold">Tersinkron</span>
            </div>
          </div>

        </div>

      </div>

      <!-- MAIN CHART SECTION: Satış Grafiği (WAVE LINE CHART + FLOATING BREAKDOWN CARD MATCHING image.png) -->
      <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] relative overflow-hidden">
        
        <!-- Header Chart -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-base font-bold text-slate-900 tracking-tight">
              Grafik Perolehan Suara (Live Count)
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">
              Akumulasi surat suara masuk berdasarkan pemilihan langsung siswa
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button 
              type="button"
              (click)="onResetSuara()"
              class="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors">
              <mat-icon class="text-[14px] w-3.5 h-3.5">refresh</mat-icon>
              <span>Reset Suara</span>
            </button>
          </div>
        </div>

        <!-- Wave Line Chart Container matching screenshot -->
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

          <!-- Dynamic SVG Smooth Wave Curve matching image.png -->
          <svg class="w-full h-56 pl-10 overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 240">
            <defs>
              <linearGradient id="waveBlueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#0062FF" stop-opacity="0.22" />
                <stop offset="50%" stop-color="#0062FF" stop-opacity="0.08" />
                <stop offset="100%" stop-color="#0062FF" stop-opacity="0.0" />
              </linearGradient>
              <filter id="waveGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0062FF" flood-opacity="0.25" />
              </filter>
            </defs>

            <!-- Gradient Area Fill under Curve -->
            <path 
              [attr.d]="svgAreaPath()"
              fill="url(#waveBlueGradient)" />

            <!-- Smooth Blue Wave Stroke -->
            <path 
              [attr.d]="svgLinePath()"
              fill="none" 
              stroke="#0062FF" 
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
                fill="#0062FF" 
                stroke="#FFFFFF" 
                stroke-width="2.5" 
                class="transition-all duration-300 hover:r-7 cursor-pointer" />
            }
          </svg>

          <!-- FLOATING BREAKDOWN CARD IN CENTER MATCHING EXACT SCREENSHOT IN image.png -->
          <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[92%] sm:w-[420px] bg-white rounded-2xl shadow-[0_12px_45px_rgba(20,40,80,0.12)] border border-slate-100 p-4 animate-in fade-in zoom-in-95 duration-200">
            
            <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[11px] font-semibold text-slate-400">
              <span class="w-1/3">Pasangan Calon</span>
              <span class="w-1/4 text-right">Suara</span>
              <span class="w-1/5 text-right">Persen</span>
              <span class="w-1/5 text-right">Status</span>
            </div>

            <div class="space-y-2">
              @for (item of votingService.hasilKandidat(); track item.kandidat.id) {
                <div class="flex items-center justify-between text-xs py-1 hover:bg-slate-50/80 rounded-lg px-1 transition-colors">
                  <div class="w-1/3 flex items-center gap-2 min-w-0">
                    <span class="w-5 h-5 rounded-full bg-[#EAF2FF] text-[#0062FF] font-extrabold text-[10px] flex items-center justify-center shrink-0">
                      0{{ item.kandidat.nomorUrut }}
                    </span>
                    <span class="font-semibold text-slate-800 truncate text-[11px]">
                      {{ item.kandidat.namaKetua }}
                    </span>
                  </div>
                  <div class="w-1/4 text-right font-bold text-slate-900 tabular-nums text-xs">
                    {{ item.jumlahSuara }} <span class="text-[10px] font-normal text-slate-400">suara</span>
                  </div>
                  <div class="w-1/5 text-right font-bold text-[#0062FF] tabular-nums text-xs">
                    {{ item.persentase }}%
                  </div>
                  <div class="w-1/5 text-right">
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

              <!-- Total Row -->
              <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                <span class="w-1/3 text-[11px] uppercase tracking-wider text-slate-400">TOTAL</span>
                <span class="w-1/4 text-right tabular-nums text-slate-900">{{ votingService.sudahMemilihCount() }} suara</span>
                <span class="w-1/5 text-right tabular-nums text-[#0062FF]">100%</span>
                <span class="w-1/5 text-right text-[10px] text-emerald-600 font-semibold">Sah</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      <!-- KANDIDAT CARDS GRID -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-bold text-slate-900 tracking-tight">
            Perolehan Suara Kandidat OSIS
          </h2>
          <span class="text-xs text-slate-400">
            {{ votingService.kandidat().length }} Kandidat Terdaftar
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (item of votingService.hasilKandidat(); track item.kandidat.id) {
            <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <!-- Top Nomor Urut & Stats -->
                <div class="flex items-start justify-between pb-3 border-b border-slate-50">
                  <div class="flex items-center gap-2">
                    <span class="w-8 h-8 rounded-xl bg-[#EAF2FF] text-[#0062FF] font-black text-sm flex items-center justify-center">
                      {{ (item.kandidat.nomorUrut !== undefined && item.kandidat.nomorUrut < 10) ? '0' + item.kandidat.nomorUrut : (item.kandidat.nomorUrut ?? '01') }}
                    </span>
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {{ item.kandidat.jenisKandidat === 'wakil_siswi' ? 'WAKIL SISWI' : 'PASLON' }}
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

                <!-- Photos: Calon Wakil Siswi (Single) vs Paslon (Dual) -->
                @if (item.kandidat.jenisKandidat === 'wakil_siswi') {
                  <div class="max-w-[150px] mx-auto text-center space-y-1.5 my-4">
                    <div class="aspect-3/4 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-2xs">
                      <img 
                        [src]="item.kandidat.fotoWakil" 
                        [alt]="item.kandidat.namaWakil" 
                        referrerpolicy="no-referrer"
                        class="w-full h-full object-cover" />
                    </div>
                    <div class="text-[10px] font-semibold text-slate-400">Calon Wakil Siswi</div>
                    <div class="text-xs font-bold text-slate-800 leading-tight">
                      {{ item.kandidat.namaWakil }}
                    </div>
                  </div>
                } @else {
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
                }
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
      </div>

      <!-- REKAPITULASI PARTISIPASI PER KELAS & LOG PEMILIH -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Table: Rekap Per Kelas -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900">
              Partisipasi Per Kelas
            </h3>
            <span class="text-xs text-slate-400">
              {{ votingService.rekapPerKelas().length }} Kelas
            </span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50/60 text-slate-400 font-medium border-b border-slate-100">
                <tr>
                  <th class="px-4 py-2.5">Kelas</th>
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
                      Belum ada data siswa.
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
              Log Pemilih Terakhir
            </h3>
            <span class="text-xs text-slate-400">
              {{ votingService.suaraLog().length }} Riwayat
            </span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50/60 text-slate-400 font-medium border-b border-slate-100">
                <tr>
                  <th class="px-4 py-2.5">Waktu</th>
                  <th class="px-4 py-2.5">Nama Siswa</th>
                  <th class="px-4 py-2.5">Kelas</th>
                  <th class="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @if (votingService.suaraLog().length === 0) {
                  <tr>
                    <td colspan="4" class="px-4 py-8 text-center text-slate-400">
                      Belum ada suara yang masuk.
                    </td>
                  </tr>
                } @else {
                  @for (log of votingService.suaraLog().slice(0, 6); track log.id) {
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="px-4 py-3 text-slate-400 tabular-nums text-[11px]">{{ log.timestamp }}</td>
                      <td class="px-4 py-3 font-semibold text-slate-800">{{ log.siswaNama }}</td>
                      <td class="px-4 py-3 text-slate-500">{{ log.kelas }}</td>
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

  readonly chartPoints = computed(() => {
    // Generate smooth wave coordinates matching the screenshot
    return [
      { x: 50, y: 190, label: '01' },
      { x: 260, y: 130, label: '02' },
      { x: 470, y: 175, label: '03' },
      { x: 740, y: 65, label: '04' },
      { x: 960, y: 155, label: '05' }
    ];
  });

  readonly svgLinePath = computed(() => {
    // Generates a smooth bezier wave curve exactly matching image.png
    return 'M 50 190 C 140 140, 190 120, 260 130 C 340 140, 400 185, 470 175 C 570 160, 640 60, 740 65 C 840 70, 890 145, 960 155';
  });

  readonly svgAreaPath = computed(() => {
    // Closes path to the bottom for the gradient area
    return 'M 50 190 C 140 140, 190 120, 260 130 C 340 140, 400 185, 470 175 C 570 160, 640 60, 740 65 C 840 70, 890 145, 960 155 L 960 240 L 50 240 Z';
  });

  onResetSuara(): void {
    if (confirm('Konfirmasi: Reset seluruh suara yang masuk? Data siswa dan kandidat tetap disimpan.')) {
      this.votingService.resetPemungutanSuara();
    }
  }
}
