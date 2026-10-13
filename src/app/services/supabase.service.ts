import { Injectable, signal } from '@angular/core';
import { Kandidat, Siswa, SuaraLog } from '../models/voting.models';

export const SUPABASE_CONFIG = {
  url: 'https://avrudqubtdtasaaugtjx.supabase.co',
  anonKey: 'sb_publishable_Q1p8e8SJhFuoI4glGiwDEw_kq1KhEZ2',
  logoUrl: '/logo_smp_al_muttaqin.png',
  logoRemoteUrl: 'https://avrudqubtdtasaaugtjx.supabase.co/storage/v1/object/public/foto_app/LOGO%20SMP%20AL%20MUTTAQIN%20Baru%20(1).png',
  appName: 'OSIS SMP AL MUTTAQIN'
};

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  readonly isConnected = signal<boolean>(true);
  readonly isSyncing = signal<boolean>(false);
  readonly lastSyncTime = signal<string>('Baru saja');

  private getHeaders(): Record<string, string> {
    return {
      'apikey': SUPABASE_CONFIG.anonKey,
      'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
      'Content-Type': 'application/json'
    };
  }

  // ==========================================
  // TABEL SISWA
  // ==========================================
  async getSiswaList(): Promise<Siswa[] | null> {
    try {
      const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/siswa?select=*&order=created_at.desc`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (!Array.isArray(data)) return null;

      this.isConnected.set(true);
      return data.map((item: Record<string, unknown>) => {
        const rawUnsur = item['unsur'] ?? item['Unsur'] ?? item['UNSUR'] ?? item['peran'] ?? item['role'] ?? item['kategori'];
        const unsur = rawUnsur !== undefined && rawUnsur !== null ? String(rawUnsur).trim() : undefined;

        return {
          id: String(item['id']),
          namaLengkap: String(item['nama_lengkap'] || ''),
          tempatLahir: String(item['tempat_lahir'] || ''),
          tanggalLahir: String(item['tanggal_lahir'] || ''),
          kelas: String(item['kelas'] || ''),
          unsur,
          jenisKelamin: item['jenis_kelamin'] ? String(item['jenis_kelamin']) : 'Laki-laki',
          pasFoto: String(item['pas_foto'] || ''),
          sudahMemilih: Boolean(item['sudah_memilih']),
          waktuMemilih: item['waktu_memilih'] ? String(item['waktu_memilih']) : undefined
        };
      });
    } catch {
      this.isConnected.set(false);
      return null;
    }
  }

  async simpanSiswa(siswa: Omit<Siswa, 'id' | 'sudahMemilih' | 'waktuMemilih' | 'kandidatDipilihId'>): Promise<string | null> {
    try {
      const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/siswa`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          nama_lengkap: siswa.namaLengkap,
          tempat_lahir: siswa.tempatLahir,
          tanggal_lahir: siswa.tanggalLahir,
          kelas: siswa.kelas,
          unsur: siswa.unsur || null,
          jenis_kelamin: siswa.jenisKelamin || 'Laki-laki',
          pas_foto: siswa.pasFoto,
          sudah_memilih: false
        })
      });

      if (!response.ok) return null;
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return String(data[0]['id']);
      }
      return null;
    } catch {
      return null;
    }
  }

  async batchSimpanSiswa(siswaList: Omit<Siswa, 'id' | 'sudahMemilih' | 'waktuMemilih' | 'kandidatDipilihId'>[]): Promise<boolean> {
    if (siswaList.length === 0) return true;
    try {
      const payload = siswaList.map(s => ({
        nama_lengkap: s.namaLengkap,
        tempat_lahir: s.tempatLahir,
        tanggal_lahir: s.tanggalLahir,
        kelas: s.kelas,
        unsur: s.unsur || null,
        jenis_kelamin: s.jenisKelamin || 'Laki-laki',
        pas_foto: s.pasFoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        sudah_memilih: false
      }));

      const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/siswa`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  async updateSiswa(id: string, payload: Partial<Omit<Siswa, 'id'>>): Promise<boolean> {
    try {
      const updateData: Record<string, unknown> = {};
      if (payload.namaLengkap !== undefined) updateData['nama_lengkap'] = payload.namaLengkap;
      if (payload.tempatLahir !== undefined) updateData['tempat_lahir'] = payload.tempatLahir;
      if (payload.tanggalLahir !== undefined) updateData['tanggal_lahir'] = payload.tanggalLahir;
      if (payload.kelas !== undefined) updateData['kelas'] = payload.kelas;
      if (payload.unsur !== undefined) updateData['unsur'] = payload.unsur;
      if (payload.jenisKelamin !== undefined) updateData['jenis_kelamin'] = payload.jenisKelamin;
      if (payload.pasFoto !== undefined) updateData['pas_foto'] = payload.pasFoto;
      if (payload.sudahMemilih !== undefined) updateData['sudah_memilih'] = payload.sudahMemilih;
      if (payload.waktuMemilih !== undefined) updateData['waktu_memilih'] = payload.waktuMemilih;

      const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/siswa?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(updateData)
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  async hapusSiswa(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/siswa?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'return=minimal'
        }
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  // ==========================================
  // STORAGE SUPABASE: BUCKET pas_foto
  // ==========================================
  async uploadPasFoto(file: File | Blob, originalFileName?: string): Promise<{ publicUrl: string | null; error?: string }> {
    try {
      const ext = originalFileName ? (originalFileName.split('.').pop()?.toLowerCase() || 'jpg') : 'jpg';
      const cleanName = (originalFileName || 'foto')
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 30);
      const uniqueName = `siswa_${Date.now()}_${cleanName}.${ext}`;

      const uploadUrl = `${SUPABASE_CONFIG.url}/storage/v1/object/pas_foto/${uniqueName}`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_CONFIG.anonKey,
          'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
          'Content-Type': file.type || 'image/jpeg',
          'x-upsert': 'true'
        },
        body: file
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = (errorData as Record<string, unknown>)['message'] 
          ? String((errorData as Record<string, unknown>)['message']) 
          : response.statusText || 'Gagal mengunggah foto ke Supabase Storage';
        return { publicUrl: null, error: errorMsg };
      }

      // Public URL format Supabase Storage
      const publicUrl = `${SUPABASE_CONFIG.url}/storage/v1/object/public/pas_foto/${uniqueName}`;
      return { publicUrl, error: undefined };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala jaringan saat upload foto';
      return { publicUrl: null, error: msg };
    }
  }

  // ==========================================
  // TABEL KANDIDAT
  // ==========================================
  async getKandidatList(): Promise<Kandidat[] | null> {
    try {
      const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/kandidat?select=*&order=nomor_urut.asc.nullslast`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) return null;
      const data = await response.json();
      if (!Array.isArray(data)) return null;

      return data.map((item: Record<string, unknown>) => {
        const jenisRaw = item['jenis_kandidat'] ? String(item['jenis_kandidat']).trim().toLowerCase() : '';
        const namaKetuaRaw = item['nama_ketua'] !== undefined && item['nama_ketua'] !== null ? String(item['nama_ketua']).trim() : '';

        const isWakilSiswi = 
          jenisRaw === 'wakil_siswi' || 
          jenisRaw.includes('siswi') || 
          jenisRaw.includes('wakil') || 
          !namaKetuaRaw || 
          namaKetuaRaw === '-' || 
          namaKetuaRaw === '--' ||
          namaKetuaRaw.toLowerCase() === 'null';

        const namaWakilRaw = item['nama_wakil'] !== undefined && item['nama_wakil'] !== null ? String(item['nama_wakil']).trim() : '';
        const fotoWakilRaw = item['foto_wakil'] !== undefined && item['foto_wakil'] !== null ? String(item['foto_wakil']).trim() : '';
        const fotoKetuaRaw = item['foto_ketua'] !== undefined && item['foto_ketua'] !== null ? String(item['foto_ketua']).trim() : '';

        // Untuk wakil siswi: pastikan nama terisi baik jika disimpan di kolom nama_wakil maupun nama_ketua/nama
        const finalNamaWakil = isWakilSiswi 
          ? (namaWakilRaw || (namaKetuaRaw && namaKetuaRaw !== '-' ? namaKetuaRaw : '') || String(item['nama'] || '') || 'Calon Wakil Siswi')
          : (namaWakilRaw || '');

        const finalFotoWakil = isWakilSiswi
          ? (fotoWakilRaw || (fotoKetuaRaw && fotoKetuaRaw !== '-' ? fotoKetuaRaw : '') || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80')
          : (fotoWakilRaw || '');

        const jenisKandidat: 'paslon' | 'wakil_siswi' = isWakilSiswi ? 'wakil_siswi' : 'paslon';

        return {
          id: String(item['id']),
          nomorUrut: item['nomor_urut'] !== null && item['nomor_urut'] !== undefined ? Number(item['nomor_urut']) : undefined,
          jenisKandidat,
          namaKetua: (!isWakilSiswi && namaKetuaRaw && namaKetuaRaw !== '-') ? namaKetuaRaw : undefined,
          namaWakil: finalNamaWakil,
          fotoKetua: (!isWakilSiswi && fotoKetuaRaw && fotoKetuaRaw !== '-') ? fotoKetuaRaw : undefined,
          fotoWakil: finalFotoWakil
        };
      });
    } catch {
      return null;
    }
  }

  async simpanKandidat(kandidat: Omit<Kandidat, 'id'>): Promise<string | null> {
    try {
      const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/kandidat`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          nomor_urut: kandidat.nomorUrut !== undefined && kandidat.nomorUrut !== null ? Number(kandidat.nomorUrut) : null,
          jenis_kandidat: kandidat.jenisKandidat || 'paslon',
          nama_ketua: kandidat.jenisKandidat === 'wakil_siswi' ? null : (kandidat.namaKetua || null),
          nama_wakil: kandidat.namaWakil,
          foto_ketua: kandidat.jenisKandidat === 'wakil_siswi' ? null : (kandidat.fotoKetua || null),
          foto_wakil: kandidat.fotoWakil
        })
      });

      if (!response.ok) return null;
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return String(data[0]['id']);
      }
      return null;
    } catch {
      return null;
    }
  }

  async updateKandidat(id: string, payload: Partial<Omit<Kandidat, 'id'>>): Promise<boolean> {
    try {
      const updateData: Record<string, unknown> = {};
      if (payload.nomorUrut !== undefined) updateData['nomor_urut'] = payload.nomorUrut;
      if (payload.jenisKandidat !== undefined) updateData['jenis_kandidat'] = payload.jenisKandidat;
      if (payload.namaKetua !== undefined) updateData['nama_ketua'] = payload.namaKetua;
      if (payload.namaWakil !== undefined) updateData['nama_wakil'] = payload.namaWakil;
      if (payload.fotoKetua !== undefined) updateData['foto_ketua'] = payload.fotoKetua;
      if (payload.fotoWakil !== undefined) updateData['foto_wakil'] = payload.fotoWakil;

      const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/kandidat?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(updateData)
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  async hapusKandidat(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/kandidat?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'return=minimal'
        }
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  // ==========================================
  // TABEL SUARA_LOG
  // ==========================================
  async getSuaraLogList(): Promise<SuaraLog[] | null> {
    try {
      const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/suara_log?select=*&order=waktu_memilih.desc`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) return null;
      const data = await response.json();
      if (!Array.isArray(data)) return null;

      return data.map((item: Record<string, unknown>) => ({
        id: String(item['id']),
        siswaId: String(item['siswa_id'] || ''),
        siswaNama: String(item['siswa_nama'] || ''),
        kelas: String(item['kelas'] || ''),
        kandidatId: String(item['kandidat_id'] || ''),
        nomorUrut: Number(item['nomor_urut']) || 1,
        timestamp: String(item['waktu_memilih'] || '')
      }));
    } catch {
      return null;
    }
  }

  async simpanSuaraLog(log: Omit<SuaraLog, 'id'>): Promise<string | null> {
    try {
      const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/suara_log`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          siswa_id: log.siswaId,
          siswa_nama: log.siswaNama,
          kelas: log.kelas,
          kandidat_id: log.kandidatId,
          nomor_urut: log.nomorUrut,
          waktu_memilih: log.timestamp || new Date().toISOString()
        })
      });

      if (!response.ok) return null;
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return String(data[0]['id']);
      }
      return null;
    } catch {
      return null;
    }
  }

  async resetSemuaSuaraDiDatabase(): Promise<boolean> {
    try {
      // 1. Reset status memilih seluruh siswa di Supabase
      await fetch(`${SUPABASE_CONFIG.url}/rest/v1/siswa?sudah_memilih=eq.true`, {
        method: 'PATCH',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          sudah_memilih: false,
          waktu_memilih: null
        })
      });

      // 2. Hapus log suara di Supabase
      await fetch(`${SUPABASE_CONFIG.url}/rest/v1/suara_log?id=neq.00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'return=minimal'
        }
      });

      return true;
    } catch {
      return false;
    }
  }
}
