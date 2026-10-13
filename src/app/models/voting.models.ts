export interface Siswa {
  id: string;
  namaLengkap: string;
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  kelas: string;
  unsur?: string; // 'siswa' | 'guru' | 'yayasan'
  jenisKelamin?: string; // 'Laki-laki' | 'Perempuan'
  pasFoto: string;
  sudahMemilih: boolean;
  waktuMemilih?: string;
  kandidatDipilihId?: string;
  kandidatWakilDipilihId?: string;
}

export interface Kandidat {
  id: string;
  nomorUrut?: number;
  jenisKandidat?: 'paslon' | 'wakil_siswi';
  namaKetua?: string;
  namaWakil: string;
  fotoKetua?: string;
  fotoWakil: string;
}

export interface SuaraLog {
  id: string;
  siswaId: string;
  siswaNama: string;
  kelas: string;
  kandidatId: string;
  nomorUrut?: number;
  timestamp: string;
}

export interface StatistikDashboard {
  totalSiswa: number;
  sudahMemilih: number;
  belumMemilih: number;
  persentaseSudah: number;
  persentaseBelum: number;
  totalKandidat: number;
}
