import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { useFilter } from '@/Hooks/useFilter';
import { usePageLoading } from '../../../../Hooks/usePageLoading';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { DataTable } from '@/Components/DataTable';
import { Pagination } from '@/Components/Pagination';
import { SearchInput } from '@/Components/SearchInput';
import { Select } from '@/Components/Select';
import { formatDate } from '@/lib/date';

interface UserItem {
    id: number;
    nama_lengkap: string;
    email: string;
    npm_nip: string;
    status: string;
    roles: { name: string }[];
    created_at: string;
}

const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'pending_email', label: 'Belum Verifikasi Email' },
    { value: 'pending_approval', label: 'Menunggu Persetujuan' },
    { value: 'approved', label: 'Aktif' },
    { value: 'rejected', label: 'Ditolak' },
    { value: 'suspended', label: 'Dinonaktifkan' },
];

const statusBadgeMap: Record<string, 'info' | 'warning' | 'success' | 'danger' | 'neutral'> = {
    pending_email: 'info',
    pending_approval: 'warning',
    approved: 'success',
    rejected: 'danger',
    suspended: 'neutral',
};

const statusLabelMap: Record<string, string> = {
    pending_email: 'Belum Verifikasi Email',
    pending_approval: 'Menunggu Persetujuan',
    approved: 'Aktif',
    rejected: 'Ditolak',
    suspended: 'Dinonaktifkan',
};

export default function Index() {
    const { items, roles } = usePage().props as any;
    const loading = usePageLoading();
    const base = '/dashboard/pimpinan/pengguna';
    const { filters, apply } = useFilter(base);

    const roleOptions = [{ value: '', label: 'Semua Peran' }, ...roles.map((r: string) => ({ value: r, label: r }))];

    const columns = [
        { header: 'Nama', accessor: 'nama_lengkap' as keyof UserItem },
        { header: 'Email', accessor: 'email' as keyof UserItem },
        { header: 'NPM/NIP', accessor: 'npm_nip' as keyof UserItem },
        {
            header: 'Status',
            accessor: (row: UserItem) => <Badge variant={statusBadgeMap[row.status] ?? 'neutral'}>{statusLabelMap[row.status] ?? row.status}</Badge>,
        },
        { header: 'Peran', accessor: (row: UserItem) => row.roles.map((r) => r.name).join(', ') || '-' },
        { header: 'Terdaftar', accessor: (row: UserItem) => formatDate(row.created_at) },
        {
            header: 'Aksi',
            accessor: (row: UserItem) => (
                <Link href={`${base}/${row.id}`} title="Lihat detail" className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Eye className="h-4 w-4 text-slate-600" />
                </Link>
            ),
            className: 'text-right',
        },
    ];

    return (
        <>
            <Head title="Pengguna" />
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pengguna</h1>
            </div>

            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
                    <SearchInput
                        placeholder="Cari nama, email, NPM/NIP..."
                        value={filters?.search ?? ''}
                        onSearch={(v) => apply({ search: v })}
                        className="max-w-sm"
                    />
                    <Select options={statusOptions} value={filters?.status ?? ''} onChange={(e) => apply({ status: e.target.value })} className="max-w-xs" />
                    <Select options={roleOptions} value={filters?.role ?? ''} onChange={(e) => apply({ role: e.target.value })} className="max-w-xs" />
                    <Button onClick={() => apply({})}>Cari</Button>
                </div>
            </div>

            <DataTable isLoading={loading} columns={columns} data={items.data as UserItem[]} keyExtractor={(row) => row.id} emptyText="Tidak ada data pengguna." />
            <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />
        </>
    );
}
