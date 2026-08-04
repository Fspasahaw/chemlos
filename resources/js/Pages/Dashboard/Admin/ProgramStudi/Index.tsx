import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useFilter } from '@/Hooks/useFilter';
import { usePageLoading } from '@/Hooks/usePageLoading';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { DataTable } from '@/Components/DataTable';
import { FilterChips } from '@/Components/FilterChips';
import { Pagination } from '@/Components/Pagination';
import { SearchInput } from '@/Components/SearchInput';
import { TableActions } from '@/Components/TableActions';

interface ProgramStudi {
    id: number;
    nama: string;
    jenjang: string;
    kode: string;
    status: 'aktif' | 'nonaktif';
    mahasiswa_count: number;
}

const jenjangOptions = [
    { value: '', label: 'Semua Jenjang' },
    { value: 'D3', label: 'D3' },
    { value: 'S1', label: 'S1' },
    { value: 'S2', label: 'S2' },
    { value: 'S3', label: 'S3' },
    { value: 'Profesi', label: 'Profesi' },
];

const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'aktif', label: 'Aktif' },
    { value: 'nonaktif', label: 'Nonaktif' },
];

export default function Index() {
    const { items } = usePage().props as any;
    const loading = usePageLoading();
    const base = '/dashboard/admin/program-studi';
    const { filters, apply } = useFilter(base);

    const columns = [
        { header: 'Nama', accessor: 'nama' as keyof ProgramStudi },
        { header: 'Jenjang', accessor: 'jenjang' as keyof ProgramStudi },
        { header: 'Kode', accessor: 'kode' as keyof ProgramStudi },
        { header: 'Mahasiswa', accessor: 'mahasiswa_count' as keyof ProgramStudi, className: 'text-center' },
        {
            header: 'Status',
            accessor: (row: ProgramStudi) => (
                <Badge variant={row.status === 'aktif' ? 'success' : 'neutral'}>{row.status === 'aktif' ? 'Aktif' : 'Nonaktif'}</Badge>
            ),
        },
        {
            header: 'Aksi',
            accessor: (row: ProgramStudi) => (
                <TableActions
                    actions={[
                        { id: 'detail', label: 'Detail', icon: <Eye className="h-4 w-4" />, href: `${base}/${row.id}`, variant: 'neutral' },
                        { id: 'edit', label: 'Edit', icon: <Pencil className="h-4 w-4" />, href: `${base}/${row.id}/edit`, variant: 'primary' },
                        {
                            id: 'delete',
                            label: 'Hapus',
                            icon: <Trash2 className="h-4 w-4" />,
                            variant: 'danger',
                            confirm: { title: 'Hapus Program Studi', description: `Yakin ingin menghapus program studi "${row.nama}"?`, confirmLabel: 'Hapus', variant: 'danger' },
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
            <Head title="Program Studi" />
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Program Studi</h1>
                <Link href={`${base}/create`}>
                    <Button leftIcon={<Plus className="h-4 w-4" />}>Tambah Program Studi</Button>
                </Link>
            </div>

            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <SearchInput
                        value={filters?.search ?? ''}
                        onSearch={(v) => apply({ search: v })}
                        placeholder="Cari program studi..."
                        className="max-w-sm"
                    />
                    <Button onClick={() => apply({})} size="md" leftIcon={<Search className="h-4 w-4" />}>Cari</Button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <FilterChips options={jenjangOptions} value={filters?.jenjang ?? ''} onChange={(v) => apply({ jenjang: v as string })} />
                    <FilterChips options={statusOptions} value={filters?.status ?? ''} onChange={(v) => apply({ status: v as string })} />
                </div>
            </div>

            <DataTable
                isLoading={loading}
                columns={columns}
                data={items.data as ProgramStudi[]}
                keyExtractor={(row) => row.id}
                emptyText="Tidak ada data program studi."
            />

            <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />
        </>
    );
}
