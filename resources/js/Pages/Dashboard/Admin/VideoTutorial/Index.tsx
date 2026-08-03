import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Pencil, Play, Plus, Search, Trash2, Video } from 'lucide-react';
import { useState } from 'react';
import { usePageLoading } from '../../../../Hooks/usePageLoading';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { DataTable } from '@/Components/DataTable';
import { FilterChips } from '@/Components/FilterChips';
import { Input } from '@/Components/Input';
import { Pagination } from '@/Components/Pagination';

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
    const { items, filters, alatOptions } = usePage().props as any;
    const loading = usePageLoading();
    const [search, setSearch] = useState(filters?.search ?? '');
    const [jenis, setJenis] = useState(filters?.jenis ?? '');
    const [alat, setAlat] = useState(filters?.alat ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');
    const [sumber, setSumber] = useState(filters?.sumber ?? '');
    const base = '/dashboard/admin/video-tutorial';

    const cari = () => router.get(base, { search, jenis, alat, status, sumber }, { preserveState: true });

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
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && cari()} placeholder="Cari judul..." leftIcon={<Search className="h-4 w-4" />} className="max-w-sm" />
                    <Button onClick={cari} size="md">Cari</Button>
                </div>
                <div className="flex flex-wrap gap-3">
                    <FilterChips options={jenisOptions} value={jenis} onChange={(v) => { setJenis(v as string); router.get(base, { search, jenis: v, alat, status, sumber }, { preserveState: true }); }} />
                    <SelectSearch options={alatFilterOptions} value={alat} onChange={(v) => { setAlat(v); router.get(base, { search, jenis, alat: v, status, sumber }, { preserveState: true }); }} placeholder="Filter alat" className="w-48" />
                    <FilterChips options={statusOptions} value={status} onChange={(v) => { setStatus(v as string); router.get(base, { search, jenis, alat, status: v, sumber }, { preserveState: true }); }} />
                    <FilterChips options={sumberOptions} value={sumber} onChange={(v) => { setSumber(v as string); router.get(base, { search, jenis, alat, status, sumber: v }, { preserveState: true }); }} />
                </div>
            </div>

            <DataTable isLoading={loading} columns={columns} data={items.data as VideoItem[]} keyExtractor={(row) => row.id} emptyText="Tidak ada video tutorial." />
            <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />
        </>
    );
}
