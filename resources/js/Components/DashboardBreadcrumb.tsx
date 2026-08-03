import { usePage } from '@inertiajs/react';
import { Breadcrumb } from './Breadcrumb';

const dashboardLabels: Record<string, string> = {
    'dashboard': 'Dashboard',
    'admin': 'Admin',
    'pimpinan': 'Pimpinan',
    'kepala-lab': 'Kepala Lab',
    'laboran': 'Laboran',
    'dosen': 'Dosen',
    'mahasiswa': 'Mahasiswa',
    'users': 'Pengguna',
    'program-studi': 'Program Studi',
    'laboratorium': 'Laboratorium',
    'alat': 'Alat',
    'kategori-alat': 'Kategori Alat',
    'peminjaman': 'Peminjaman',
    'serah-terima': 'Serah Terima',
    'pengembalian': 'Pengembalian',
    'kerusakan': 'Kerusakan',
    'maintenance': 'Maintenance',
    'laporan': 'Laporan',
    'audit-log': 'Audit Log',
    'pengaturan': 'Pengaturan',
    'backup': 'Backup',
    'notifikasi': 'Notifikasi',
    'profil': 'Profil',
    'baru': 'Baru',
    'edit': 'Edit',
    'create': 'Tambah',
};

export function DashboardBreadcrumb() {
    const { url } = usePage();
    const urlPath = url.split('?')[0];
    const segments = urlPath.replace(/^\//, '').split('/').filter(Boolean);

    if (segments.length <= 1) {
        return null;
    }

    const items = segments.slice(1).map((segment, index) => {
        const href = '/' + segments.slice(0, index + 2).join('/');
        const label = dashboardLabels[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        return index === segments.length - 2 ? { label } : { label, href };
    });

    return (
        <div className="mb-6">
            <Breadcrumb items={items} />
        </div>
    );
}
