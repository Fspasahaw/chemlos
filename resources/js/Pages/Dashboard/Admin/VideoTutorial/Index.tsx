import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Pencil, Play, Plus, Trash2, Video } from 'lucide-react';
import { useFilter } from '@/Hooks/useFilter';
import { usePageLoading } from '@/Hooks/usePageLoading';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { DataTable } from '@/Components/DataTable';
import { FilterChips } from '@/Components/FilterChips';
import { Pagination } from '@/Components/Pagination';
import { SearchInput } from '@/Components/SearchInput';

import { formatDuration } from '@/lib/date';
import { videoJenisMap } from '@/lib/status';
import { SelectSearch } from '@/Components/SelectSearch';
import { TableActions } from '@/Components/TableActions';

interface VideoItem {
    id: number;
    judul: string;
    jenis: 'aplikasi' | 'alat';
    alat?: { id: number; nama: string } | null;
    sumber: string;
    url: string;
    file?: string;
    durasi?: string;
    status: 'aktif' | 'nonaktif';
    created_at: string;
}

const jenisOptions = [
    { value: '', label: 'Semua Jenis' },
    { value: 'aplikasi', label: 'Aplikasi' },
    { value: 'alat', label: 'Alat' },
];

const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'aktif', label: 'Aktif' },
    { value: 'nonaktif', label: 'Nonaktif' },
];

const sumberOptions = [
    { value: '', label: 'Semua Sumber' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'url_eksternal', label: 'URL' },
    { value: 'upload', label: 'Upload' },
];

export default function Index() {
    const { items, alatOptions } = usePage().props as any;
    const loading = usePageLoading();
    const base = '/dashboard/admin/video-tutorial';
    const { filters, apply } = useFilter(base);

    const alatFilterOptions = [{ value: '', label: 'Semua Alat' }, ...alatOptions.map((a: any) => ({ value: String(a.id), label: a.nama }))];

    const columns = [
        { header: 'Judul', accessor: 'judul' as keyof VideoItem },
        {
            header: 'Jenis',
            accessor: (row: VideoItem) => <Badge variant="outline" className="capitalize">{videoJenisMap[row.jenis] ?? row.jenis}</Badge>,
        },
        {
            header: 'Alat',
            accessor: (row: VideoItem) => row.jenis === 'alat' ? (row.alat?.nama ?? '-') : '-',
        },
        {
            header: 'Sumber',
            accessor: (row: VideoItem) => (
                <span className="inline-flex items-center gap-1 text-xs capitalize text-slate-500">
                    <Video className="h-3.5 w-3.5" /> {row.sumber}
                </span>
            ),
        },
        {
            header: 'Durasi',
            accessor: (row: VideoItem) => row.durasi ? formatDuration(row.durasi) : '-',
        },
        {
            header: 'Status',
            accessor: (row: VideoItem) => <Badge variant={row.status === 'aktif' ? 'success' : 'neutral'} className="capitalize">{row.status}</Badge>,
        },
        {
            header: 'Aksi',
            accessor: (row: VideoItem) => (
                <TableActions
                    actions={[
                        { id: 'detail', label: 'Detail', icon: <Eye className="h-4 w-4" />, href: `${base}/${row.id}`, variant: 'neutral' },
                        { id: 'view', label: 'Lihat', icon: <Play className="h-4 w-4" />, href: row.url || `/storage/${row.file}`, external: true, variant: 'neutral' },
                        { id: 'edit', label: 'Edit', icon: <Pencil className="h-4 w-4" />, href: `${base}/${row.id}/edit`, variant: 'primary' },
                        {
                            id: 'delete',
                            label: 'Hapus',
                            icon: <Trash2 className="h-4 w-4" />,
                            variant: 'danger',
                            confirm: { title: 'Hapus Video', description: `Yakin ingin menghapus video "${row.judul}"?`, confirmLabel: 'Hapus', variant: 'danger' },
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
            <Head title="Video Tutorial" />
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Video Tutorial</h1>
                <Link href={`${base}/create`}>
                    <Button leftIcon={<Plus className="h-4 w-4" />}>Tambah Video</Button>
                </Link>
            </div>

            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <SearchInput value={filters?.search ?? ''} onSearch={(v) => apply({ search: v })} placeholder="Cari judul..." className="max-w-sm" />
                    <Button onClick={() => apply({})} size="md">Cari</Button>
                </div>
                <div className="flex flex-wrap gap-3">
                    <FilterChips options={jenisOptions} value={filters?.jenis ?? ''} onChange={(v) => apply({ jenis: v as string })} />
                    <SelectSearch options={alatFilterOptions} value={filters?.alat ?? ''} onChange={(v) => apply({ alat: v })} placeholder="Filter alat" className="w-48" />
                    <FilterChips options={statusOptions} value={filters?.status ?? ''} onChange={(v) => apply({ status: v as string })} />
                    <FilterChips options={sumberOptions} value={filters?.sumber ?? ''} onChange={(v) => apply({ sumber: v as string })} />
                </div>
            </div>

            <DataTable isLoading={loading} columns={columns} data={items.data as VideoItem[]} keyExtractor={(row) => row.id} emptyText="Tidak ada video tutorial." />
            <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />
        </>
    );
}
