import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useFilter } from '@/Hooks/useFilter';
import { usePageLoading } from '@/Hooks/usePageLoading';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { DataTable } from '@/Components/DataTable';
import { TableActions } from '@/Components/TableActions';
import { FilterChips } from '@/Components/FilterChips';
import { Pagination } from '@/Components/Pagination';
import { SearchInput } from '@/Components/SearchInput';

interface Lab {
    id: number;
    nama: string;
    kode: string;
    lokasi: string;
    status: 'aktif' | 'nonaktif';
    alats_count: number;
    kepala_lab_count: number;
    laboran_count: number;
}

const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'aktif', label: 'Aktif' },
    { value: 'nonaktif', label: 'Nonaktif' },
];

export default function Index() {
    const { items } = usePage().props as any;
    const loading = usePageLoading();
    const base = '/dashboard/admin/laboratorium';
    const { filters, apply } = useFilter(base);

    const columns = [
        { header: 'Nama', accessor: 'nama' as keyof Lab },
        { header: 'Kode', accessor: 'kode' as keyof Lab },
        { header: 'Lokasi', accessor: 'lokasi' as keyof Lab },
        {
            header: 'Status',
            accessor: (row: Lab) => (
                <Badge variant={row.status === 'aktif' ? 'success' : 'neutral'}>{row.status === 'aktif' ? 'Aktif' : 'Nonaktif'}</Badge>
            ),
        },
        { header: 'Kepala Lab', accessor: 'kepala_lab_count' as keyof Lab, className: 'text-center' },
        { header: 'Laboran', accessor: 'laboran_count' as keyof Lab, className: 'text-center' },
        { header: 'Alat', accessor: 'alats_count' as keyof Lab, className: 'text-center' },
        {
            header: 'Aksi',
            accessor: (row: Lab) => (
                <TableActions
                    actions={[
                        { id: 'detail', label: 'Detail', icon: <Eye className="h-4 w-4" />, href: `${base}/${row.id}`, variant: 'neutral' },
                        { id: 'edit', label: 'Edit', icon: <Pencil className="h-4 w-4" />, href: `${base}/${row.id}/edit`, variant: 'primary' },
                        {
                            id: 'delete',
                            label: 'Hapus',
                            icon: <Trash2 className="h-4 w-4" />,
                            variant: 'danger',
                            confirm: {
                                title: 'Hapus Laboratorium',
                                description: `Yakin ingin menghapus laboratorium "${row.nama}"?`,
                                confirmLabel: 'Hapus',
                                variant: 'danger',
                            },
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
            <Head title="Laboratorium" />
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Laboratorium</h1>
                <Link href={`${base}/create`}>
                    <Button leftIcon={<Plus className="h-4 w-4" />}>Tambah Laboratorium</Button>
                </Link>
            </div>

            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <SearchInput
                        value={filters?.search ?? ''}
                        onSearch={(v) => apply({ search: v })}
                        placeholder="Cari laboratorium..."
                        className="max-w-sm"
                    />
                    <Button onClick={() => apply({})} size="md">Cari</Button>
                </div>
                <FilterChips options={statusOptions} value={filters?.status ?? ''} onChange={(v) => apply({ status: v as string })} />
            </div>

            <DataTable isLoading={loading} columns={columns} data={items.data as Lab[]} keyExtractor={(row) => row.id} emptyText="Tidak ada data laboratorium." />
            <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />
        </>
    );
}
