import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Siswa } from '../../models/voting.models';
import { VotingService, getUnsurPemilih } from '../../services/voting.service';
import { SupabaseService } from '../../services/supabase.service';
import * as XLSX from 'xlsx';

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'
];

interface ParsedSiswaRow {
  namaLengkap: string;
  tempatLahir: string;
  tanggalLahir: string;
  kelas: string;
  unsur?: string;
  jenisKelamin: string;
  pasFoto: string;
  isValid: boolean;
  errorMessage?: string;
}

@Component({
  selector: 'app-siswa',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatIconModule],
  template: `
    <div class="p-4 sm:p-6 lg:p-8 space-y-6">
      
      <!-- Top Title and Action -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div class="flex items-center gap-3">
          <img 
            src="/logo_smp_al_muttaqin.png" 
            alt="Logo SMP Al Muttaqin" 
            referrerpolicy="no-referrer"
            class="w-9 h-9 object-contain" />
          <div>
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
              Daftar Pemilih Tetap (Siswa)
            </h1>
            <div class="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>OSIS SMP AL MUTTAQIN</span>
              <span aria-hidden="true">·</span>
              <span>Total: {{ votingService.totalSiswa() }} Siswa</span>
              <span aria-hidden="true">·</span>
              <span>{{ votingService.sudahMemilihCount() }} Sudah Memilih</span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Tombol Refresh / Sync Database -->
          <button 
            type="button"
            (click)="onSyncDatabase()"
            [disabled]="supabaseService.isSyncing()"
            class="px-3.5 py-2 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs">
            <mat-icon class="text-[16px] w-4 h-4 text-slate-400" [class.animate-spin]="supabaseService.isSyncing()">sync</mat-icon>
            <span>{{ supabaseService.isSyncing() ? 'Menyinkronkan...' : 'Sinkron Database' }}</span>
          </button>

          <!-- Tombol Import Excel -->
          <button 
            type="button"
            (click)="bukaModalImport()"
            class="px-3.5 py-2 bg-white border border-slate-200/80 hover:bg-slate-50 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs">
            <mat-icon class="text-[16px] w-4 h-4 text-emerald-600">table_view</mat-icon>
            <span>Import Excel / CSV</span>
          </button>

          <!-- Tombol Tambah Siswa Manual -->
          <button 
            type="button"
            (click)="bukaModalTambah()"
            class="px-4 py-2 bg-[#0062FF] hover:bg-[#0052D9] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-[0_4px_14px_rgba(0,98,255,0.25)]">
            <mat-icon class="text-[16px] w-4 h-4">person_add</mat-icon>
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      <!-- Filter and Search Toolbar -->
      <div class="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div class="flex-1 relative">
          <mat-icon class="absolute left-3 top-2.5 text-slate-400 text-[18px] w-[18px] h-[18px]">search</mat-icon>
          <input 
            type="text" 
            placeholder="Cari nama lengkap, kelas, atau tempat lahir..."
            [value]="searchTerm()"
            (input)="onSearchInput($event)"
            class="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0062FF]" />
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Filter Unsur -->
          <select 
            [value]="selectedUnsur()"
            (change)="onFilterUnsur($event)"
            class="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900">
            <option value="ALL">Semua Unsur</option>
            <option value="siswa">Unsur Siswa</option>
            <option value="guru">Unsur Guru</option>
            <option value="yayasan">Unsur Yayasan</option>
          </select>

          <!-- Filter Kelas -->
          <select 
            [value]="selectedKelas()"
            (change)="onFilterKelas($event)"
            class="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900">
            <option value="ALL">Semua Kelas</option>
            @for (k of kelasList(); track k) {
              <option [value]="k">{{ k }}</option>
            }
          </select>

          <!-- Filter Status Memilih -->
          <select 
            [value]="selectedStatus()"
            (change)="onFilterStatus($event)"
            class="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900">
            <option value="ALL">Semua Status</option>
            <option value="SUDAH">Sudah Memilih</option>
            <option value="BELUM">Belum Memilih</option>
          </select>
        </div>
      </div>

      <!-- Data Table -->
      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th class="px-4 py-3 w-12 text-slate-400 font-medium">No</th>
                <th class="px-5 py-3">Nama Lengkap</th>
                <th class="px-5 py-3">Unsur</th>
                <th class="px-5 py-3">L/P</th>
                <th class="px-5 py-3">Tempat, Tanggal Lahir</th>
                <th class="px-5 py-3">Kelas</th>
                <th class="px-5 py-3">Status Hak Suara</th>
                <th class="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @if (filteredSiswa().length === 0) {
                <tr>
                  <td colspan="8" class="px-5 py-12 text-center text-slate-400">
                    <div class="space-y-2">
                      <mat-icon class="text-[32px] w-8 h-8 mx-auto text-slate-300">person_search</mat-icon>
                      <p class="font-medium text-slate-600">Tidak ada data pemilih</p>
                      <p class="text-[11px] text-slate-400">Gunakan tombol "Tambah Pemilih" atau "Import Excel" untuk memasukkan data pemilih.</p>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (siswa of filteredSiswa(); track siswa.id; let idx = $index) {
                  <tr class="hover:bg-slate-50/75 transition-colors">
                    <td class="px-4 py-3 text-slate-400 tabular-nums">
                      {{ idx + 1 }}
                    </td>
                    <td class="px-5 py-3 font-semibold text-slate-900">
                      {{ siswa.namaLengkap }}
                    </td>
                    <td class="px-5 py-3">
                      @let u = getUnsur(siswa);
                      @if (u === 'guru') {
                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <mat-icon class="text-[12px] w-3 h-3 text-amber-600">school</mat-icon>
                          Guru
                        </span>
                      } @else if (u === 'yayasan') {
                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                          <mat-icon class="text-[12px] w-3 h-3 text-purple-600">account_balance</mat-icon>
                          Yayasan
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          <mat-icon class="text-[12px] w-3 h-3 text-[#0062FF]">badge</mat-icon>
                          Siswa
                        </span>
                      }
                    </td>
                    <td class="px-5 py-3 text-slate-600">
                      {{ siswa.jenisKelamin === 'Perempuan' ? 'P' : 'L' }}
                    </td>
                    <td class="px-5 py-3 text-slate-600">
                      {{ siswa.tempatLahir }}, {{ formatTanggal(siswa.tanggalLahir) }}
                    </td>
                    <td class="px-5 py-3 font-medium text-slate-700">
                      {{ siswa.kelas }}
                    </td>
                    <td class="px-5 py-3">
                      @if (siswa.sudahMemilih) {
                        <span class="inline-flex items-center gap-1 font-semibold text-emerald-700">
                          <mat-icon class="text-[14px] w-3.5 h-3.5">check_circle</mat-icon>
                          Sudah Memilih
                        </span>
                        @if (siswa.waktuMemilih) {
                          <span class="block text-[11px] text-slate-400 mt-0.5">
                            {{ siswa.waktuMemilih }}
                          </span>
                        }
                      } @else {
                        <span class="inline-flex items-center gap-1 font-semibold text-amber-700">
                          <mat-icon class="text-[14px] w-3.5 h-3.5">schedule</mat-icon>
                          Belum Memilih
                        </span>
                      }
                    </td>
                    <td class="px-5 py-3 text-right">
                      <div class="flex items-center justify-end gap-1">
                        <button 
                          type="button"
                          (click)="bukaModalEdit(siswa)"
                          title="Edit Siswa"
                          class="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                          <mat-icon class="text-[18px] w-[18px] h-[18px]">edit</mat-icon>
                        </button>
                        <button 
                          type="button"
                          (click)="hapusSiswa(siswa)"
                          title="Hapus Siswa"
                          class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                          <mat-icon class="text-[18px] w-[18px] h-[18px]">delete</mat-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL IMPORT EXCEL / CSV -->
      @if (showImportModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div class="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <!-- Modal Header -->
            <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 class="text-base font-bold text-slate-900">
                  Import Data Siswa dari Excel / CSV
                </h2>
                <p class="text-xs text-slate-500 mt-0.5">
                  Unggah file spreadsheet .xlsx, .xls, atau .csv untuk menambahkan daftar pemilih secara massal.
                </p>
              </div>
              <button 
                type="button"
                (click)="tutupModalImport()"
                class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <mat-icon class="text-[20px] w-5 h-5">close</mat-icon>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-6 space-y-5 overflow-y-auto flex-1">
              
              <!-- Download Template Box -->
              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div class="space-y-0.5">
                  <span class="text-xs font-bold text-slate-800 block">Format Kolom Excel:</span>
                  <span class="text-[11px] text-slate-500 block">
                    Kolom: <b>nama_lengkap</b>, <b>tempat_lahir</b>, <b>tanggal_lahir</b>, <b>kelas</b>, <b>unsur</b> (Siswa/Guru/Yayasan), <b>jenis_kelamin</b>, <b>pas_foto</b> (opsional)
                  </span>
                </div>
                <button 
                  type="button"
                  (click)="downloadTemplateExcel()"
                  class="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap self-start sm:self-center">
                  <mat-icon class="text-[16px] w-4 h-4 text-emerald-600">download</mat-icon>
                  <span>Download Format Excel</span>
                </button>
              </div>

              <!-- Upload Area -->
              <div>
                <label for="excelFileInput" class="block text-xs font-semibold text-slate-700 mb-2">
                  Pilih File Excel (.xlsx / .xls) atau CSV:
                </label>
                <input 
                  id="excelFileInput"
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  (change)="onFileSelected($event)"
                  class="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer border border-slate-200 rounded-lg p-2" />
              </div>

              <!-- Error Message if any -->
              @if (importErrorMessage()) {
                <div class="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <mat-icon class="text-rose-500 text-[18px] w-4 h-4">error_outline</mat-icon>
                  <span>{{ importErrorMessage() }}</span>
                </div>
              }

              <!-- Preview Table -->
              @if (parsedRows().length > 0) {
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-bold text-slate-800">
                      Pratinjau Data ({{ validRowCount() }} dari {{ parsedRows().length }} baris siap diimpor):
                    </span>
                    @if (invalidRowCount() > 0) {
                      <span class="text-amber-700 font-semibold text-[11px]">
                        {{ invalidRowCount() }} baris tidak lengkap akan dilewati
                      </span>
                    }
                  </div>

                  <div class="border border-slate-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                    <table class="w-full text-left text-xs">
                      <thead class="bg-slate-50 text-slate-600 sticky top-0 border-b border-slate-200">
                        <tr>
                          <th class="px-3 py-2 w-10">No</th>
                          <th class="px-3 py-2">Nama Lengkap</th>
                          <th class="px-3 py-2">Unsur</th>
                          <th class="px-3 py-2">L/P</th>
                          <th class="px-3 py-2">Tempat, Tgl Lahir</th>
                          <th class="px-3 py-2">Kelas</th>
                          <th class="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        @for (row of parsedRows(); track $index) {
                          <tr class="hover:bg-slate-50" [class.bg-rose-50/40]="!row.isValid">
                            <td class="px-3 py-2 text-slate-400 tabular-nums">{{ $index + 1 }}</td>
                            <td class="px-3 py-2 font-medium text-slate-900">{{ row.namaLengkap || '-' }}</td>
                            <td class="px-3 py-2">
                              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold"
                                [class.bg-amber-50]="row.unsur === 'Guru'"
                                [class.text-amber-800]="row.unsur === 'Guru'"
                                [class.bg-purple-50]="row.unsur === 'Yayasan'"
                                [class.text-purple-800]="row.unsur === 'Yayasan'"
                                [class.bg-blue-50]="row.unsur !== 'Guru' && row.unsur !== 'Yayasan'"
                                [class.text-blue-800]="row.unsur !== 'Guru' && row.unsur !== 'Yayasan'">
                                {{ row.unsur || 'Siswa' }}
                              </span>
                            </td>
                            <td class="px-3 py-2 text-slate-600">{{ row.jenisKelamin === 'Perempuan' ? 'P' : 'L' }}</td>
                            <td class="px-3 py-2 text-slate-600">{{ row.tempatLahir }}, {{ row.tanggalLahir }}</td>
                            <td class="px-3 py-2 font-medium text-slate-700">{{ row.kelas || '-' }}</td>
                            <td class="px-3 py-2">
                              @if (row.isValid) {
                                <span class="text-emerald-700 font-semibold text-[11px] inline-flex items-center gap-0.5">
                                  <mat-icon class="text-[14px] w-3.5 h-3.5">check</mat-icon>
                                  Valid
                                </span>
                              } @else {
                                <span class="text-rose-600 font-semibold text-[11px] inline-flex items-center gap-0.5">
                                  <mat-icon class="text-[14px] w-3.5 h-3.5">warning</mat-icon>
                                  {{ row.errorMessage || 'Kurang lengkap' }}
                                </span>
                              }
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              }

            </div>

            <!-- Modal Footer -->
            <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button 
                type="button"
                (click)="tutupModalImport()"
                class="px-4 py-2 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg hover:bg-white transition-colors">
                Batal
              </button>
              <button 
                type="button"
                (click)="prosesSimpanImport()"
                [disabled]="validRowCount() === 0 || isImporting()"
                class="px-5 py-2.5 bg-[#0062FF] hover:bg-[#0052D9] disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-[0_4px_14px_rgba(0,98,255,0.25)] cursor-pointer disabled:cursor-not-allowed">
                @if (isImporting()) {
                  <mat-icon class="text-[16px] w-4 h-4 animate-spin">refresh</mat-icon>
                  <span>Menyimpan ke Supabase...</span>
                } @else {
                  <mat-icon class="text-[16px] w-4 h-4">cloud_upload</mat-icon>
                  <span>Impor {{ validRowCount() }} Siswa ke Database</span>
                }
              </button>
            </div>

          </div>
        </div>
      }

      <!-- MODAL TAMBAH / EDIT SISWA MANUAL -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div class="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            
            <!-- Modal Header -->
            <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 class="text-base font-bold text-slate-900">
                {{ isEditing() ? 'Edit Data Siswa' : 'Tambah Siswa Baru' }}
              </h2>
              <button 
                type="button" 
                (click)="tutupModal()"
                class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <mat-icon class="text-[20px] w-5 h-5">close</mat-icon>
              </button>
            </div>

            <!-- Modal Form -->
            <form [formGroup]="siswaForm" (ngSubmit)="simpanSiswa()" class="p-6 space-y-4">
              
              <!-- Nama Lengkap -->
              <div>
                <label for="siswaNamaLengkap" class="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <input 
                  id="siswaNamaLengkap"
                  type="text" 
                  formControlName="namaLengkap"
                  placeholder="Contoh: Muhammad Fadhil Pratama"
                  class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900" />
              </div>

              <!-- Tempat & Tanggal Lahir -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="siswaTempatLahir" class="block text-xs font-semibold text-slate-700 mb-1">
                    Tempat Lahir
                  </label>
                  <input 
                    id="siswaTempatLahir"
                    type="text" 
                    formControlName="tempatLahir"
                    placeholder="Contoh: Bandung"
                    class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900" />
                </div>
                <div>
                  <label for="siswaTanggalLahir" class="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Lahir
                  </label>
                  <input 
                    id="siswaTanggalLahir"
                    type="date" 
                    formControlName="tanggalLahir"
                    class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900" />
                </div>
              </div>

              <!-- Kelas, Unsur & Jenis Kelamin -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label for="siswaKelas" class="block text-xs font-semibold text-slate-700 mb-1">
                    Kelas
                  </label>
                  <input 
                    id="siswaKelas"
                    type="text" 
                    formControlName="kelas"
                    placeholder="Contoh: 9-B atau Guru"
                    class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900" />
                </div>
                <div>
                  <label for="siswaUnsur" class="block text-xs font-semibold text-slate-700 mb-1">
                    Unsur Pemilih
                  </label>
                  <select 
                    id="siswaUnsur"
                    formControlName="unsur"
                    class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium">
                    <option value="Siswa">Siswa</option>
                    <option value="Guru">Guru</option>
                    <option value="Yayasan">Yayasan</option>
                  </select>
                </div>
                <div>
                  <label for="siswaJenisKelamin" class="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select 
                    id="siswaJenisKelamin"
                    formControlName="jenisKelamin"
                    class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900">
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>
              <p class="text-[11px] text-slate-400 -mt-2">
                * Unsur <b>Siswa Laki-laki</b> hanya berhak memilih Paslon Ketua & Wakil. Unsur <b>Siswa Perempuan</b>, <b>Guru</b>, dan <b>Yayasan</b> berhak memilih Paslon + Calon Wakil Siswi.
              </p>

              <!-- Upload Pas Foto Siswa (Tersimpan ke Supabase Storage bucket: pas_foto) -->
              <div>
                <span class="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pas Foto Siswa
                </span>

                <!-- Box Unggah & Pratinjau Foto -->
                <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
                  <!-- Foto Preview Avatar -->
                  <div class="relative w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-xs shrink-0 group">
                    <img 
                      [src]="siswaForm.get('pasFoto')?.value || sampleAvatars[0]" 
                      alt="Pas Foto Siswa" 
                      referrerpolicy="no-referrer"
                      class="w-full h-full object-cover" />
                    @if (isUploadingFoto()) {
                      <div class="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                        <mat-icon class="text-white text-[20px] w-5 h-5 animate-spin">refresh</mat-icon>
                      </div>
                    }
                  </div>

                  <!-- Controls & Information -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <!-- Input File Tersembunyi -->
                      <input 
                        #filePasFotoInput
                        type="file" 
                        accept="image/png,image/jpeg,image/jpg,image/webp" 
                        (change)="onFilePasFotoChange($event)"
                        class="hidden" />
                      
                      <!-- Tombol Upload Foto -->
                      <button 
                        type="button"
                        (click)="filePasFotoInput.click()"
                        [disabled]="isUploadingFoto()"
                        class="px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50">
                        <mat-icon class="text-[16px] w-4 h-4 text-[#0062FF]">
                          {{ isUploadingFoto() ? 'refresh' : 'cloud_upload' }}
                        </mat-icon>
                        <span>{{ isUploadingFoto() ? 'Mengunggah...' : (siswaForm.get('pasFoto')?.value && !isDefaultAvatar(siswaForm.get('pasFoto')?.value) ? 'Ganti Foto' : 'Pilih Foto (Upload)') }}</span>
                      </button>

                      @if (siswaForm.get('pasFoto')?.value && !isDefaultAvatar(siswaForm.get('pasFoto')?.value)) {
                        <button 
                          type="button"
                          (click)="resetKeDefaultAvatar()"
                          title="Hapus foto ini & gunakan avatar bawaan"
                          class="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1 transition-colors">
                          <mat-icon class="text-[14px] w-3.5 h-3.5">delete_outline</mat-icon>
                          <span>Hapus</span>
                        </button>
                      }
                    </div>

                    <p class="text-[11px] text-slate-500 mt-1">
                      Foto otomatis diunggah & disimpan ke bucket <span class="font-mono text-slate-700 font-semibold bg-slate-200/60 px-1 py-0.5 rounded">pas_foto</span> Supabase.
                    </p>

                    <!-- Status Upload Sukses -->
                    @if (uploadFotoSuccess()) {
                      <div class="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
                        <mat-icon class="text-[14px] w-3.5 h-3.5 text-emerald-600">check_circle</mat-icon>
                        <span>Foto berhasil diunggah ke bucket pas_foto</span>
                      </div>
                    }
                  </div>
                </div>

                <!-- Error Upload Banner (Informasi RLS Supabase) -->
                @if (uploadFotoError()) {
                  <div class="mt-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start justify-between gap-2">
                    <div class="flex items-start gap-2">
                      <mat-icon class="text-[18px] w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5">info</mat-icon>
                      <div class="text-[11px] space-y-1">
                        <span class="font-bold text-amber-950 block">Status Unggah ke Supabase:</span>
                        <p class="text-amber-800">{{ uploadFotoError() }}</p>
                        <div class="pt-0.5">
                          <button 
                            type="button"
                            (click)="showSqlStorageModal.set(true)"
                            class="text-blue-700 font-bold underline hover:text-blue-900 cursor-pointer inline-flex items-center gap-1">
                            <mat-icon class="text-[13px] w-3.5 h-3.5">code</mat-icon>
                            <span>Klik di sini untuk melihat Kode SQL Izin Akses Storage pas_foto</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      (click)="uploadFotoError.set(null)"
                      class="text-amber-500 hover:text-amber-800 p-0.5">
                      <mat-icon class="text-[16px] w-4 h-4">close</mat-icon>
                    </button>
                  </div>
                }

                <!-- Pilihan Avatar Standar Cepat -->
                <div class="flex items-center gap-2 pt-2.5">
                  <span class="text-[11px] text-slate-400">Pilihan avatar cepat:</span>
                  <div class="flex items-center gap-1.5">
                    @for (avatar of sampleAvatars; track avatar) {
                      <button 
                        type="button" 
                        (click)="pilihAvatar(avatar)"
                        [class.ring-2]="siswaForm.get('pasFoto')?.value === avatar"
                        [class.ring-blue-600]="siswaForm.get('pasFoto')?.value === avatar"
                        class="w-6 h-6 rounded-full overflow-hidden border border-slate-200 hover:ring-1 hover:ring-slate-400 transition-all cursor-pointer">
                        <img [src]="avatar" alt="Avatar" referrerpolicy="no-referrer" class="w-full h-full object-cover" />
                      </button>
                    }
                  </div>
                </div>
              </div>

              <!-- Footer Buttons -->
              <div class="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  (click)="tutupModal()"
                  class="px-3.5 py-2 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                  Batal
                </button>
                <button 
                  type="submit" 
                  [disabled]="siswaForm.invalid"
                  class="px-5 py-2.5 bg-[#0062FF] hover:bg-[#0052D9] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-[0_4px_14px_rgba(0,98,255,0.25)]">
                  {{ isEditing() ? 'Simpan Perubahan' : 'Tambah Siswa' }}
                </button>
              </div>

            </form>

          </div>
        </div>
      }

      <!-- MODAL BANTUAN SQL STORAGE POLICY SUPABASE -->
      @if (showSqlStorageModal()) {
        <div class="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div class="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col animate-in fade-in duration-150">
            <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <mat-icon class="text-blue-600 text-[20px] w-5 h-5">folder_shared</mat-icon>
                <h3 class="text-sm font-bold text-slate-900">Kode SQL Akses Bucket pas_foto</h3>
              </div>
              <button 
                type="button" 
                (click)="showSqlStorageModal.set(false)"
                class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <mat-icon class="text-[18px] w-4.5 h-4.5">close</mat-icon>
              </button>
            </div>
            <div class="p-5 space-y-3 text-xs text-slate-600 max-h-[70vh] overflow-y-auto">
              <p>
                Agar upload pas foto dapat langsung disimpan ke bucket <b>pas_foto</b> di Supabase, jalankan kode SQL kebijakan (Storage Policy) berikut di Supabase SQL Editor:
              </p>
              <div class="relative bg-slate-900 text-slate-100 rounded-lg p-3.5 font-mono text-[11px] overflow-x-auto leading-relaxed">
                <pre><code>-- 1. Pastikan bucket pas_foto berstatus Public
UPDATE storage.buckets SET public = true WHERE id = 'pas_foto';

-- 2. Kebijakan izin upload file ke bucket pas_foto
CREATE POLICY "Izinkan Upload pas_foto"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'pas_foto');

-- 3. Kebijakan izin melihat foto secara publik
CREATE POLICY "Izinkan Lihat pas_foto"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pas_foto');

-- 4. Kebijakan update foto di bucket pas_foto
CREATE POLICY "Izinkan Update pas_foto"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'pas_foto');</code></pre>
              </div>
              <p class="text-[11px] text-slate-500">
                Langkah: Buka dashboard Supabase &gt; <b>SQL Editor</b> &gt; Tempel kode &gt; Klik <b>Run</b>.
              </p>
            </div>
            <div class="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button 
                type="button"
                (click)="salinSqlStorage()"
                class="px-4 py-2 bg-[#0062FF] hover:bg-[#0052D9] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer">
                <mat-icon class="text-[16px] w-4 h-4">content_copy</mat-icon>
                <span>{{ sqlCopied() ? 'Berhasil Disalin!' : 'Salin Kode SQL' }}</span>
              </button>
              <button 
                type="button"
                (click)="showSqlStorageModal.set(false)"
                class="px-3.5 py-2 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg hover:bg-white transition-colors cursor-pointer">
                Tutup
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class SiswaComponent {
  readonly votingService = inject(VotingService);
  readonly supabaseService = inject(SupabaseService);

  readonly searchTerm = signal<string>('');
  readonly selectedKelas = signal<string>('ALL');
  readonly selectedUnsur = signal<string>('ALL');
  readonly selectedStatus = signal<string>('ALL');

  readonly showModal = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly editingId = signal<string | null>(null);

  // Import Modal Signals
  readonly showImportModal = signal<boolean>(false);
  readonly parsedRows = signal<ParsedSiswaRow[]>([]);
  readonly importErrorMessage = signal<string | null>(null);
  readonly isImporting = signal<boolean>(false);

  // Upload Pas Foto Signals
  readonly isUploadingFoto = signal<boolean>(false);
  readonly uploadFotoError = signal<string | null>(null);
  readonly uploadFotoSuccess = signal<boolean>(false);
  readonly showSqlStorageModal = signal<boolean>(false);
  readonly sqlCopied = signal<boolean>(false);

  readonly sampleAvatars = SAMPLE_AVATARS;

  readonly siswaForm = new FormGroup({
    namaLengkap: new FormControl('', [Validators.required]),
    tempatLahir: new FormControl('', [Validators.required]),
    tanggalLahir: new FormControl('', [Validators.required]),
    kelas: new FormControl('', [Validators.required]),
    unsur: new FormControl('Siswa', [Validators.required]),
    jenisKelamin: new FormControl('Laki-laki', [Validators.required]),
    pasFoto: new FormControl('', [Validators.required]),
  });

  readonly validRowCount = computed(() => 
    this.parsedRows().filter(r => r.isValid).length
  );

  readonly invalidRowCount = computed(() => 
    this.parsedRows().filter(r => !r.isValid).length
  );

  readonly kelasList = computed(() => {
    const set = new Set<string>();
    for (const s of this.votingService.siswa()) {
      if (s.kelas) set.add(s.kelas);
    }
    return Array.from(set).sort();
  });

  readonly filteredSiswa = computed(() => {
    let list = this.votingService.siswa();
    const query = this.searchTerm().trim().toLowerCase();
    const kelas = this.selectedKelas();
    const unsurFilter = this.selectedUnsur();
    const status = this.selectedStatus();

    if (query) {
      list = list.filter(s => 
        s.namaLengkap.toLowerCase().includes(query) || 
        s.tempatLahir.toLowerCase().includes(query) ||
        s.kelas.toLowerCase().includes(query) ||
        (s.unsur && s.unsur.toLowerCase().includes(query))
      );
    }

    if (unsurFilter !== 'ALL') {
      list = list.filter(s => getUnsurPemilih(s) === unsurFilter);
    }

    if (kelas !== 'ALL') {
      list = list.filter(s => s.kelas === kelas);
    }

    if (status === 'SUDAH') {
      list = list.filter(s => s.sudahMemilih);
    } else if (status === 'BELUM') {
      list = list.filter(s => !s.sudahMemilih);
    }

    return list;
  });

  getUnsur(siswa: Siswa): 'siswa' | 'guru' | 'yayasan' {
    return getUnsurPemilih(siswa);
  }

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchTerm.set(val);
  }

  onFilterKelas(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedKelas.set(val);
  }

  onFilterUnsur(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedUnsur.set(val);
  }

  onFilterStatus(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedStatus.set(val);
  }

  onSyncDatabase(): void {
    this.votingService.syncFromSupabase();
  }

  formatTanggal(dateString: string): string {
    if (!dateString) return '-';
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const monthNum = parseInt(parts[1], 10);
        const day = parts[2];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${day} ${months[monthNum - 1] || monthNum} ${year}`;
      }
      return dateString;
    } catch {
      return dateString;
    }
  }

  // --- MANUAL MODAL ---
  bukaModalTambah(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.uploadFotoError.set(null);
    this.uploadFotoSuccess.set(false);
    this.siswaForm.reset({
      namaLengkap: '',
      tempatLahir: '',
      tanggalLahir: '',
      kelas: '',
      unsur: 'Siswa',
      jenisKelamin: 'Laki-laki',
      pasFoto: SAMPLE_AVATARS[0]
    });
    this.showModal.set(true);
  }

  bukaModalEdit(siswa: Siswa): void {
    this.isEditing.set(true);
    this.editingId.set(siswa.id);
    this.uploadFotoError.set(null);
    this.uploadFotoSuccess.set(false);

    let formUnsur = 'Siswa';
    if (siswa.unsur) {
      const u = siswa.unsur.toLowerCase();
      if (u.includes('guru') || u.includes('pendidik') || u.includes('staf')) formUnsur = 'Guru';
      else if (u.includes('yayasan') || u.includes('komite')) formUnsur = 'Yayasan';
      else formUnsur = 'Siswa';
    } else {
      const auto = getUnsurPemilih(siswa);
      formUnsur = auto === 'guru' ? 'Guru' : (auto === 'yayasan' ? 'Yayasan' : 'Siswa');
    }

    this.siswaForm.setValue({
      namaLengkap: siswa.namaLengkap,
      tempatLahir: siswa.tempatLahir,
      tanggalLahir: siswa.tanggalLahir,
      kelas: siswa.kelas,
      unsur: formUnsur,
      jenisKelamin: siswa.jenisKelamin || 'Laki-laki',
      pasFoto: siswa.pasFoto
    });
    this.showModal.set(true);
  }

  isDefaultAvatar(url: string | null | undefined): boolean {
    if (!url) return true;
    return this.sampleAvatars.includes(url);
  }

  resetKeDefaultAvatar(): void {
    this.siswaForm.patchValue({ pasFoto: this.sampleAvatars[0] });
    this.uploadFotoSuccess.set(false);
    this.uploadFotoError.set(null);
  }

  async onFilePasFotoChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.uploadFotoError.set('File harus berupa berkas gambar (JPG, PNG, atau WEBP).');
      return;
    }

    this.isUploadingFoto.set(true);
    this.uploadFotoError.set(null);
    this.uploadFotoSuccess.set(false);

    try {
      // 1. Pratinjau lokal instan dengan FileReader
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string;
        if (previewUrl) {
          this.siswaForm.patchValue({ pasFoto: previewUrl });
        }
      };
      reader.readAsDataURL(file);

      // 2. Unggah file asli ke Supabase Storage (bucket pas_foto)
      const res = await this.supabaseService.uploadPasFoto(file, file.name);

      if (res.publicUrl) {
        this.siswaForm.patchValue({ pasFoto: res.publicUrl });
        this.uploadFotoSuccess.set(true);
        this.uploadFotoError.set(null);
      } else {
        this.uploadFotoSuccess.set(false);
        this.uploadFotoError.set(res.error || 'Gagal mengunggah foto ke bucket pas_foto Supabase.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat upload foto';
      this.uploadFotoError.set(msg);
    } finally {
      this.isUploadingFoto.set(false);
      input.value = '';
    }
  }

  salinSqlStorage(): void {
    const sql = `-- 1. Pastikan bucket pas_foto berstatus Public
UPDATE storage.buckets SET public = true WHERE id = 'pas_foto';

-- 2. Kebijakan izin upload file ke bucket pas_foto
CREATE POLICY "Izinkan Upload pas_foto"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'pas_foto');

-- 3. Kebijakan izin melihat foto secara publik
CREATE POLICY "Izinkan Lihat pas_foto"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pas_foto');

-- 4. Kebijakan update foto di bucket pas_foto
CREATE POLICY "Izinkan Update pas_foto"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'pas_foto');`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(sql);
      this.sqlCopied.set(true);
      setTimeout(() => this.sqlCopied.set(false), 2500);
    }
  }

  pilihAvatar(url: string): void {
    this.siswaForm.patchValue({ pasFoto: url });
    this.uploadFotoSuccess.set(false);
    this.uploadFotoError.set(null);
  }

  tutupModal(): void {
    this.showModal.set(false);
    this.isEditing.set(false);
    this.editingId.set(null);
    this.uploadFotoError.set(null);
    this.uploadFotoSuccess.set(false);
  }

  simpanSiswa(): void {
    if (this.siswaForm.invalid) return;

    const val = this.siswaForm.value;
    const payload = {
      namaLengkap: val.namaLengkap || '',
      tempatLahir: val.tempatLahir || '',
      tanggalLahir: val.tanggalLahir || '',
      kelas: val.kelas || '',
      unsur: val.unsur || 'Siswa',
      jenisKelamin: val.jenisKelamin || 'Laki-laki',
      pasFoto: val.pasFoto || SAMPLE_AVATARS[0],
    };

    if (this.isEditing() && this.editingId()) {
      this.votingService.updateSiswa(this.editingId()!, payload);
    } else {
      this.votingService.tambahSiswa(payload);
    }

    this.tutupModal();
  }

  hapusSiswa(siswa: Siswa): void {
    if (confirm(`Hapus data pemilih ${siswa.namaLengkap}?`)) {
      this.votingService.hapusSiswa(siswa.id);
    }
  }

  // --- EXCEL IMPORT LOGIC ---
  bukaModalImport(): void {
    this.parsedRows.set([]);
    this.importErrorMessage.set(null);
    this.isImporting.set(false);
    this.showImportModal.set(true);
  }

  tutupModalImport(): void {
    this.showImportModal.set(false);
    this.parsedRows.set([]);
    this.importErrorMessage.set(null);
  }

  downloadTemplateExcel(): void {
    const templateData = [
      {
        nama_lengkap: 'Muhammad Rizky Pratama',
        tempat_lahir: 'Bandung',
        tanggal_lahir: '2010-05-14',
        kelas: '9-B',
        unsur: 'Siswa',
        jenis_kelamin: 'Laki-laki',
        pas_foto: ''
      },
      {
        nama_lengkap: 'Aulia Zahra Salsabila',
        tempat_lahir: 'Tasikmalaya',
        tanggal_lahir: '2010-08-21',
        kelas: '9-B',
        unsur: 'Siswa',
        jenis_kelamin: 'Perempuan',
        pas_foto: ''
      },
      {
        nama_lengkap: 'Ustadz Ahmad Fauzi, S.Pd',
        tempat_lahir: 'Tasikmalaya',
        tanggal_lahir: '1988-03-12',
        kelas: 'Guru',
        unsur: 'Guru',
        jenis_kelamin: 'Laki-laki',
        pas_foto: ''
      },
      {
        nama_lengkap: 'Drs. H. Mamat Rohimat',
        tempat_lahir: 'Tasikmalaya',
        tanggal_lahir: '1972-11-05',
        kelas: 'Yayasan',
        unsur: 'Yayasan',
        jenis_kelamin: 'Laki-laki',
        pas_foto: ''
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Format_Siswa');
    XLSX.writeFile(workbook, 'template_data_pemilih_osis.xlsx');
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.importErrorMessage.set(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        this.importErrorMessage.set('File Excel kosong atau tidak memiliki lembar kerja.');
        return;
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

      if (rawRows.length === 0) {
        this.importErrorMessage.set('Tidak ada baris data yang ditemukan dalam file.');
        return;
      }

      const parsed: ParsedSiswaRow[] = rawRows.map(row => {
        // Normalize column keys
        const getVal = (...keys: string[]): string => {
          for (const k of keys) {
            for (const rk of Object.keys(row)) {
              if (rk.trim().toLowerCase().replace(/[\s_-]/g, '') === k.toLowerCase().replace(/[\s_-]/g, '')) {
                const val = row[rk];
                return val !== undefined && val !== null ? String(val).trim() : '';
              }
            }
          }
          return '';
        };

        const namaLengkap = getVal('nama_lengkap', 'namalengkap', 'nama', 'name');
        const tempatLahir = getVal('tempat_lahir', 'tempatlahir', 'tempat', 'pob') || '-';
        let tanggalLahir = getVal('tanggal_lahir', 'tanggallahir', 'tanggal', 'tgllahir', 'dob');
        const kelas = getVal('kelas', 'class', 'rombel');
        const unsurRaw = getVal('unsur', 'kategori', 'peran', 'role');
        const jenisKelaminRaw = getVal('jenis_kelamin', 'jeniskelamin', 'jk', 'gender');
        const pasFoto = getVal('pas_foto', 'pasfoto', 'foto', 'photo') || SAMPLE_AVATARS[0];

        // Format tanggal jika numeric serial Excel
        if (tanggalLahir && !isNaN(Number(tanggalLahir)) && Number(tanggalLahir) > 20000) {
          const jsDate = new Date((Number(tanggalLahir) - (25567 + 2)) * 86400 * 1000);
          tanggalLahir = jsDate.toISOString().split('T')[0];
        } else if (!tanggalLahir) {
          tanggalLahir = '2010-01-01';
        }

        // Format unsur
        let unsur = 'Siswa';
        if (unsurRaw) {
          const uLower = unsurRaw.toLowerCase();
          if (uLower.includes('guru') || uLower.includes('pendidik') || uLower.includes('staf') || uLower.includes('pegawai')) {
            unsur = 'Guru';
          } else if (uLower.includes('yayasan') || uLower.includes('komite') || uLower.includes('pengurus')) {
            unsur = 'Yayasan';
          } else {
            unsur = 'Siswa';
          }
        } else {
          // Deteksi otomatis dari kelas
          const auto = getUnsurPemilih(kelas);
          unsur = auto === 'guru' ? 'Guru' : (auto === 'yayasan' ? 'Yayasan' : 'Siswa');
        }

        // Format jenis kelamin
        let jenisKelamin = 'Laki-laki';
        const jkLower = jenisKelaminRaw.toLowerCase();
        if (jkLower === 'p' || jkLower === 'perempuan' || jkLower === 'female') {
          jenisKelamin = 'Perempuan';
        }

        const isValid = Boolean(namaLengkap && kelas);
        const errorMessage = !namaLengkap 
          ? 'Nama lengkap wajib diisi' 
          : !kelas 
            ? 'Kelas wajib diisi' 
            : undefined;

        return {
          namaLengkap,
          tempatLahir,
          tanggalLahir,
          kelas,
          unsur,
          jenisKelamin,
          pasFoto,
          isValid,
          errorMessage
        };
      });

      this.parsedRows.set(parsed);
    } catch {
      this.importErrorMessage.set('Gagal membaca file. Pastikan format file adalah .xlsx, .xls, atau .csv yang valid.');
    } finally {
      input.value = '';
    }
  }

  async prosesSimpanImport(): Promise<void> {
    const validOnes = this.parsedRows().filter(r => r.isValid);
    if (validOnes.length === 0) return;

    this.isImporting.set(true);
    try {
      const payload = validOnes.map(r => ({
        namaLengkap: r.namaLengkap,
        tempatLahir: r.tempatLahir,
        tanggalLahir: r.tanggalLahir,
        kelas: r.kelas,
        unsur: r.unsur || 'Siswa',
        jenisKelamin: r.jenisKelamin,
        pasFoto: r.pasFoto
      }));

      await this.votingService.importSiswaBatch(payload);
      this.tutupModalImport();
    } catch {
      this.importErrorMessage.set('Terjadi kesalahan saat menyimpan data ke database.');
    } finally {
      this.isImporting.set(false);
    }
  }
}
