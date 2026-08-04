import { Head, router, usePage } from '@inertiajs/react';
import { Eye, Mail, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { usePageLoading } from '../../../../Hooks/usePageLoading';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { DataTable } from '@/Components/DataTable';
import { FilterChips } from '@/Components/FilterChips';
import { Pagination } from '@/Components/Pagination';
import { SearchInput } from '@/Components/SearchInput';
import { TableActions } from '@/Components/TableActions';
import { formatDateTime } from '@/lib/date';
import { pesanKontakStatusMap } from '@/lib/status';

interface Pesan {
    id: number;
    nama: string;
    email: string;
    subjek: string;
    status: 'baru' | 'dibaca' | 'dijawab';
    created_at: string;
}

const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'baru', label: 'Baru' },
    { value: 'dibaca', label: 'Dibaca' },
    { value: 'dijawab', label: 'Dijawab' },
];

export default function Index() {
    const { items, filters } = usePage().props as any;
    const loading = usePageLoading();
    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');
    const base = '/dashboard/admin/pesan-kontak';

    const cari = (term?: string) => router.get(base, { search: term ?? search, status }, { preserveState: true, preserveScroll: true, replace: true });

    const columns = [
        { header: 'Nama', accessor: 'nama' as keyof Pesan },
        { header: 'Email', accessor: 'email' as keyof Pesan },
        { header: 'Subjek', accessor: 'subjek' as keyof Pesan },
        {
            header: 'Status',
            accessor: (row: Pesan) => {
                const s = pesanKontakStatusMap[row.status] ?? { label: row.status, variant: 'neutral' };
                return <Badge variant={s.variant}>{s.label}</Badge>;
            },
        },
        { header: 'Tanggal', accessor: (row: Pesan) => formatDateTime(row.created_at) },
        {
            header: 'Aksi',
            accessor: (row: Pesan) => (
                <TableActions
                    actions={[
                        { id: 'detail', label: 'Detail', icon: <Eye className="h-4 w-4" />, href: `${base}/${row.id}`, variant: 'neutral' },
                        {
                            id: 'delete',
                            label: 'Hapus',
                            icon: <Trash2 className="h-4 w-4" />,
                            variant: 'danger',
                            confirm: { title: 'Hapus Pesan', description: `Hapus pesan dari "${row.nama}"?`, confirmLabel: 'Hapus', variant: 'danger' },
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
            <Head title="Pesan Kontak" />
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Mail className="h-6 w-6 text-indigo-600" /> Pesan Kontak</h1>
            </div>

            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <SearchInput value={search} onSearch={cari} onChange={(v) => setSearch(v)} placeholder="Cari nama/email/subjek..." className="max-w-sm" />
                    <Button onClick={cari} size="md" leftIcon={<Search className="h-4 w-4" />}>Cari</Button>
                </div>
                <FilterChips options={statusOptions} value={status} onChange={(v) => { setStatus(v as string); router.get(base, { search, status: v }, { preserveState: true, preserveScroll: true, replace: true }); }} />
            </div>

            <DataTable isLoading={loading} columns={columns} data={items.data as Pesan[]} keyExtractor={(row) => row.id} emptyText="Tidak ada pesan kontak." />
            <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />
        </>
    );
}
