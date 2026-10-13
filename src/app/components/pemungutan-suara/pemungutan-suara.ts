import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { Kandidat, Siswa } from '../../models/voting.models';
import { VotingService, dapatMemilihKandidat, getUnsurPemilih } from '../../services/voting.service';

@Component({
  selector: 'app-pemungutan-suara',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      <!-- ========================================================= -->
      <!-- TAHAP 1: STANDBY / LAYAR KOSONG DENGAN TOMBOL MULAI      -->
      <!-- ========================================================= -->
      @if (tahap() === 'standby') {
        <div class="min-h-[75vh] flex flex-col items-center justify-center text-center p-6 sm:p-12 relative overflow-hidden">
          
          <!-- Subtle Decorative Background Circles -->
          <div class="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none"></div>

          <!-- Main Standby Card -->
          <div class="relative z-10 max-w-xl w-full bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col items-center space-y-7 animate-in fade-in zoom-in-95 duration-300">
            
            <!-- School Brand / Logo -->
            <div class="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-100 p-3 shadow-xs flex items-center justify-center">
              <img 
                src="/logo_smp_al_muttaqin.png" 
                alt="Logo SMP Al Muttaqin" 
                referrerpolicy="no-referrer"
                class="w-full h-full object-contain" />
            </div>

            <!-- Title & Subtitle -->
            <div class="space-y-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-blue-50 text-[#0062FF] border border-blue-100">
                <mat-icon class="text-[14px] w-3.5 h-3.5">how_to_vote</mat-icon>
                Bilik Suara Elektronik
              </span>
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                Pemilihan OSIS SMP Al Muttaqin
              </h1>
              <p class="text-xs sm:text-sm text-slate-500 font-medium">
                OSIS SMP AL MUTTAQIN · Periode 2026/2027
              </p>
            </div>

            <!-- Big Centered Start Button -->
            <div class="pt-2 w-full flex flex-col items-center gap-3">
              <button 
                type="button"
                (click)="bukaModalVerifikasi()"
                class="w-full sm:w-auto px-10 py-5 bg-[#0062FF] hover:bg-[#0052D9] active:scale-98 text-white text-base sm:text-lg font-bold rounded-2xl shadow-[0_10px_30px_rgba(0,98,255,0.35)] hover:shadow-[0_14px_40px_rgba(0,98,255,0.45)] hover:scale-102 transition-all flex items-center justify-center gap-3 cursor-pointer">
                <mat-icon class="text-[28px] w-7 h-7">play_arrow</mat-icon>
                <span class="tracking-wide">MULAI MEMILIH</span>
              </button>
              
              <p class="text-[11px] text-slate-400 max-w-sm">
                Tekan tombol <b>Mulai Memilih</b> untuk memverifikasi tanggal lahir pemilih sebelum masuk ke bilik suara.
              </p>
            </div>

            <!-- Voter Statistics Badge -->
            <div class="pt-4 border-t border-slate-100 w-full flex items-center justify-between text-xs text-slate-500">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="font-medium">Bilik Siap Digunakan</span>
              </div>
              <div class="font-semibold text-slate-700">
                Tersisa <span class="text-[#0062FF] font-bold">{{ votingService.belumMemilihCount() }}</span> pemilih
              </div>
            </div>

          </div>

        </div>
      }

      <!-- ========================================================= -->
      <!-- TAHAP 2: DI DALAM BILIK SUARA (KARTU SISWA & PILIH KANDIDAT) -->
      <!-- ========================================================= -->
      @if (tahap() === 'bilik_suara' && activeSiswa()) {
        <div class="space-y-7 animate-in fade-in duration-200">
          
          <!-- Top Header Navigation -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div class="flex items-center gap-3">
              <img 
                src="/logo_smp_al_muttaqin.png" 
                alt="Logo SMP Al Muttaqin" 
                referrerpolicy="no-referrer"
                class="w-8 h-8 object-contain" />
              <div>
                <h1 class="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
                  Bilik Suara Pemilihan OSIS
                </h1>
                <p class="text-xs text-slate-400">
                  SMP AL MUTTAQIN · Hak Suara Rahasia & Sah
                </p>
              </div>
            </div>

            <!-- Exit booth button -->
            <button 
              type="button"
              (click)="konfirmasiKeluarBilik()"
              class="self-start sm:self-auto px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer">
              <mat-icon class="text-[16px] w-4 h-4 text-slate-400">logout</mat-icon>
              <span>Keluar dari Bilik</span>
            </button>
          </div>

          <!-- KARTU DATA DIRI PEMILIH DAN FOTONYA -->
          <div class="bg-white border-2 border-blue-100 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-blue-50/60 rounded-bl-full pointer-events-none"></div>

            <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              
              <!-- Left: Foto & Identitas -->
              <div class="flex items-center gap-4 sm:gap-5">
                <!-- Pas Foto Pemilih -->
                <div class="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 border-2 border-[#0062FF]/20 shadow-xs shrink-0">
                  <img 
                    [src]="activeSiswa()!.pasFoto" 
                    [alt]="activeSiswa()!.namaLengkap"
                    referrerpolicy="no-referrer"
                    class="w-full h-full object-cover" />
                  <div class="absolute bottom-0 inset-x-0 bg-slate-900/70 py-0.5 text-center">
                    <span class="text-[9px] font-bold text-white tracking-widest uppercase">PEMILIH</span>
                  </div>
                </div>

                <!-- Bio Pemilih -->
                <div class="space-y-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="px-2 py-0.5 bg-blue-50 text-[#0062FF] border border-blue-100 text-[10px] font-bold rounded-md">
                      HAK SUARA AKTIF
                    </span>
                    @let u = getLabelUnsur(activeSiswa()!);
                    @if (u === 'guru') {
                      <span class="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold rounded-md">
                        Unsur: Guru
                      </span>
                    } @else if (u === 'yayasan') {
                      <span class="px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold rounded-md">
                        Unsur: Yayasan
                      </span>
                    } @else {
                      <span class="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold rounded-md">
                        Unsur: Siswa
                      </span>
                    }
                    <span class="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md">
                      Kelas: {{ activeSiswa()!.kelas }}
                    </span>
                    @if (activeSiswa()!.jenisKelamin) {
                      <span class="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md">
                        {{ activeSiswa()!.jenisKelamin }}
                      </span>
                    }
                  </div>
                  <h2 class="text-base sm:text-xl font-black text-slate-900 leading-tight">
                    {{ activeSiswa()!.namaLengkap }}
                  </h2>
                  <div class="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                    <span>{{ activeSiswa()!.tempatLahir }}, {{ formatTanggal(activeSiswa()!.tanggalLahir) }}</span>
                  </div>
                </div>
              </div>

              <!-- Right: Verification Status Badge & Voting Rights Badge -->
              <div class="flex flex-col sm:items-end gap-1.5 self-start md:self-center">
                <div class="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 rounded-xl px-4 py-2">
                  <mat-icon class="text-emerald-600 text-[20px] w-5 h-5 shrink-0">verified</mat-icon>
                  <div class="text-left">
                    <span class="text-xs font-bold text-emerald-800 block">Identitas Terverifikasi</span>
                    <span class="text-[11px] text-emerald-600 block">Silakan gunakan hak suara Anda</span>
                  </div>
                </div>
                <div class="text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1">
                  @if (bisaMemilihWakilSiswi(activeSiswa()!)) {
                    <span class="text-blue-700 font-bold">Hak Pilih Penuh: <b>Langkah 1 (Paslon) + Langkah 2 (Wakil Siswi)</b></span>
                  } @else {
                    <span>Hak Pilih: <b>Pasangan Calon (Ketua & Wakil)</b></span>
                  }
                </div>
              </div>

            </div>
          </div>

          <!-- ALUR WIZARD: STEPPER JIKA PEMILIH MEMILIKI HAK PILIH WAKIL SISWI -->
          @if (bisaMemilihWakilSiswi(activeSiswa()!)) {
            <div class="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              
              <div class="flex items-center gap-2 sm:gap-4 flex-1">
                <!-- Step 1 -->
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-xs transition-colors"
                       [class.bg-[#0062FF]]="bilikTahap() === 'pilih_paslon'"
                       [class.text-white]="bilikTahap() === 'pilih_paslon'"
                       [class.bg-emerald-600]="bilikTahap() === 'pilih_wakil_siswi'"
                       [class.text-white]="bilikTahap() === 'pilih_wakil_siswi'">
                    @if (bilikTahap() === 'pilih_wakil_siswi') {
                      <mat-icon class="text-[16px] w-4 h-4">check</mat-icon>
                    } @else {
                      1
                    }
                  </div>
                  <div>
                    <span class="text-xs font-bold block" [class.text-[#0062FF]]="bilikTahap() === 'pilih_paslon'" [class.text-slate-900]="bilikTahap() === 'pilih_wakil_siswi'">
                      Langkah 1: Paslon OSIS
                    </span>
                    <span class="text-[10px] text-slate-500 block">
                      {{ selectedPaslon() ? 'Paslon No. ' + selectedPaslon()!.nomorUrut + ' Terpilih' : 'Pilih Ketua & Wakil' }}
                    </span>
                  </div>
                </div>

                <mat-icon class="text-slate-300 text-[18px] w-4 h-4 shrink-0">arrow_forward</mat-icon>

                <!-- Step 2 -->
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-xs transition-colors"
                       [class.bg-[#0062FF]]="bilikTahap() === 'pilih_wakil_siswi'"
                       [class.text-white]="bilikTahap() === 'pilih_wakil_siswi'"
                       [class.bg-slate-200]="bilikTahap() === 'pilih_paslon'"
                       [class.text-slate-600]="bilikTahap() === 'pilih_paslon'">
                    2
                  </div>
                  <div>
                    <span class="text-xs font-bold block" [class.text-[#0062FF]]="bilikTahap() === 'pilih_wakil_siswi'" [class.text-slate-400]="bilikTahap() === 'pilih_paslon'">
                      Langkah 2: Wakil Siswi
                    </span>
                    <span class="text-[10px] text-slate-500 block">
                      {{ bilikTahap() === 'pilih_wakil_siswi' ? 'Sedang Dipilih' : 'Pilih Setelah Langkah 1' }}
                    </span>
                  </div>
                </div>
              </div>

              @if (bilikTahap() === 'pilih_wakil_siswi') {
                <button 
                  type="button"
                  (click)="kembaliKePilihPaslon()"
                  class="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors shadow-2xs">
                  <mat-icon class="text-[16px] w-4 h-4 text-blue-600">arrow_back</mat-icon>
                  <span>Ubah Pilihan Paslon</span>
                </button>
              }

            </div>
          }

          <!-- SURAT SUARA ELEKTRONIK: KANDIDAT YANG TERSEDIA -->
          <div class="space-y-6 pt-1">
            
            <!-- TAHAP 1: Pasangan Calon Ketua & Wakil (Regular Paslon) -->
            @if (bilikTahap() === 'pilih_paslon') {
              <div class="space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#0062FF] text-white">
                        {{ bisaMemilihWakilSiswi(activeSiswa()!) ? 'LANGKAH 1 DARI 2' : 'SURAT SUARA UTAMA' }}
                      </span>
                      <h3 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5">
                        <mat-icon class="text-[#0062FF] text-[20px] w-5 h-5">how_to_vote</mat-icon>
                        Surat Suara Pasangan Calon (Ketua & Wakil)
                      </h3>
                    </div>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Pilih salah satu pasangan calon ketua dan wakil ketua OSIS{{ bisaMemilihWakilSiswi(activeSiswa()!) ? ', setelah itu Anda akan memilih Calon Wakil Ketua Siswi.' : '.' }}
                    </p>
                  </div>
                  <span class="text-xs font-semibold text-slate-400">
                    {{ regularKandidat().length }} Paslon Terdaftar
                  </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  @for (k of regularKandidat(); track k.id) {
                    <div class="bg-white border-2 border-slate-200 hover:border-[#0062FF] rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-lg group">
                      
                      <div class="p-6">
                        <!-- Nomor Urut Paslon -->
                        <div class="text-center pb-4 mb-4 border-b border-slate-100">
                          <span class="text-[11px] font-bold text-slate-400 tracking-wider block">PASANGAN CALON</span>
                          <div class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mt-1 group-hover:text-[#0062FF] transition-colors">
                            {{ (k.nomorUrut !== undefined && k.nomorUrut < 10) ? '0' + k.nomorUrut : k.nomorUrut }}
                          </div>
                        </div>

                        <!-- Foto Ketua & Wakil -->
                        <div class="grid grid-cols-2 gap-3 mb-4">
                          <!-- Ketua -->
                          <div class="space-y-2">
                            <div class="aspect-3/4 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs">
                              <img 
                                [src]="k.fotoKetua" 
                                [alt]="k.namaKetua"
                                referrerpolicy="no-referrer"
                                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                            <div>
                              <span class="text-[10px] font-semibold text-slate-400 block">Calon Ketua</span>
                              <span class="text-xs font-bold text-slate-900 leading-snug block line-clamp-2">{{ k.namaKetua }}</span>
                            </div>
                          </div>

                          <!-- Wakil -->
                          <div class="space-y-2">
                            <div class="aspect-3/4 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs">
                              <img 
                                [src]="k.fotoWakil" 
                                [alt]="k.namaWakil"
                                referrerpolicy="no-referrer"
                                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                            <div>
                              <span class="text-[10px] font-semibold text-slate-400 block">Calon Wakil</span>
                              <span class="text-xs font-bold text-slate-900 leading-snug block line-clamp-2">{{ k.namaWakil }}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Tombol Coblos Paslon -->
                      <div class="p-6 pt-0">
                        <button 
                          type="button"
                          (click)="pilihPaslon(k)"
                          class="w-full py-4 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#0062FF] hover:bg-[#0052D9] active:scale-98 text-white flex items-center justify-center gap-2 transition-all shadow-[0_4px_16px_rgba(0,98,255,0.25)] hover:shadow-[0_6px_20px_rgba(0,98,255,0.35)] cursor-pointer">
                          <mat-icon class="text-[20px] w-5 h-5">check_circle</mat-icon>
                          <span>PILIH PASLON {{ (k.nomorUrut !== undefined && k.nomorUrut < 10) ? '0' + k.nomorUrut : k.nomorUrut }}</span>
                        </button>
                      </div>

                    </div>
                  }
                </div>
              </div>
            }

            <!-- TAHAP 2: Calon Wakil Ketua Siswi -->
            @if (bilikTahap() === 'pilih_wakil_siswi') {
              <div class="space-y-4">
                
                <!-- Info Pilihan Paslon Sebelumnya -->
                @if (selectedPaslon()) {
                  <div class="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs shadow-2xs">
                    <div class="flex items-center gap-2.5">
                      <mat-icon class="text-emerald-600 text-[20px] w-5 h-5 shrink-0">task_alt</mat-icon>
                      <span class="text-emerald-950 font-medium">
                        Pilihan Paslon 1: <b>Paslon Nomor {{ selectedPaslon()!.nomorUrut }} ({{ selectedPaslon()!.namaKetua }} & {{ selectedPaslon()!.namaWakil }})</b>
                      </span>
                    </div>
                    <button 
                      type="button"
                      (click)="kembaliKePilihPaslon()"
                      class="text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer text-xs shrink-0">
                      Ubah Paslon
                    </button>
                  </div>
                }

                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600 text-white">
                        LANGKAH 2 DARI 2
                      </span>
                      <h3 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5">
                        <mat-icon class="text-blue-600 text-[20px] w-5 h-5">person</mat-icon>
                        Surat Suara Calon Wakil Ketua Siswi
                      </h3>
                    </div>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Pilih calon wakil ketua siswi pilihan Anda untuk menyelesaikan seluruh proses pemungutan suara.
                    </p>
                  </div>
                  <span class="text-xs font-semibold text-slate-400">
                    {{ wakilSiswiKandidat().length }} Kandidat Siswi Terdaftar
                  </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  @for (k of wakilSiswiKandidat(); track k.id) {
                    <div class="bg-white border-2 border-slate-200 hover:border-blue-600 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-lg group">
                      
                      <div class="p-6">
                        <div class="text-center pb-4 mb-4 border-b border-slate-100">
                          <span class="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0062FF] border border-blue-100 mb-1">
                            CALON WAKIL SISWI
                          </span>
                          <span class="text-[11px] font-semibold text-slate-400 tracking-wider block">NOMOR URUT</span>
                          <div class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-0.5 group-hover:text-blue-600 transition-colors">
                            {{ (k.nomorUrut !== undefined && k.nomorUrut < 10) ? '0' + k.nomorUrut : (k.nomorUrut ?? '01') }}
                          </div>
                        </div>

                        <!-- Foto Wakil Siswi -->
                        <div class="max-w-[180px] mx-auto text-center space-y-2 mb-4">
                          <div class="aspect-3/4 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs">
                            <img 
                              [src]="k.fotoWakil" 
                              [alt]="k.namaWakil"
                              referrerpolicy="no-referrer"
                              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <div>
                            <span class="text-[10px] font-semibold text-slate-400 block">Calon Wakil Siswi</span>
                            <span class="text-xs font-bold text-slate-900 leading-snug block">{{ k.namaWakil }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Tombol Coblos Wakil Siswi -->
                      <div class="p-6 pt-0">
                        <button 
                          type="button"
                          (click)="pilihWakilSiswi(k)"
                          class="w-full py-4 px-4 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 active:scale-98 text-white flex items-center justify-center gap-2 transition-all shadow-[0_4px_16px_rgba(37,99,235,0.25)] cursor-pointer">
                          <mat-icon class="text-[20px] w-5 h-5">check_circle</mat-icon>
                          <span>PILIH WAKIL SISWI {{ (k.nomorUrut !== undefined && k.nomorUrut < 10) ? '0' + k.nomorUrut : (k.nomorUrut || '') }}</span>
                        </button>
                      </div>

                    </div>
                  }
                </div>
              </div>
            }

            @if (availableKandidat().length === 0) {
              <div class="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
                <mat-icon class="text-slate-400 text-[36px] w-9 h-9 mx-auto">layers_clear</mat-icon>
                <p class="text-xs text-slate-500 font-medium">
                  Tidak ada kandidat yang tersedia untuk hak suara Anda saat ini.
                </p>
              </div>
            }

          </div>

        </div>
      }

      <!-- ========================================================= -->
      <!-- MODAL POPUP VERIFIKASI PEMILIH (MEMASUKKAN TANGGAL LAHIR) -->
      <!-- ========================================================= -->
      @if (showVerifikasiModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
            
            <!-- Modal Header -->
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-blue-50 text-[#0062FF] flex items-center justify-center">
                  <mat-icon class="text-[20px] w-5 h-5">verified_user</mat-icon>
                </div>
                <div>
                  <h2 class="text-sm sm:text-base font-bold text-slate-900">
                    Verifikasi Pemilih
                  </h2>
                  <p class="text-[11px] text-slate-400">
                    Masukkan tanggal lahir pemilih untuk verifikasi DPT
                  </p>
                </div>
              </div>

              <button 
                type="button" 
                (click)="tutupModalVerifikasi()"
                class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                <mat-icon class="text-[20px] w-5 h-5">close</mat-icon>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-6 space-y-4">
              
              <!-- 1. Input Tanggal Lahir Pemilih -->
              <div>
                <label for="inputTglLahir" class="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tanggal Lahir Pemilih <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <input 
                    id="inputTglLahir"
                    type="date"
                    [value]="inputTanggalLahir()"
                    (change)="onTanggalLahirChange($event)"
                    (input)="onTanggalLahirChange($event)"
                    class="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0062FF] transition-all shadow-2xs" />
                </div>
                <p class="text-[11px] text-slate-400 mt-1">
                  Pilih tanggal lahir pemilih sesuai data yang terdaftar di sekolah.
                </p>
              </div>

              <!-- 2. Pilih Nama Siswa -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label for="selectSiswaModal" class="block text-xs font-semibold text-slate-700">
                    Nama Siswa / Pemilih
                  </label>
                  @if (inputTanggalLahir() && normalizeDate(inputTanggalLahir())) {
                    <span class="text-[11px] font-bold text-[#0062FF] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {{ opsiSiswaModal().length }} Nama Tanggal Sama
                    </span>
                  }
                </div>

                <select 
                  id="selectSiswaModal"
                  [value]="selectedSiswaIdModal() || ''"
                  (change)="onPilihSiswaModal($event)"
                  class="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0062FF] transition-all">
                  
                  @if (inputTanggalLahir() && normalizeDate(inputTanggalLahir())) {
                    @if (opsiSiswaModal().length === 0) {
                      <option value="">-- Tidak ada pemilih dengan tanggal lahir ini --</option>
                    } @else if (opsiSiswaModal().length > 1) {
                      <option value="">-- Pilih Nama Pemilih (Ada {{ opsiSiswaModal().length }} orang dengan tanggal lahir sama) --</option>
                    } @else {
                      <option value="">-- Terverifikasi Otomatis --</option>
                    }
                  } @else {
                    <option value="">-- Masukkan tanggal lahir di atas terlebih dahulu --</option>
                  }
                  
                  @if (opsiSiswaBelumMemilih().length > 0) {
                    <optgroup label="Belum Memilih">
                      @for (s of opsiSiswaBelumMemilih(); track s.id) {
                        <option [value]="s.id">
                          {{ s.namaLengkap }} (Kelas {{ s.kelas }} · Unsur: {{ getLabelUnsurText(s) }})
                        </option>
                      }
                    </optgroup>
                  }

                  @if (opsiSiswaSudahMemilih().length > 0) {
                    <optgroup label="Sudah Memilih">
                      @for (s of opsiSiswaSudahMemilih(); track s.id) {
                        <option [value]="s.id" disabled class="text-slate-400">
                          {{ s.namaLengkap }} (Kelas {{ s.kelas }} · Unsur: {{ getLabelUnsurText(s) }}) - Sudah Memilih
                        </option>
                      }
                    </optgroup>
                  }
                </select>

                @if (inputTanggalLahir() && normalizeDate(inputTanggalLahir()) && opsiSiswaModal().length > 1) {
                  <p class="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 mt-2 flex items-center gap-2">
                    <mat-icon class="text-[18px] w-4.5 h-4.5 text-amber-600 shrink-0">info</mat-icon>
                    <span>Ditemukan <b>{{ opsiSiswaModal().length }} pemilih</b> dengan tanggal lahir sama. Dropdown hanya menampilkan nama-nama tersebut. Silakan pilih nama Anda.</span>
                  </p>
                }
              </div>

              <!-- Error Box -->
              @if (verifikasiError()) {
                <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-150">
                  <mat-icon class="text-rose-600 text-[18px] w-4.5 h-4.5 shrink-0 mt-0.5">error_outline</mat-icon>
                  <div class="text-[11px] leading-relaxed">
                    <span class="font-bold block">Verifikasi Ditolak:</span>
                    <span>{{ verifikasiError() }}</span>
                  </div>
                </div>
              }

              <!-- Pratinjau Pemilih Terverifikasi -->
              @if (siswaTerverifikasi()) {
                <div class="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3.5 animate-in fade-in duration-150">
                  <div class="w-12 h-12 rounded-xl overflow-hidden bg-white border border-emerald-300 shadow-2xs shrink-0">
                    <img 
                      [src]="siswaTerverifikasi()!.pasFoto" 
                      [alt]="siswaTerverifikasi()!.namaLengkap"
                      referrerpolicy="no-referrer"
                      class="w-full h-full object-cover" />
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5">
                      <mat-icon class="text-emerald-600 text-[16px] w-4 h-4">check_circle</mat-icon>
                      <span class="text-xs font-bold text-emerald-950 truncate">
                        {{ siswaTerverifikasi()!.namaLengkap }}
                      </span>
                    </div>
                    <p class="text-[11px] text-emerald-800">
                      Unsur: {{ getLabelUnsurText(siswaTerverifikasi()!) }} · Kelas {{ siswaTerverifikasi()!.kelas }} · {{ formatTanggal(siswaTerverifikasi()!.tanggalLahir) }}
                    </p>
                  </div>
                </div>
              }

            </div>

            <!-- Modal Footer -->
            <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button 
                type="button" 
                (click)="tutupModalVerifikasi()"
                class="px-4 py-2 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl hover:bg-white transition-colors cursor-pointer">
                Batal
              </button>
              
              <button 
                type="button" 
                (click)="masukKeBilikSuara()"
                [disabled]="!siswaTerverifikasi()"
                class="px-5 py-2.5 bg-[#0062FF] hover:bg-[#0052D9] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-[0_4px_14px_rgba(0,98,255,0.25)] cursor-pointer">
                <mat-icon class="text-[16px] w-4 h-4">meeting_room</mat-icon>
                <span>Masuk ke Bilik Suara</span>
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class PemungutanSuaraComponent {
  readonly votingService = inject(VotingService);

  readonly tahap = signal<'standby' | 'bilik_suara'>('standby');
  readonly bilikTahap = signal<'pilih_paslon' | 'pilih_wakil_siswi'>('pilih_paslon');
  readonly selectedPaslon = signal<Kandidat | null>(null);
  readonly showVerifikasiModal = signal<boolean>(false);

  readonly inputTanggalLahir = signal<string>('');
  readonly selectedSiswaIdModal = signal<string | null>(null);
  readonly verifikasiError = signal<string | null>(null);
  readonly siswaTerverifikasi = signal<Siswa | null>(null);
  readonly activeSiswa = signal<Siswa | null>(null);

  readonly opsiSiswaModal = computed(() => {
    const rawTgl = this.inputTanggalLahir();
    const normInput = this.normalizeDate(rawTgl);
    const semua = this.votingService.siswa();

    // Ketika ada input tanggal lahir, HANYA tampilkan pemilih dengan tanggal lahir yang sama
    if (normInput) {
      return semua.filter(s => this.normalizeDate(s.tanggalLahir) === normInput);
    }

    return semua;
  });

  readonly opsiSiswaBelumMemilih = computed(() => {
    return this.opsiSiswaModal().filter(s => !s.sudahMemilih);
  });

  readonly opsiSiswaSudahMemilih = computed(() => {
    return this.opsiSiswaModal().filter(s => s.sudahMemilih);
  });

  readonly siswaBelumMemilih = computed(() => {
    return this.votingService.siswa().filter(s => !s.sudahMemilih);
  });

  readonly siswaSudahMemilih = computed(() => {
    return this.votingService.siswa().filter(s => s.sudahMemilih);
  });

  readonly regularKandidat = computed(() => {
    return this.votingService.kandidat()
      .filter(k => k.jenisKandidat !== 'wakil_siswi')
      .sort((a, b) => (a.nomorUrut || 999) - (b.nomorUrut || 999));
  });

  readonly allWakilSiswiKandidat = computed(() => {
    return this.votingService.kandidat()
      .filter(k => k.jenisKandidat === 'wakil_siswi')
      .sort((a, b) => (a.nomorUrut || 999) - (b.nomorUrut || 999));
  });

  readonly wakilSiswiKandidat = computed(() => {
    return this.allWakilSiswiKandidat();
  });

  readonly availableKandidat = computed(() => {
    const siswa = this.activeSiswa();
    if (!siswa) return [];
    return this.votingService.kandidat().filter(k => dapatMemilihKandidat(siswa, k));
  });

  getLabelUnsur(siswa: Siswa): 'siswa' | 'guru' | 'yayasan' {
    return getUnsurPemilih(siswa);
  }

  getLabelUnsurText(siswa: Siswa): string {
    const u = getUnsurPemilih(siswa);
    if (u === 'guru') return 'Guru';
    if (u === 'yayasan') return 'Yayasan';
    return 'Siswa';
  }

  isLakiLaki(siswa: Siswa): boolean {
    const jk = (siswa.jenisKelamin || 'Laki-laki').toLowerCase();
    return jk.includes('laki') || jk === 'l' || jk === 'pria';
  }

  bisaMemilihWakilSiswi(siswa: Siswa): boolean {
    if (this.allWakilSiswiKandidat().length === 0) return false;
    const unsur = getUnsurPemilih(siswa);
    // Guru dan Yayasan SELALU berhak memilih calon wakil ketua siswi
    if (unsur === 'guru' || unsur === 'yayasan') return true;
    // Siswa perempuan (siswi) berhak memilih calon wakil ketua siswi
    return !this.isLakiLaki(siswa);
  }

  kembaliKePilihPaslon(): void {
    this.bilikTahap.set('pilih_paslon');
  }

  bukaModalVerifikasi(): void {
    this.inputTanggalLahir.set('');
    this.selectedSiswaIdModal.set(null);
    this.verifikasiError.set(null);
    this.siswaTerverifikasi.set(null);
    this.showVerifikasiModal.set(true);
  }

  tutupModalVerifikasi(): void {
    this.showVerifikasiModal.set(false);
    this.verifikasiError.set(null);
    this.siswaTerverifikasi.set(null);
  }

  onTanggalLahirChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.inputTanggalLahir.set(val);

    const normInput = this.normalizeDate(val);
    const currentId = this.selectedSiswaIdModal();
    if (currentId) {
      const s = this.votingService.siswa().find(x => x.id === currentId);
      if (s && this.normalizeDate(s.tanggalLahir) !== normInput) {
        this.selectedSiswaIdModal.set(null);
      }
    }

    this.evaluasiVerifikasi(val, this.selectedSiswaIdModal());
  }

  onPilihSiswaModal(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    const siswaId = val ? val : null;
    this.selectedSiswaIdModal.set(siswaId);

    if (siswaId) {
      const siswa = this.votingService.siswa().find(s => s.id === siswaId);
      if (siswa && siswa.tanggalLahir && !this.inputTanggalLahir()) {
        this.inputTanggalLahir.set(this.normalizeDate(siswa.tanggalLahir));
      }
    }

    this.evaluasiVerifikasi(this.inputTanggalLahir(), siswaId);
  }

  normalizeDate(d: string): string {
    if (!d) return '';
    const trimmed = d.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const parts = trimmed.split(/[-/]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      }
      if (parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return trimmed;
  }

  private evaluasiVerifikasi(inputTgl: string, selectedId: string | null): void {
    this.verifikasiError.set(null);
    this.siswaTerverifikasi.set(null);

    const normInput = this.normalizeDate(inputTgl);
    const semuaSiswa = this.votingService.siswa();

    // 1. Jika pengguna memilih pemilih dari dropdown
    if (selectedId) {
      const siswa = semuaSiswa.find(s => s.id === selectedId);
      if (!siswa) {
        this.verifikasiError.set('Pemilih tidak ditemukan.');
        return;
      }

      if (siswa.sudahMemilih) {
        this.verifikasiError.set(`Pemilih ${siswa.namaLengkap} sudah menggunakan hak suaranya pada ${siswa.waktuMemilih || 'sebelumnya'}.`);
        return;
      }

      if (!normInput) {
        this.siswaTerverifikasi.set(siswa);
        return;
      }

      const normSiswaTgl = this.normalizeDate(siswa.tanggalLahir);
      if (normInput === normSiswaTgl) {
        this.siswaTerverifikasi.set(siswa);
      } else {
        this.verifikasiError.set(`Tanggal lahir tidak sesuai dengan data ${siswa.namaLengkap}.`);
      }
      return;
    }

    // 2. Jika tanggal lahir diinputkan
    if (normInput) {
      const cocok = semuaSiswa.filter(s => this.normalizeDate(s.tanggalLahir) === normInput);

      if (cocok.length === 0) {
        this.verifikasiError.set('Tidak ditemukan pemilih terdaftar dengan tanggal lahir tersebut.');
        return;
      }

      // Jika hanya ada 1 orang dengan tanggal lahir ini
      if (cocok.length === 1) {
        const kandidatSiswa = cocok[0];
        if (kandidatSiswa.sudahMemilih) {
          this.verifikasiError.set(`Pemilih ${kandidatSiswa.namaLengkap} sudah menggunakan hak suaranya.`);
          return;
        }
        this.selectedSiswaIdModal.set(kandidatSiswa.id);
        this.siswaTerverifikasi.set(kandidatSiswa);
        return;
      }

      // Jika ada tanggal lahir yang sama (> 1 pemilih)
      const belumMemilihSaja = cocok.filter(s => !s.sudahMemilih);
      if (belumMemilihSaja.length === 1) {
        this.selectedSiswaIdModal.set(belumMemilihSaja[0].id);
        this.siswaTerverifikasi.set(belumMemilihSaja[0]);
      } else if (belumMemilihSaja.length > 1) {
        this.verifikasiError.set(`Ditemukan ${belumMemilihSaja.length} pemilih dengan tanggal lahir ini. Silakan pilih nama Anda pada pilihan Nama Pemilih di bawah.`);
      } else {
        this.verifikasiError.set('Semua pemilih dengan tanggal lahir ini telah menggunakan hak suara.');
      }
    }
  }

  masukKeBilikSuara(): void {
    const verified = this.siswaTerverifikasi();
    if (!verified) return;

    this.activeSiswa.set(verified);
    this.bilikTahap.set('pilih_paslon');
    this.selectedPaslon.set(null);
    this.showVerifikasiModal.set(false);
    this.tahap.set('bilik_suara');
  }

  konfirmasiKeluarBilik(): void {
    if (confirm('Keluar dari bilik suara? Pilihan belum disimpan.')) {
      this.resetKeStandby();
    }
  }

  async pilihPaslon(kandidat: Kandidat): Promise<void> {
    const siswa = this.activeSiswa();
    if (!siswa || siswa.sudahMemilih) return;

    const unsurLabel = this.getLabelUnsurText(siswa);
    const htmlContent = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 4px; font-family: inherit;">
        <div style="font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 0.08em; text-transform: uppercase;">
          Konfirmasi Pilihan Paslon
        </div>
        <div style="font-size: 26px; font-weight: 900; color: #0f172a; line-height: 1.1;">
          Paslon Nomor ${kandidat.nomorUrut}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; width: 100%; max-width: 320px; margin: 6px 0;">
          <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
            <div style="width: 100%; aspect-ratio: 3/4; border-radius: 12px; overflow: hidden; border: 2px solid #e2e8f0; background: #f8fafc; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08);">
              <img src="${kandidat.fotoKetua}" alt="${kandidat.namaKetua}" referrerpolicy="no-referrer" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <span style="font-size: 10px; font-weight: 600; color: #64748b; margin-top: 6px;">Calon Ketua</span>
            <span style="font-size: 12px; font-weight: 700; color: #0f172a; line-height: 1.25; margin-top: 1px;">${kandidat.namaKetua}</span>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
            <div style="width: 100%; aspect-ratio: 3/4; border-radius: 12px; overflow: hidden; border: 2px solid #e2e8f0; background: #f8fafc; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08);">
              <img src="${kandidat.fotoWakil}" alt="${kandidat.namaWakil}" referrerpolicy="no-referrer" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <span style="font-size: 10px; font-weight: 600; color: #64748b; margin-top: 6px;">Calon Wakil</span>
            <span style="font-size: 12px; font-weight: 700; color: #0f172a; line-height: 1.25; margin-top: 1px;">${kandidat.namaWakil}</span>
          </div>
        </div>

        <div style="font-size: 12px; color: #334155; background: #f1f5f9; padding: 10px 14px; border-radius: 10px; width: 100%; text-align: center; border: 1px solid #e2e8f0; line-height: 1.5;">
          Pemilih: <b>${siswa.namaLengkap}</b> (Unsur: ${unsurLabel}, Kelas: ${siswa.kelas})<br/>
          Apakah Anda yakin ingin memilih pasangan calon ini?
        </div>
      </div>
    `;

    const result = await Swal.fire({
      html: htmlContent,
      showCancelButton: true,
      confirmButtonText: this.bisaMemilihWakilSiswi(siswa) ? 'Iya, Lanjut ke Wakil Siswi →' : 'Iya, Simpan Pilihan',
      cancelButtonText: 'Tidak',
      confirmButtonColor: '#0062FF',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
      focusConfirm: true,
      allowOutsideClick: false,
      width: '420px',
      customClass: {
        popup: 'rounded-2xl shadow-2xl'
      }
    });

    if (result.isConfirmed) {
      this.selectedPaslon.set(kandidat);

      if (this.bisaMemilihWakilSiswi(siswa)) {
        this.bilikTahap.set('pilih_wakil_siswi');
        await Swal.fire({
          icon: 'success',
          title: `Paslon Nomor ${kandidat.nomorUrut} Terpilih`,
          text: `Langkah 1 selesai. Silakan lanjutkan langkah kedua: Pilih Calon Wakil Ketua Siswi.`,
          timer: 1800,
          timerProgressBar: true,
          showConfirmButton: false,
          allowOutsideClick: false,
          customClass: {
            popup: 'rounded-2xl shadow-2xl'
          }
        });
      } else {
        // Pemilih siswa laki-laki (hanya memilih Paslon)
        this.votingService.catatSuaraLengkap(siswa.id, kandidat.id);

        await Swal.fire({
          icon: 'success',
          title: 'Pilihan Berhasil Disimpan',
          text: `Terima kasih! Suara Anda atas nama ${siswa.namaLengkap} telah sah masuk ke kotak suara digital.`,
          confirmButtonText: 'Selesai',
          confirmButtonColor: '#0062FF',
          timer: 2500,
          timerProgressBar: true,
          allowOutsideClick: false,
          customClass: {
            popup: 'rounded-2xl shadow-2xl'
          }
        });

        this.resetKeStandby();
      }
    }
  }

  async pilihWakilSiswi(kandidat: Kandidat): Promise<void> {
    const siswa = this.activeSiswa();
    const paslon = this.selectedPaslon();
    if (!siswa || !paslon || siswa.sudahMemilih) return;

    const unsurLabel = this.getLabelUnsurText(siswa);
    const htmlContent = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 4px; font-family: inherit;">
        <div style="font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 0.08em; text-transform: uppercase;">
          Konfirmasi Pilihan Calon Wakil Siswi
        </div>
        <div style="font-size: 24px; font-weight: 900; color: #0f172a; line-height: 1.1;">
          ${kandidat.nomorUrut !== undefined ? 'Nomor ' + ((kandidat.nomorUrut < 10) ? '0' + kandidat.nomorUrut : kandidat.nomorUrut) + ' - ' : ''}${kandidat.namaWakil}
        </div>

        <div style="width: 140px; aspect-ratio: 3/4; border-radius: 12px; overflow: hidden; border: 2px solid #e2e8f0; background: #f8fafc; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08); margin: 6px 0;">
          <img src="${kandidat.fotoWakil}" alt="${kandidat.namaWakil}" referrerpolicy="no-referrer" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>

        <div style="font-size: 12px; color: #334155; background: #f1f5f9; padding: 10px 14px; border-radius: 10px; width: 100%; text-align: center; border: 1px solid #e2e8f0; line-height: 1.5;">
          Pemilih: <b>${siswa.namaLengkap}</b> (Unsur: ${unsurLabel}, Kelas: ${siswa.kelas})<br/>
          Paslon Terpilih: <b>Paslon Nomor ${paslon.nomorUrut}</b> (${paslon.namaKetua} & ${paslon.namaWakil})<br/>
          Apakah Anda yakin ingin menyelesaikan pemungutan suara dengan pilihan ini?
        </div>
      </div>
    `;

    const result = await Swal.fire({
      html: htmlContent,
      showCancelButton: true,
      confirmButtonText: 'Iya, Simpan Seluruh Suara',
      cancelButtonText: 'Tidak',
      confirmButtonColor: '#0062FF',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
      focusConfirm: true,
      allowOutsideClick: false,
      width: '420px',
      customClass: {
        popup: 'rounded-2xl shadow-2xl'
      }
    });

    if (result.isConfirmed) {
      this.votingService.catatSuaraLengkap(siswa.id, paslon.id, kandidat.id);

      await Swal.fire({
        icon: 'success',
        title: 'Seluruh Pilihan Berhasil Disimpan',
        text: `Terima kasih! Suara Anda atas nama ${siswa.namaLengkap} untuk Paslon No. ${paslon.nomorUrut} dan Calon Wakil Siswi No. ${kandidat.nomorUrut} telah sah masuk ke kotak suara digital.`,
        confirmButtonText: 'Selesai',
        confirmButtonColor: '#0062FF',
        timer: 3000,
        timerProgressBar: true,
        allowOutsideClick: false,
        customClass: {
          popup: 'rounded-2xl shadow-2xl'
        }
      });

      this.resetKeStandby();
    }
  }

  resetKeStandby(): void {
    this.tahap.set('standby');
    this.bilikTahap.set('pilih_paslon');
    this.selectedPaslon.set(null);
    this.activeSiswa.set(null);
    this.showVerifikasiModal.set(false);
    this.inputTanggalLahir.set('');
    this.selectedSiswaIdModal.set(null);
    this.siswaTerverifikasi.set(null);
    this.verifikasiError.set(null);
  }

  formatTanggal(dateString: string): string {
    if (!dateString) return '-';
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const monthNum = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${day} ${months[monthNum - 1] || monthNum} ${year}`;
      }
      return dateString;
    } catch {
      return dateString;
    }
  }
}
