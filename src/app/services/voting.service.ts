import { Injectable, computed, inject, signal } from '@angular/core';
import { Kandidat, Siswa, SuaraLog } from '../models/voting.models';
import { SupabaseService } from './supabase.service';

const STORAGE_KEY_SISWA = 'evoting_siswa_v1';
const STORAGE_KEY_KANDIDAT = 'evoting_kandidat_v1';
const STORAGE_KEY_LOG = 'evoting_suara_log_v1';

const INITIAL_KANDIDAT: Kandidat[] = [
  {
    id: 'kand-1',
    nomorUrut: 1,
    namaKetua: 'Muhammad Fadhil Pratama',
    namaWakil: 'Nayla Azzahra Putri',
    fotoKetua: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    fotoWakil: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    jenisKandidat: 'paslon'
  },
  {
    id: 'kand-2',
    nomorUrut: 2,
    namaKetua: 'Raditya Arya Mahendra',
    namaWakil: 'Siti Sarah Rahmadani',
    fotoKetua: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    fotoWakil: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    jenisKandidat: 'paslon'
  },
  {
    id: 'kand-3',
    nomorUrut: 3,
    namaKetua: 'Bintang Kevin Sanjaya',
    namaWakil: 'Clarissa Amanda Safitri',
    fotoKetua: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    fotoWakil: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    jenisKandidat: 'paslon'
  },
  {
    id: 'kand-wakil-1',
    nomorUrut: 1,
    namaWakil: 'Alya Zahra Maharani',
    fotoWakil: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    jenisKandidat: 'wakil_siswi'
  }
];

const INITIAL_SISWA: Siswa[] = [];

const INITIAL_LOGS: SuaraLog[] = [];

export interface KandidatHasilSuara {
  kandidat: Kandidat;
  jumlahSuara: number;
  persentase: number;
}

export interface RekapKelas {
  kelas: string;
  total: number;
  sudah: number;
  belum: number;
  persentase: number;
}

@Injectable({
  providedIn: 'root'
})
export class VotingService {
  private readonly supabaseService = inject(SupabaseService);

  private readonly _siswa = signal<Siswa[]>(this.loadSiswaFromStorage());
  private readonly _kandidat = signal<Kandidat[]>(this.loadKandidatFromStorage());
  private readonly _suaraLog = signal<SuaraLog[]>(this.loadLogsFromStorage());

  constructor() {
    this.syncFromSupabase();
  }

  async syncFromSupabase(): Promise<void> {
    this.supabaseService.isSyncing.set(true);
    try {
      // 1. Sinkronisasi Data Siswa
      const siswaData = await this.supabaseService.getSiswaList();
      if (siswaData !== null) {
        this._siswa.set(siswaData);
        this.saveSiswaToStorage(siswaData);
      }

      // 2. Sinkronisasi Data Pasangan Calon (Kandidat)
      let kandidatData = await this.supabaseService.getKandidatList();
      if (kandidatData !== null && kandidatData.length > 0) {
        // Pastikan calon wakil siswi tetap tersedia jika belum ada di database Supabase
        const hasWakilSiswi = kandidatData.some(k => k.jenisKandidat === 'wakil_siswi');
        if (!hasWakilSiswi) {
          const localWakil = this._kandidat().filter(k => k.jenisKandidat === 'wakil_siswi');
          if (localWakil.length > 0) {
            kandidatData = [...kandidatData, ...localWakil];
          } else {
            kandidatData.push({
              id: 'kand-wakil-1',
              nomorUrut: 1,
              namaWakil: 'Alya Zahra Maharani',
              fotoWakil: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
              jenisKandidat: 'wakil_siswi'
            });
          }
        }
        this._kandidat.set(kandidatData);
        this.saveKandidatToStorage(kandidatData);
      } else if (kandidatData !== null && kandidatData.length === 0 && this._kandidat().length > 0) {
        // Jika database Supabase masih kosong, unggah kandidat lokal ke database Supabase
        for (const k of this._kandidat()) {
          await this.supabaseService.simpanKandidat({
            nomorUrut: k.nomorUrut,
            jenisKandidat: k.jenisKandidat,
            namaKetua: k.namaKetua,
            namaWakil: k.namaWakil,
            fotoKetua: k.fotoKetua,
            fotoWakil: k.fotoWakil
          });
        }
        kandidatData = await this.supabaseService.getKandidatList();
        if (kandidatData && kandidatData.length > 0) {
          this._kandidat.set(kandidatData);
          this.saveKandidatToStorage(kandidatData);
        }
      }

      // 3. Sinkronisasi Log Suara
      const logData = await this.supabaseService.getSuaraLogList();
      if (logData !== null) {
        this._suaraLog.set(logData);
        this.saveLogsToStorage(logData);
      }

      this.supabaseService.lastSyncTime.set(new Date().toLocaleTimeString('id-ID'));
    } catch (err) {
      console.debug('Sync from Supabase notice:', err);
    } finally {
      this.supabaseService.isSyncing.set(false);
    }
  }

  async sinkronkanSemuaKeSupabase(): Promise<void> {
    await this.syncFromSupabase();
  }

  async importSiswaBatch(list: Omit<Siswa, 'id' | 'sudahMemilih' | 'waktuMemilih' | 'kandidatDipilihId'>[]): Promise<boolean> {
    if (list.length === 0) return true;
    this.supabaseService.isSyncing.set(true);
    try {
      const ok = await this.supabaseService.batchSimpanSiswa(list);
      const data = await this.supabaseService.getSiswaList();
      if (data !== null) {
        this._siswa.set(data);
        this.saveSiswaToStorage(data);
      } else {
        const localItems: Siswa[] = list.map(item => ({
          ...item,
          id: 'sis-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
          sudahMemilih: false
        }));
        const updated = [...localItems, ...this._siswa()];
        this._siswa.set(updated);
        this.saveSiswaToStorage(updated);
      }
      this.supabaseService.lastSyncTime.set(new Date().toLocaleTimeString('id-ID'));
      return ok;
    } catch {
      return false;
    } finally {
      this.supabaseService.isSyncing.set(false);
    }
  }

  readonly siswa = this._siswa.asReadonly();
  readonly kandidat = this._kandidat.asReadonly();
  readonly suaraLog = this._suaraLog.asReadonly();

  readonly totalSiswa = computed(() => this._siswa().length);
  
  readonly sudahMemilihCount = computed(() => 
    this._siswa().filter(s => s.sudahMemilih).length
  );

  readonly belumMemilihCount = computed(() => 
    this._siswa().filter(s => !s.sudahMemilih).length
  );

  readonly persentaseSudah = computed(() => {
    const total = this.totalSiswa();
    if (total === 0) return 0;
    return Math.round((this.sudahMemilihCount() / total) * 100);
  });

  readonly persentaseBelum = computed(() => {
    const total = this.totalSiswa();
    if (total === 0) return 0;
    return Math.round((this.belumMemilihCount() / total) * 100);
  });

  readonly hasilKandidat = computed<KandidatHasilSuara[]>(() => {
    const kandidatList = this._kandidat();
    const siswaList = this._siswa();
    const logs = this._suaraLog();

    const paslonLogs = logs.filter(l => {
      const kand = kandidatList.find(x => x.id === l.kandidatId);
      return !kand || kand.jenisKandidat !== 'wakil_siswi';
    });
    const wakilLogs = logs.filter(l => {
      const kand = kandidatList.find(x => x.id === l.kandidatId);
      return kand?.jenisKandidat === 'wakil_siswi';
    });

    const totalPemilihPaslon = paslonLogs.length > 0 
      ? paslonLogs.length 
      : siswaList.filter(s => s.sudahMemilih && s.kandidatDipilihId).length;

    const totalPemilihWakil = wakilLogs.length > 0 
      ? wakilLogs.length 
      : siswaList.filter(s => s.kandidatWakilDipilihId).length;

    return kandidatList
      .slice()
      .sort((a, b) => {
        if (a.jenisKandidat !== b.jenisKandidat) {
          return a.jenisKandidat === 'paslon' ? -1 : 1;
        }
        return (a.nomorUrut || 999) - (b.nomorUrut || 999);
      })
      .map(k => {
        const isWakil = k.jenisKandidat === 'wakil_siswi';
        const jumlahSuara = logs.length > 0
          ? logs.filter(l => l.kandidatId === k.id).length
          : (isWakil 
              ? siswaList.filter(s => s.kandidatWakilDipilihId === k.id).length
              : siswaList.filter(s => s.kandidatDipilihId === k.id).length);

        const basis = isWakil ? totalPemilihWakil : totalPemilihPaslon;
        const persentase = basis > 0 ? Math.round((jumlahSuara / basis) * 100) : 0;

        return {
          kandidat: k,
          jumlahSuara,
          persentase
        };
      });
  });

  readonly rekapPerKelas = computed<RekapKelas[]>(() => {
    const siswaList = this._siswa();
    const map = new Map<string, { total: number; sudah: number }>();

    for (const s of siswaList) {
      const entry = map.get(s.kelas) || { total: 0, sudah: 0 };
      entry.total += 1;
      if (s.sudahMemilih) entry.sudah += 1;
      map.set(s.kelas, entry);
    }

    const result: RekapKelas[] = [];
    const keys = Array.from(map.keys()).sort();
    for (const kelas of keys) {
      const entry = map.get(kelas)!;
      const belum = entry.total - entry.sudah;
      const persentase = entry.total > 0 ? Math.round((entry.sudah / entry.total) * 100) : 0;
      result.push({
        kelas,
        total: entry.total,
        sudah: entry.sudah,
        belum,
        persentase
      });
    }
    return result;
  });

  // Siswa Actions
  tambahSiswa(data: Omit<Siswa, 'id' | 'sudahMemilih' | 'waktuMemilih' | 'kandidatDipilihId'>): Siswa {
    const id = 'sis-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newSiswa: Siswa = {
      ...data,
      id,
      sudahMemilih: false
    };
    const updated = [newSiswa, ...this._siswa()];
    this._siswa.set(updated);
    this.saveSiswaToStorage(updated);

    // Sync to Supabase in background
    this.supabaseService.simpanSiswa(data).then(supabaseId => {
      if (supabaseId) {
        const withRealId = this._siswa().map(s => s.id === id ? { ...s, id: supabaseId } : s);
        this._siswa.set(withRealId);
        this.saveSiswaToStorage(withRealId);
      }
    }).catch(err => {
      console.debug('Supabase sync notice:', err);
    });

    return newSiswa;
  }

  updateSiswa(id: string, data: Partial<Omit<Siswa, 'id'>>): void {
    const updated = this._siswa().map(s => {
      if (s.id === id) {
        return { ...s, ...data };
      }
      return s;
    });
    this._siswa.set(updated);
    this.saveSiswaToStorage(updated);

    // Sync to Supabase
    this.supabaseService.updateSiswa(id, data).catch(err => {
      console.debug('Supabase sync notice:', err);
    });
  }

  hapusSiswa(id: string): void {
    const updated = this._siswa().filter(s => s.id !== id);
    this._siswa.set(updated);
    this.saveSiswaToStorage(updated);

    // Sync to Supabase
    this.supabaseService.hapusSiswa(id).catch(err => {
      console.debug('Supabase sync notice:', err);
    });

    // Filter logs if needed
    const updatedLogs = this._suaraLog().filter(l => l.siswaId !== id);
    this._suaraLog.set(updatedLogs);
    this.saveLogsToStorage(updatedLogs);
  }

  // Kandidat Actions
  tambahKandidat(data: Omit<Kandidat, 'id'>): Kandidat {
    const id = 'kand-' + Date.now().toString(36);
    const newKandidat: Kandidat = {
      ...data,
      id
    };
    const updated = [...this._kandidat(), newKandidat].sort((a, b) => {
      if (a.jenisKandidat !== b.jenisKandidat) {
        return a.jenisKandidat === 'paslon' ? -1 : 1;
      }
      return (a.nomorUrut || 999) - (b.nomorUrut || 999);
    });
    this._kandidat.set(updated);
    this.saveKandidatToStorage(updated);

    // Sync to Supabase
    this.supabaseService.simpanKandidat(data).then(newDbId => {
      if (newDbId) {
        this.supabaseService.getKandidatList().then(list => {
          if (list && list.length > 0) {
            this._kandidat.set(list);
            this.saveKandidatToStorage(list);
          }
        });
      }
    }).catch(err => console.debug('Supabase add kandidat notice:', err));

    return newKandidat;
  }

  updateKandidat(id: string, data: Partial<Omit<Kandidat, 'id'>>): void {
    const updated = this._kandidat().map(k => {
      if (k.id === id) {
        return { ...k, ...data };
      }
      return k;
    }).sort((a, b) => {
      if (a.jenisKandidat !== b.jenisKandidat) {
        return a.jenisKandidat === 'paslon' ? -1 : 1;
      }
      return (a.nomorUrut || 999) - (b.nomorUrut || 999);
    });

    this._kandidat.set(updated);
    this.saveKandidatToStorage(updated);

    // Sync to Supabase
    this.supabaseService.updateKandidat(id, data).catch(err => console.debug('Supabase update kandidat notice:', err));
  }

  hapusKandidat(id: string): void {
    const updated = this._kandidat().filter(k => k.id !== id);
    this._kandidat.set(updated);
    this.saveKandidatToStorage(updated);

    const updatedSiswa = this._siswa().map(s => {
      if (s.kandidatDipilihId === id) {
        return { ...s, sudahMemilih: false, waktuMemilih: undefined, kandidatDipilihId: undefined };
      }
      return s;
    });
    this._siswa.set(updatedSiswa);
    this.saveSiswaToStorage(updatedSiswa);

    const updatedLogs = this._suaraLog().filter(l => l.kandidatId !== id);
    this._suaraLog.set(updatedLogs);
    this.saveLogsToStorage(updatedLogs);

    // Sync to Supabase
    this.supabaseService.hapusKandidat(id).catch(err => console.debug('Supabase delete kandidat notice:', err));
  }

  // Voting action
  catatSuara(siswaId: string, kandidatId: string): boolean {
    return this.catatSuaraLengkap(siswaId, kandidatId);
  }

  catatSuaraLengkap(siswaId: string, paslonId: string, wakilSiswiId?: string): boolean {
    const siswaItem = this._siswa().find(s => s.id === siswaId);
    const paslonItem = this._kandidat().find(k => k.id === paslonId);
    const wakilSiswiItem = wakilSiswiId ? this._kandidat().find(k => k.id === wakilSiswiId) : undefined;

    if (!siswaItem || !paslonItem) return false;
    if (siswaItem.sudahMemilih) return false;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updatedSiswa = this._siswa().map(s => {
      if (s.id === siswaId) {
        return {
          ...s,
          sudahMemilih: true,
          waktuMemilih: formattedDate,
          kandidatDipilihId: paslonId,
          kandidatWakilDipilihId: wakilSiswiId
        };
      }
      return s;
    });

    const newLogs: SuaraLog[] = [];

    // Log 1: Paslon
    newLogs.push({
      id: 'log-' + Date.now().toString(36) + '-1',
      siswaId: siswaItem.id,
      siswaNama: siswaItem.namaLengkap,
      kelas: siswaItem.kelas,
      kandidatId: paslonItem.id,
      nomorUrut: paslonItem.nomorUrut,
      timestamp: formattedDate
    });

    // Log 2: Wakil Siswi (jika ada)
    if (wakilSiswiItem) {
      newLogs.push({
        id: 'log-' + Date.now().toString(36) + '-2',
        siswaId: siswaItem.id,
        siswaNama: siswaItem.namaLengkap,
        kelas: siswaItem.kelas,
        kandidatId: wakilSiswiItem.id,
        nomorUrut: wakilSiswiItem.nomorUrut,
        timestamp: formattedDate
      });
    }

    const updatedLogs = [...newLogs, ...this._suaraLog()];

    this._siswa.set(updatedSiswa);
    this.saveSiswaToStorage(updatedSiswa);

    this._suaraLog.set(updatedLogs);
    this.saveLogsToStorage(updatedLogs);

    // 1. Update status siswa di Supabase
    this.supabaseService.updateSiswa(siswaId, {
      sudahMemilih: true,
      waktuMemilih: formattedDate
    }).catch(err => {
      console.debug('Supabase sync siswa notice:', err);
    });

    // 2. Simpan catatan log suara sah ke Supabase
    this.supabaseService.simpanSuaraLog({
      siswaId: siswaItem.id,
      siswaNama: siswaItem.namaLengkap,
      kelas: siswaItem.kelas,
      kandidatId: paslonItem.id,
      nomorUrut: paslonItem.nomorUrut,
      timestamp: now.toISOString()
    }).catch(err => {
      console.debug('Supabase sync log 1 notice:', err);
    });

    if (wakilSiswiItem) {
      this.supabaseService.simpanSuaraLog({
        siswaId: siswaItem.id,
        siswaNama: siswaItem.namaLengkap,
        kelas: siswaItem.kelas,
        kandidatId: wakilSiswiItem.id,
        nomorUrut: wakilSiswiItem.nomorUrut,
        timestamp: now.toISOString()
      }).catch(err => {
        console.debug('Supabase sync log 2 notice:', err);
      });
    }

    return true;
  }

  resetPemungutanSuara(): void {
    const updatedSiswa = this._siswa().map(s => ({
      ...s,
      sudahMemilih: false,
      waktuMemilih: undefined,
      kandidatDipilihId: undefined
    }));
    this._siswa.set(updatedSiswa);
    this.saveSiswaToStorage(updatedSiswa);

    this._suaraLog.set([]);
    this.saveLogsToStorage([]);

    // Reset status memilih dan log di database Supabase
    this.supabaseService.resetSemuaSuaraDiDatabase().catch(err => {
      console.debug('Supabase reset notice:', err);
    });
  }

  resetKeDataAwal(): void {
    this._siswa.set(INITIAL_SISWA);
    this.saveSiswaToStorage(INITIAL_SISWA);

    this._kandidat.set(INITIAL_KANDIDAT);
    this.saveKandidatToStorage(INITIAL_KANDIDAT);

    this._suaraLog.set(INITIAL_LOGS);
    this.saveLogsToStorage(INITIAL_LOGS);
  }

  private loadSiswaFromStorage(): Siswa[] {
    if (typeof window === 'undefined') return INITIAL_SISWA;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SISWA);
      return raw ? JSON.parse(raw) : INITIAL_SISWA;
    } catch {
      return INITIAL_SISWA;
    }
  }

  private saveSiswaToStorage(data: Siswa[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_SISWA, JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  private loadKandidatFromStorage(): Kandidat[] {
    if (typeof window === 'undefined') return INITIAL_KANDIDAT;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_KANDIDAT);
      let list: Kandidat[] = raw ? JSON.parse(raw) : INITIAL_KANDIDAT;
      list = list.map(k => {
        const isWakil = k.jenisKandidat === 'wakil_siswi' || (!k.namaKetua || k.namaKetua === '-' || k.namaKetua.trim() === '');
        return {
          ...k,
          jenisKandidat: isWakil ? 'wakil_siswi' : (k.jenisKandidat || 'paslon')
        };
      });
      const hasWakilSiswi = list.some(k => k.jenisKandidat === 'wakil_siswi');
      if (!hasWakilSiswi) {
        list.push({
          id: 'kand-wakil-1',
          nomorUrut: 1,
          namaWakil: 'Alya Zahra Maharani',
          fotoWakil: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
          jenisKandidat: 'wakil_siswi'
        });
      }
      return list;
    } catch {
      return INITIAL_KANDIDAT;
    }
  }

  private saveKandidatToStorage(data: Kandidat[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_KANDIDAT, JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  private loadLogsFromStorage(): SuaraLog[] {
    if (typeof window === 'undefined') return INITIAL_LOGS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LOG);
      return raw ? JSON.parse(raw) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  }

  private saveLogsToStorage(data: SuaraLog[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_LOG, JSON.stringify(data));
    } catch {
      // ignore
    }
  }
}

export function getUnsurPemilih(siswaOrKelas?: Siswa | { unsur?: string; kelas?: string } | string | null): 'siswa' | 'guru' | 'yayasan' {
  if (!siswaOrKelas) return 'guru';
  
  let unsurVal = '';
  let kelasVal = '';

  if (typeof siswaOrKelas === 'object') {
    if (siswaOrKelas.unsur) {
      unsurVal = String(siswaOrKelas.unsur).toLowerCase().trim();
    }
    if (siswaOrKelas.kelas) {
      kelasVal = String(siswaOrKelas.kelas).toLowerCase().trim();
    }
  } else if (typeof siswaOrKelas === 'string') {
    const s = siswaOrKelas.toLowerCase().trim();
    // Jika string berisi unsur langsung
    if (s === 'siswa' || s === 'guru' || s === 'yayasan') {
      return s as 'siswa' | 'guru' | 'yayasan';
    }
    kelasVal = s;
  }

  // 1. PRIORITAS UTAMA: Kolom 'unsur' dari database (siswa, guru, yayasan)
  if (unsurVal) {
    if (
      unsurVal.includes('guru') || 
      unsurVal.includes('pendidik') || 
      unsurVal.includes('pengajar') || 
      unsurVal.includes('staf') || 
      unsurVal.includes('staff') || 
      unsurVal.includes('pegawai') || 
      unsurVal.includes('tu') || 
      unsurVal.includes('tata usaha') || 
      unsurVal.includes('karyawan') || 
      unsurVal.includes('ustadz') || 
      unsurVal.includes('ustadzah') || 
      unsurVal.includes('kepsek') || 
      unsurVal.includes('kepala') || 
      unsurVal.includes('dewan') || 
      unsurVal.includes('wali') || 
      unsurVal === 'g'
    ) {
      return 'guru';
    }
    if (
      unsurVal.includes('yayasan') || 
      unsurVal.includes('komite') || 
      unsurVal.includes('pengurus') || 
      unsurVal.includes('pembina')
    ) {
      return 'yayasan';
    }
    if (
      unsurVal.includes('siswa') || 
      unsurVal.includes('santri') || 
      unsurVal.includes('murid') || 
      unsurVal.includes('pelajar') || 
      unsurVal.includes('siswi') || 
      unsurVal === 's'
    ) {
      return 'siswa';
    }
    // Jika kolom unsur diisi selain kata siswa/santri, anggap guru/staf
    return 'guru';
  }

  // 2. FALLBACK: Jika kolom 'unsur' kosong / belum diisi, deteksi dari string kelas
  const k = kelasVal;
  if (!k) return 'guru';
  
  // Perluasan keyword untuk guru/staf
  if (
    k.includes('guru') || 
    k.includes('pendidik') || 
    k.includes('pengajar') || 
    k.includes('staf') || 
    k.includes('staff') || 
    k.includes('pegawai') || 
    k.includes('tu') || 
    k.includes('tata usaha') || 
    k.includes('karyawan') || 
    k.includes('ustadz') || 
    k.includes('ustadzah') || 
    k.includes('kepsek') || 
    k.includes('kepala') || 
    k.includes('dewan') || 
    k.includes('wali') || 
    k === '-' || 
    k === ''
  ) {
    return 'guru';
  }
  
  // Perluasan keyword untuk yayasan/komite
  if (k.includes('yayasan') || k.includes('komite') || k.includes('pengurus') || k.includes('pembina')) {
    return 'yayasan';
  }
  
  // Deteksi siswa yang lebih spesifik (Kelas 7-9)
  if (
    /^(7|8|9|vii|viii|ix)/i.test(k) || 
    k.includes('kelas 7') || k.includes('kelas 8') || k.includes('kelas 9') || 
    k.includes('kls 7') || k.includes('kls 8') || k.includes('kls 9') ||
    k.includes('siswa') || k.includes('santri')
  ) {
    if (!k.includes('guru') && !k.includes('wali') && !k.includes('ustadz') && !k.includes('pengajar') && !k.includes('staf')) {
      return 'siswa';
    }
  }
  
  // Default dianggap guru/staf jika tidak terdeteksi sebagai siswa
  return 'guru';
}

export function dapatMemilihKandidat(siswa: Siswa, kandidat: Kandidat): boolean {
  // Ambil unsur pemilih (memprioritaskan kolom unsur dari database)
  const unsur = getUnsurPemilih(siswa);
  const jk = (siswa.jenisKelamin || 'Laki-laki').toLowerCase();
  
  // Jika kandidat adalah calon wakil siswi:
  if (kandidat.jenisKandidat === 'wakil_siswi') {
    // ATURAN HAK PILIH:
    // 1. Pemilih siswa laki-laki: TIDAK BISA memilih wakil siswi (hanya bisa memilih paslon ketua-wakil)
    if (unsur === 'siswa' && (jk.includes('laki') || jk === 'l' || jk === 'pria')) {
      return false;
    }
    // 2. Pemilih siswa perempuan: BISA memilih wakil siswi
    // 3. Pemilih unsur Guru (laki-laki maupun perempuan): BISA memilih wakil siswi
    // 4. Pemilih unsur Yayasan (laki-laki maupun perempuan): BISA memilih wakil siswi
    return true;
  }
  
  // Kandidat jenis 'paslon' (Ketua & Wakil): semua pemilih berhak memilih
  return true;
}

