import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, FileText, Pencil, Plus, QrCode, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { useFilter } from '@/Hooks/useFilter';
import { usePageLoading } from '@/Hooks/usePageLoading';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { DataTable } from '@/Components/DataTable';
import { TableActions } from '@/Components/TableActions';
import { Pagination } from '@/Components/Pagination';
import { SearchInput } from '@/Components/SearchInput';
import { Select } from '@/Components/Select';

interface Tool {
    id: number;
    nama: string;
    kode: string;
    status: string;
    kondisi: string;
    stok_total: number;
    stok_tersedia: number;
    laboratorium: { nama: string };
    kategori_alat: { nama: string } | null;
}

const statusBadgeMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
    tersedia: 'success',
    tidak_tersedia: 'neutral',
    dipinjam: 'info',
    maintenance: 'warning',
};

const statusLabelMap: Record<string, string> = {
    tersedia: 'Tersedia',
    tidak_tersedia: 'Tidak Tersedia',
    dipinjam: 'Dipinjam',
    maintenance: 'Maintenance',
};

const kondisiBadgeMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
    baik: 'success',
    rusak_ringan: 'warning',
    rusak_berat: 'danger',
    hilang: 'neutral',
};

const kondisiLabelMap: Record<string, string> = {
    baik: 'Baik',
    rusak_ringan: 'Rusak Ringan',
    rusak_berat: 'Rusak Berat',
    hilang: 'Hilang',
};

export default function Index() {
    const { items, labs, kategoris, base = '/dashboard/admin/alat', features } = usePage().props as any;
    const isEnabled = (key: string) => !!features?.[key];
    const loading = usePageLoading();
    const { filters, apply } = useFilter(base);

    const labOptions = useMemo(() => [
        { value: '', label: 'Semua Lab' },
        ...Object.entries(labs as Record<string, string>).map(([id, nama]) => ({ value: id, label: nama })),
    ], [labs]);

    const kategoriOptions = useMemo(() => [
        { value: '', label: 'Semua Kategori' },
        ...Object.entries(kategoris as Record<string, string>).map(([id, nama]) => ({ value: id, label: nama })),
    ], [kategoris]);

    const columns = [
        { header: 'Nama', accessor: 'nama' as keyof Tool },
        { header: 'Kode', accessor: 'kode' as keyof Tool },
        { header: 'Lab', accessor: (row: Tool) => row.laboratorium?.nama ?? '-' },
        { header: 'Kategori', accessor: (row: Tool) => row.kategori_alat?.nama ?? '-' },
        {
            header: 'Status',
            accessor: (row: Tool) => (
                <Badge variant={statusBadgeMap[row.status] ?? 'neutral'}>{statusLabelMap[row.status] ?? row.status}</Badge>
            ),
        },
        {
            header: 'Kondisi',
            accessor: (row: Tool) => (
                <Badge variant={kondisiBadgeMap[row.kondisi] ?? 'neutral'}>{kondisiLabelMap[row.kondisi] ?? row.kondisi}</Badge>
            ),
        },
        { header: 'Stok', accessor: (row: Tool) => `${row.stok_tersedia}/${row.stok_total}` },
        {
            header: 'Aksi',
            accessor: (row: Tool) => (
                <TableActions
                    actions={[
                        { id: 'detail', label: 'Detail', icon: <Eye className="h-4 w-4" />, href: `${base}/${row.id}`, variant: 'neutral' },
                        ...(isEnabled('qr_code') ? [
                            { id: 'qr', label: 'Unduh QR', icon: <QrCode className="h-4 w-4" />, href: `${base}/${row.id}/qr`, external: true, variant: 'neutral' },
                            { id: 'label', label: 'Label QR', icon: <FileText className="h-4 w-4" />, href: `${base}/${row.id}/qr/label`, external: true, variant: 'neutral' },
                        ] : []),
                        { id: 'edit', label: 'Edit', icon: <Pencil className="h-4 w-4" />, href: `${base}/${row.id}/edit`, variant: 'primary' },
                        {
                            id: 'delete',
                            label: 'Hapus',
                            icon: <Trash2 className="h-4 w-4" />,
                            variant: 'danger',
                            confirm: {
                                title: 'Hapus Alat',
                                description: `Yakin ingin menghapus alat "${row.nama}"?`,
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
            <Head title="Alat" />
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Alat</h1>
                <Link href={`${base}/create`}>
                    <Button leftIcon={<Plus className="h-4 w-4" />}>Tambah Alat</Button>
                </Link>
            </div>

            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
                    <SearchInput
                        value={filters?.search ?? ''}
                        onSearch={(v) => apply({ search: v })}
                        placeholder="Cari alat..."
                        className="max-w-sm"
                    />
                    <Select options={labOptions} value={filters?.laboratorium ?? ''} onChange={(e) => apply({ laboratorium: e.target.value })} className="max-w-xs" />
                    <Select options={kategoriOptions} value={filters?.kategori ?? ''} onChange={(e) => apply({ kategori: e.target.value })} className="max-w-xs" />
                    <Button onClick={() => apply({})} size="md">Cari</Button>
                </div>
            </div>

            <DataTable isLoading={loading} columns={columns} data={items.data as Tool[]} keyExtractor={(row) => row.id} emptyText="Tidak ada data alat." />
            <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />
        </>
    );
}
