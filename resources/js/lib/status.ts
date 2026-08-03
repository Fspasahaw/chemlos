export interface StatusItem {
    label: string;
    variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'orange' | 'outline';
}

export const statusPeminjamanMap: Record<string, StatusItem> = {
    diajukan: { label: 'Diajukan', variant: 'warning' },
    menunggu_dosen: { label: 'Menunggu Dosen', variant: 'warning' },
    menunggu_laboran: { label: 'Menunggu Laboran', variant: 'info' },
    disetujui: { label: 'Disetujui', variant: 'success' },
    berlangsung: { label: 'Berlangsung', variant: 'purple' },
    selesai: { label: 'Selesai', variant: 'success' },
    terlambat: { label: 'Terlambat', variant: 'orange' },
    ditolak: { label: 'Ditolak', variant: 'danger' },
    dibatalkan: { label: 'Dibatalkan', variant: 'neutral' },
};

export const statusKerusakanMap: Record<string, StatusItem> = {
    dilaporkan: { label: 'Dilaporkan', variant: 'warning' },
    dicek: { label: 'Dicek', variant: 'info' },
    maintenance: { label: 'Dalam Perbaikan', variant: 'purple' },
    diabaikan: { label: 'Diabaikan', variant: 'neutral' },
    selesai: { label: 'Selesai', variant: 'success' },
};

export const statusMaintenanceMap: Record<string, StatusItem> = {
    dijadwalkan: { label: 'Dijadwalkan', variant: 'warning' },
    berlangsung: { label: 'Berlangsung', variant: 'purple' },
    selesai: { label: 'Selesai', variant: 'success' },
    dibatalkan: { label: 'Dibatalkan', variant: 'neutral' },
};

export const statusVerifikasiMap: Record<string, StatusItem> = {
    pending_email: { label: 'Pending Email', variant: 'warning' },
    pending_approval: { label: 'Pending Persetujuan', variant: 'info' },
    approved: { label: 'Disetujui', variant: 'success' },
    rejected: { label: 'Ditolak', variant: 'danger' },
    inactive: { label: 'Tidak Aktif', variant: 'neutral' },
    suspended: { label: 'Dinonaktifkan', variant: 'neutral' },
};

export const statusUserMap: Record<string, StatusItem> = {
    active: { label: 'Aktif', variant: 'success' },
    inactive: { label: 'Tidak Aktif', variant: 'neutral' },
    pending: { label: 'Pending', variant: 'warning' },
    suspended: { label: 'Ditangguhkan', variant: 'danger' },
};

export const kondisiAlatMap: Record<string, string> = {
    baik: 'Baik',
    rusak_ringan: 'Rusak Ringan',
    rusak_berat: 'Rusak Berat',
    hilang: 'Hilang',
};

export const kondisiAlatBadgeMap: Record<string, StatusItem> = {
    baik: { label: 'Baik', variant: 'success' },
    rusak_ringan: { label: 'Rusak Ringan', variant: 'warning' },
    rusak_berat: { label: 'Rusak Berat', variant: 'danger' },
    hilang: { label: 'Hilang', variant: 'danger' },
};

export const alatStatusMap: Record<string, StatusItem> = {
    tersedia: { label: 'Tersedia', variant: 'success' },
    dipinjam: { label: 'Dipinjam', variant: 'warning' },
    maintenance: { label: 'Dalam Perbaikan', variant: 'danger' },
    tidak_tersedia: { label: 'Tidak Tersedia', variant: 'neutral' },
};

export const laboratoriumStatusMap: Record<string, StatusItem> = {
    aktif: { label: 'Aktif', variant: 'success' },
    nonaktif: { label: 'Nonaktif', variant: 'neutral' },
};

export const programStudiStatusMap: Record<string, StatusItem> = {
    aktif: { label: 'Aktif', variant: 'success' },
    nonaktif: { label: 'Nonaktif', variant: 'neutral' },
};

export const dokumenJenisMap: Record<string, string> = {
    sop: 'SOP',
    tata_tertib: 'Tata Tertib',
    lainnya: 'Lainnya',
};

export const videoJenisMap: Record<string, string> = {
    aplikasi: 'Aplikasi',
    alat: 'Alat',
};

export const pesanKontakStatusMap: Record<string, StatusItem> = {
    baru: { label: 'Baru', variant: 'warning' },
    dibaca: { label: 'Dibaca', variant: 'info' },
    dijawab: { label: 'Dijawab', variant: 'success' },
};

export const peranLabelMap: Record<string, string> = {
    kepala_lab: 'Kepala Laboratorium',
    laboran: 'Laboran',
    admin: 'Admin',
    pimpinan: 'Pimpinan',
    dosen: 'Dosen',
    mahasiswa: 'Mahasiswa',
};

export const roleLabelMap: Record<string, string> = {
    admin: 'Admin',
    pimpinan: 'Pimpinan',
    kepala_lab: 'Kepala Laboratorium',
    laboran: 'Laboran',
    dosen: 'Dosen',
    mahasiswa: 'Mahasiswa',
};

export function labelize(value: string | null | undefined, fallback = '-'): string {
    if (!value) return fallback;
    return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
