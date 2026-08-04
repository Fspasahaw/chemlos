import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useFilter } from '@/Hooks/useFilter';
import { usePageLoading } from '@/Hooks/usePageLoading';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { DataTable } from '@/Components/DataTable';
import { Pagination } from '@/Components/Pagination';
import { SearchInput } from '@/Components/SearchInput';
import { Select } from '@/Components/Select';
import { TableActions } from '@/Components/TableActions';

interface Kategori {
    id: number;
    nama: string;
    kode: string;
    status: 'aktif' | 'nonaktif';
    alats_count: number;
}

const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'aktif', label: 'Aktif' },
    { value: 'nonaktif', label: 'Nonaktif' },
];

export default function Index() {
    const { items } = usePage().props as any;
    const loading = usePageLoading();
    const base = '/dashboard/admin/kategori-alat';
    const { filters, apply } = useFilter(base);

    const columns = [
        { header: 'Nama', accessor: 'nama' as keyof Kategori },
        { header: 'Kode', accessor: 'kode' as keyof Kategori },
        {
            header: 'Status',
            accessor: (row: Kategori) => (
                <Badge variant={row.status === 'aktif' ? 'success' : 'neutral'}>{row.status === 'aktif' ? 'Aktif' : 'Nonaktif'}</Badge>
            ),
        },
        { header: 'Alat', accessor: 'alats_count' as keyof Kategori, className: 'text-center' },
        {
            header: 'Aksi',
            accessor: (row: Kategori) => (
                <TableActions
                    actions={[
                        { id: 'detail', label: 'Detail', icon: <Eye className="h-4 w-4" />, href: `${base}/${row.id}`, variant: 'neutral' },
                        { id: 'edit', label: 'Edit', icon: <Pencil className="h-4 w-4" />, href: `${base}/${row.id}/edit`, variant: 'primary' },
                        {
                            id: 'delete',
                            label: 'Hapus',
                            icon: <Trash2 className="h-4 w-4" />,
                            variant: 'danger',
                            confirm: { title: 'Hapus Kategori', description: `Yakin ingin menghapus kategori "${row.nama}"?`, confirmLabel: 'Hapus', variant: 'danger' },
                            onClick: () => router.delete(`${base}/${row.id}`),
                        },
                    ]}
                />
            ),
            className: 'text-right',
        },
    ];

    return (
        <>
            <Head title="Kategori Alat" />
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Kategori Alat</h1>
                <Link href={`${base}/create`}>
                    <Button leftIcon={<Plus className="h-4 w-4" />}>Tambah Kategori</Button>
                </Link>
            </div>

            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
                    <SearchInput
                        value={filters?.search ?? ''}
                        onSearch={(v) => apply({ search: v })}
                        placeholder="Cari kategori alat..."
                        className="max-w-sm"
                    />
                    <Select
                        options={statusOptions}
                        value={filters?.status ?? ''}
                        onChange={(e) => apply({ status: e.target.value })}
                        className="max-w-xs"
                    />
                    <Button onClick={() => apply({})} size="md" leftIcon={<Search className="h-4 w-4" />}>Cari</Button>
                </div>
            </div>

            <DataTable isLoading={loading} columns={columns} data={items.data as Kategori[]} keyExtractor={(row) => row.id} emptyText="Tidak ada data kategori alat." />
            <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />
        </>
    );
}
