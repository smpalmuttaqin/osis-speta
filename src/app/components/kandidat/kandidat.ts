import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Kandidat } from '../../models/voting.models';
import { VotingService } from '../../services/voting.service';
import { SupabaseService } from '../../services/supabase.service';

const SAMPLE_KANDIDAT_PHOTOS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
];

@Component({
  selector: 'app-kandidat',
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
              Kandidat & Paslon OSIS
            </h1>
            <div class="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>OSIS SMP AL MUTTAQIN</span>
              <span aria-hidden="true">·</span>
              <span>Masa Bakti 2026/2027</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button 
            type="button"
            (click)="onSyncDatabase()"
            [disabled]="supabaseService.isSyncing()"
            class="px-3.5 py-2 border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs">
            <mat-icon class="text-[16px] w-4 h-4 text-emerald-600" [class.animate-spin]="supabaseService.isSyncing()">sync</mat-icon>
            <span>{{ supabaseService.isSyncing() ? 'Menyinkronkan...' : 'Sinkronkan Database' }}</span>
          </button>

          <button 
            type="button"
            (click)="bukaModalTambah()"
            class="px-4 py-2 bg-[#0062FF] hover:bg-[#0052D9] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-[0_4px_14px_rgba(0,98,255,0.25)] cursor-pointer">
            <mat-icon class="text-[16px] w-4 h-4">add_circle</mat-icon>
            <span>Tambah Kandidat</span>
          </button>
        </div>
      </div>

      <!-- Candidate Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        @for (k of votingService.kandidat(); track k.id) {
          <div class="bg-white border border-slate-100 rounded-2xl overflow-hidden flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
            
            <div class="p-6">
              <!-- Header with Nomor Urut / Badge & Actions -->
              <div class="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
                <div>
                  @if (k.jenisKandidat === 'wakil_siswi') {
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0062FF] border border-blue-100 mb-1">
                      WAKIL SISWI
                    </span>
                    <span class="text-[11px] font-semibold text-slate-500 tracking-wider block">NOMOR URUT</span>
                    <div class="text-3xl font-black text-slate-900 tracking-tight">
                      {{ (k.nomorUrut !== undefined && k.nomorUrut < 10) ? '0' + k.nomorUrut : (k.nomorUrut ?? '01') }}
                    </div>
                  } @else {
                    <span class="text-[11px] font-semibold text-slate-500 tracking-wider">NOMOR URUT</span>
                    <div class="text-3xl font-black text-slate-900 tracking-tight">
                      {{ (k.nomorUrut !== undefined && k.nomorUrut < 10) ? '0' + k.nomorUrut : k.nomorUrut }}
                    </div>
                  }
                </div>

                <div class="flex items-center gap-1">
                  <button 
                    type="button"
                    (click)="bukaModalEdit(k)"
                    title="Edit Kandidat"
                    class="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                    <mat-icon class="text-[18px] w-[18px] h-[18px]">edit</mat-icon>
                  </button>
                  <button 
                    type="button"
                    (click)="hapusKandidat(k)"
                    title="Hapus Kandidat"
                    class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">
                    <mat-icon class="text-[18px] w-[18px] h-[18px]">delete</mat-icon>
                  </button>
                </div>
              </div>

              <!-- Content based on type -->
              @if (k.jenisKandidat === 'wakil_siswi') {
                <div class="max-w-[180px] mx-auto text-center space-y-2 mb-4">
                  <div class="aspect-3/4 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs">
                    <img 
                      [src]="k.fotoWakil" 
                      [alt]="k.namaWakil"
                      referrerpolicy="no-referrer"
                      class="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span class="text-[10px] font-semibold text-slate-400 block">Calon Wakil Siswi</span>
                    <span class="text-xs font-bold text-slate-900 leading-snug block">{{ k.namaWakil }}</span>
                  </div>
                </div>
              } @else {
                <div class="grid grid-cols-2 gap-3 mb-5">
                  <!-- Calon Ketua -->
                  <div class="space-y-2">
                    <div class="aspect-3/4 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs">
                      <img 
                        [src]="k.fotoKetua" 
                        [alt]="k.namaKetua"
                        referrerpolicy="no-referrer"
                        class="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span class="text-[10px] font-semibold text-slate-400 block">Calon Ketua</span>
                      <span class="text-xs font-bold text-slate-900 leading-snug block line-clamp-2">{{ k.namaKetua }}</span>
                    </div>
                  </div>

                  <!-- Calon Wakil -->
                  <div class="space-y-2">
                    <div class="aspect-3/4 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs">
                      <img 
                        [src]="k.fotoWakil" 
                        [alt]="k.namaWakil"
                        referrerpolicy="no-referrer"
                        class="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span class="text-[10px] font-semibold text-slate-400 block">Calon Wakil</span>
                      <span class="text-xs font-bold text-slate-900 leading-snug block line-clamp-2">{{ k.namaWakil }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Card Bottom Stats -->
            <div class="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="text-slate-500">Perolehan Suara:</span>
              <span class="font-bold text-slate-900 tabular-nums">
                {{ getSuaraKandidat(k.id) }} Suara
              </span>
            </div>

          </div>
        }
      </div>

      <!-- DPT Datalist untuk Autocomplete Nama Siswa -->
      <datalist id="dptSiswaList">
        @for (siswa of votingService.siswa(); track siswa.id) {
          <option [value]="siswa.namaLengkap">Kelas {{ siswa.kelas }}</option>
        }
      </datalist>

      <!-- Modal Form Tambah / Edit Kandidat -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 class="text-base font-bold text-slate-900">
                {{ isEditing() ? 'Edit Data Kandidat' : 'Tambah Kandidat' }}
              </h2>
              <button 
                type="button"
                (click)="tutupModal()"
                class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <mat-icon class="text-[18px] w-[18px] h-[18px]">close</mat-icon>
              </button>
            </div>

            <form [formGroup]="kandidatForm" (ngSubmit)="simpanKandidat()" class="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              
              <!-- Jenis Kandidat Selector -->
              <div>
                <div class="block text-xs font-semibold text-slate-700 mb-1.5">
                  Kategori Kandidat
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    (click)="pilihKategori('paslon')"
                    class="py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    [class.bg-blue-50]="kandidatForm.get('jenisKandidat')?.value === 'paslon'"
                    [class.border-[#0062FF]]="kandidatForm.get('jenisKandidat')?.value === 'paslon'"
                    [class.text-[#0062FF]]="kandidatForm.get('jenisKandidat')?.value === 'paslon'"
                    [class.border-slate-200]="kandidatForm.get('jenisKandidat')?.value !== 'paslon'"
                    [class.text-slate-600]="kandidatForm.get('jenisKandidat')?.value !== 'paslon'">
                    <mat-icon class="text-[16px] w-4 h-4">group</mat-icon>
                    <span>Paslon (Ketua & Wakil)</span>
                  </button>

                  <button 
                    type="button"
                    (click)="pilihKategori('wakil_siswi')"
                    class="py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    [class.bg-blue-50]="kandidatForm.get('jenisKandidat')?.value === 'wakil_siswi'"
                    [class.border-[#0062FF]]="kandidatForm.get('jenisKandidat')?.value === 'wakil_siswi'"
                    [class.text-[#0062FF]]="kandidatForm.get('jenisKandidat')?.value === 'wakil_siswi'"
                    [class.border-slate-200]="kandidatForm.get('jenisKandidat')?.value !== 'wakil_siswi'"
                    [class.text-slate-600]="kandidatForm.get('jenisKandidat')?.value !== 'wakil_siswi'">
                    <mat-icon class="text-[16px] w-4 h-4">person</mat-icon>
                    <span>Calon Wakil Siswi</span>
                  </button>
                </div>
              </div>

              <!-- Nomor Urut (Untuk Paslon maupun Calon Wakil Siswi) -->
              <div>
                <label for="kandidatNomorUrut" class="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nomor Urut {{ kandidatForm.get('jenisKandidat')?.value === 'wakil_siswi' ? 'Calon Wakil Siswi' : 'Paslon' }} (Mulai 1)
                </label>
                <input 
                  id="kandidatNomorUrut"
                  type="number" 
                  formControlName="nomorUrut"
                  min="1"
                  class="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0062FF]" />
              </div>

              <!-- Grid Kandidat -->
              @if (kandidatForm.get('jenisKandidat')?.value === 'paslon') {
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- Calon Ketua -->
                  <div class="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3.5">
                    <div class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <mat-icon class="text-blue-600 text-[18px] w-[18px] h-[18px]">person</mat-icon>
                      <span>Calon Ketua (Siswa)</span>
                    </div>
                    <div>
                      <label for="kandidatNamaKetua" class="block text-xs font-semibold text-slate-700 mb-1">
                        Nama Ketua (Cari DPT)
                      </label>
                      <input 
                        id="kandidatNamaKetua"
                        type="text" 
                        list="dptSiswaList"
                        formControlName="namaKetua"
                        (input)="onKetuaInput($event)"
                        placeholder="Ketik nama siswa..."
                        class="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0062FF]" />
                    </div>
                    <div>
                      <span class="block text-xs font-semibold text-slate-700 mb-1">Pas Foto Ketua</span>
                      <div class="flex items-center gap-3">
                        <div class="w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                          <img [src]="kandidatForm.get('fotoKetua')?.value || samplePhotos[0]" alt="Foto Ketua" referrerpolicy="no-referrer" class="w-full h-full object-cover" />
                        </div>
                        <div class="flex-1 min-w-0">
                          <input #fileKetuaInput type="file" accept="image/*" (change)="onFotoKetuaChange($event)" class="hidden" />
                          <button type="button" (click)="fileKetuaInput.click()" [disabled]="isUploadingKetua()" class="px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-500 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 w-full justify-center cursor-pointer">
                            <mat-icon class="text-[15px] w-4 h-4 text-[#0062FF]">{{ isUploadingKetua() ? 'refresh' : 'cloud_upload' }}</mat-icon>
                            <span>{{ isUploadingKetua() ? 'Mengunggah...' : 'Unggah Foto' }}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Calon Wakil -->
                  <div class="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3.5">
                    <div class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <mat-icon class="text-blue-600 text-[18px] w-[18px] h-[18px]">person_outline</mat-icon>
                      <span>Calon Wakil (Siswa)</span>
                    </div>
                    <div>
                      <label for="kandidatNamaWakil" class="block text-xs font-semibold text-slate-700 mb-1">
                        Nama Wakil (Cari DPT)
                      </label>
                      <input 
                        id="kandidatNamaWakil"
                        type="text" 
                        list="dptSiswaList"
                        formControlName="namaWakil"
                        (input)="onWakilInput($event)"
                        placeholder="Ketik nama siswa..."
                        class="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0062FF]" />
                    </div>
                    <div>
                      <span class="block text-xs font-semibold text-slate-700 mb-1">Pas Foto Wakil</span>
                      <div class="flex items-center gap-3">
                        <div class="w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                          <img [src]="kandidatForm.get('fotoWakil')?.value || samplePhotos[1]" alt="Foto Wakil" referrerpolicy="no-referrer" class="w-full h-full object-cover" />
                        </div>
                        <div class="flex-1 min-w-0">
                          <input #fileWakilInput type="file" accept="image/*" (change)="onFotoWakilChange($event)" class="hidden" />
                          <button type="button" (click)="fileWakilInput.click()" [disabled]="isUploadingWakil()" class="px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-500 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 w-full justify-center cursor-pointer">
                            <mat-icon class="text-[15px] w-4 h-4 text-[#0062FF]">{{ isUploadingWakil() ? 'refresh' : 'cloud_upload' }}</mat-icon>
                            <span>{{ isUploadingWakil() ? 'Mengunggah...' : 'Unggah Foto' }}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              } @else {
                <!-- Calon Wakil Siswi -->
                <div class="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3.5 max-w-md mx-auto">
                  <div class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <mat-icon class="text-blue-600 text-[18px] w-[18px] h-[18px]">person</mat-icon>
                    <span>Calon Wakil Siswi</span>
                  </div>
                  <div>
                    <label for="kandidatNamaWakilSiswi" class="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Calon Wakil Siswi (Cari DPT)
                    </label>
                    <input 
                      id="kandidatNamaWakilSiswi"
                      type="text" 
                      list="dptSiswaList"
                      formControlName="namaWakil"
                      (input)="onWakilInput($event)"
                      placeholder="Ketik nama siswi..."
                      class="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0062FF]" />
                  </div>
                  <div>
                    <span class="block text-xs font-semibold text-slate-700 mb-1">Pas Foto Wakil Siswi</span>
                    <div class="flex items-center gap-3">
                      <div class="w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                        <img [src]="kandidatForm.get('fotoWakil')?.value || samplePhotos[1]" alt="Foto Wakil Siswi" referrerpolicy="no-referrer" class="w-full h-full object-cover" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <input #fileWakilSiswiInput type="file" accept="image/*" (change)="onFotoWakilChange($event)" class="hidden" />
                        <button type="button" (click)="fileWakilSiswiInput.click()" [disabled]="isUploadingWakil()" class="px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-500 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 w-full justify-center cursor-pointer">
                          <mat-icon class="text-[15px] w-4 h-4 text-[#0062FF]">{{ isUploadingWakil() ? 'refresh' : 'cloud_upload' }}</mat-icon>
                          <span>{{ isUploadingWakil() ? 'Mengunggah...' : 'Unggah Foto' }}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- Footer Buttons -->
              <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  (click)="tutupModal()"
                  class="px-4 py-2 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                  Batal
                </button>
                <button 
                  type="submit" 
                  class="px-5 py-2.5 bg-[#0062FF] hover:bg-[#0052D9] text-white text-xs font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(0,98,255,0.25)] cursor-pointer">
                  {{ isEditing() ? 'Simpan Perubahan' : 'Tambah Kandidat' }}
                </button>
              </div>

            </form>

          </div>
        </div>
      }

    </div>
  `
})
export class KandidatComponent {
  readonly votingService = inject(VotingService);
  readonly supabaseService = inject(SupabaseService);

  readonly showModal = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly editingId = signal<string | null>(null);

  readonly isUploadingKetua = signal<boolean>(false);
  readonly isUploadingWakil = signal<boolean>(false);

  onSyncDatabase(): void {
    this.votingService.syncFromSupabase();
  }

  readonly samplePhotos = SAMPLE_KANDIDAT_PHOTOS;

  readonly kandidatForm = new FormGroup({
    jenisKandidat: new FormControl<'paslon' | 'wakil_siswi'>('paslon', [Validators.required]),
    nomorUrut: new FormControl<number>(1),
    namaKetua: new FormControl<string>(''),
    fotoKetua: new FormControl<string>(''),
    namaWakil: new FormControl<string>('', [Validators.required]),
    fotoWakil: new FormControl<string>('', [Validators.required]),
  });

  getSuaraKandidat(kandidatId: string): number {
    const logs = this.votingService.suaraLog();
    if (logs.length > 0) {
      return logs.filter(l => l.kandidatId === kandidatId).length;
    }
    return this.votingService.siswa().filter(s => s.kandidatDipilihId === kandidatId || s.kandidatWakilDipilihId === kandidatId).length;
  }

  pilihKategori(jenis: 'paslon' | 'wakil_siswi'): void {
    this.kandidatForm.patchValue({ jenisKandidat: jenis });
    if (!this.isEditing()) {
      const list = this.votingService.kandidat().filter(k => k.jenisKandidat === jenis);
      const nextNomor = list.length + 1;
      this.kandidatForm.patchValue({ nomorUrut: nextNomor });
    }
  }

  bukaModalTambah(): void {
    const nextNomor = this.votingService.kandidat().filter(k => k.jenisKandidat !== 'wakil_siswi').length + 1;
    this.isEditing.set(false);
    this.editingId.set(null);
    this.isUploadingKetua.set(false);
    this.isUploadingWakil.set(false);
    this.kandidatForm.reset({
      jenisKandidat: 'paslon',
      nomorUrut: nextNomor,
      namaKetua: '',
      fotoKetua: SAMPLE_KANDIDAT_PHOTOS[0],
      namaWakil: '',
      fotoWakil: SAMPLE_KANDIDAT_PHOTOS[1],
    });
    this.showModal.set(true);
  }

  bukaModalEdit(k: Kandidat): void {
    this.isEditing.set(true);
    this.editingId.set(k.id);
    this.isUploadingKetua.set(false);
    this.isUploadingWakil.set(false);
    this.kandidatForm.setValue({
      jenisKandidat: k.jenisKandidat || (k.nomorUrut !== undefined ? 'paslon' : 'wakil_siswi'),
      nomorUrut: k.nomorUrut !== undefined ? k.nomorUrut : 1,
      namaKetua: k.namaKetua || '',
      fotoKetua: k.fotoKetua || SAMPLE_KANDIDAT_PHOTOS[0],
      namaWakil: k.namaWakil,
      fotoWakil: k.fotoWakil,
    });
    this.showModal.set(true);
  }

  onKetuaInput(event: Event): void {
    const name = (event.target as HTMLInputElement).value.trim().toLowerCase();
    const found = this.votingService.siswa().find(s => s.namaLengkap.toLowerCase() === name);
    if (found && found.pasFoto) {
      this.kandidatForm.patchValue({ fotoKetua: found.pasFoto });
    }
  }

  onWakilInput(event: Event): void {
    const name = (event.target as HTMLInputElement).value.trim().toLowerCase();
    const found = this.votingService.siswa().find(s => s.namaLengkap.toLowerCase() === name);
    if (found && found.pasFoto) {
      this.kandidatForm.patchValue({ fotoWakil: found.pasFoto });
    }
  }

  async onFotoKetuaChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (!file) return;

    this.isUploadingKetua.set(true);
    try {
      const res = await this.supabaseService.uploadPasFoto(file, file.name);
      if (res.publicUrl) {
        this.kandidatForm.patchValue({ fotoKetua: res.publicUrl });
      }
    } catch {
      // fallback
    } finally {
      this.isUploadingKetua.set(false);
      input.value = '';
    }
  }

  async onFotoWakilChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (!file) return;

    this.isUploadingWakil.set(true);
    try {
      const res = await this.supabaseService.uploadPasFoto(file, file.name);
      if (res.publicUrl) {
        this.kandidatForm.patchValue({ fotoWakil: res.publicUrl });
      }
    } catch {
      // fallback
    } finally {
      this.isUploadingWakil.set(false);
      input.value = '';
    }
  }

  tutupModal(): void {
    this.showModal.set(false);
    this.isEditing.set(false);
    this.editingId.set(null);
  }

  simpanKandidat(): void {
    const val = this.kandidatForm.value;
    const jenis = val.jenisKandidat || 'paslon';

    const payload = {
      jenisKandidat: jenis,
      nomorUrut: Number(val.nomorUrut) || 1,
      namaKetua: jenis === 'paslon' ? (val.namaKetua || '') : undefined,
      fotoKetua: jenis === 'paslon' ? (val.fotoKetua || SAMPLE_KANDIDAT_PHOTOS[0]) : undefined,
      namaWakil: val.namaWakil || '',
      fotoWakil: val.fotoWakil || SAMPLE_KANDIDAT_PHOTOS[1],
    };

    if (this.isEditing() && this.editingId()) {
      this.votingService.updateKandidat(this.editingId()!, payload);
    } else {
      this.votingService.tambahKandidat(payload);
    }

    this.tutupModal();
  }

  hapusKandidat(k: Kandidat): void {
    const title = k.jenisKandidat === 'wakil_siswi'
      ? `Calon Wakil Siswi No. ${k.nomorUrut || 1} (${k.namaWakil})`
      : `Paslon Nomor Urut ${k.nomorUrut} (${k.namaKetua} & ${k.namaWakil})`;
    if (confirm(`Hapus ${title}?`)) {
      this.votingService.hapusKandidat(k.id);
    }
  }
}
