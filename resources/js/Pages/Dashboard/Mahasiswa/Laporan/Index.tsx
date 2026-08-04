import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import { useFilter } from '@/Hooks/useFilter';
import { usePageLoading } from '@/Hooks/usePageLoading';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { Card } from '@/Components/Card';
import { DataTable } from '@/Components/DataTable';
import { Pagination } from '@/Components/Pagination';
import { SearchInput } from '@/Components/SearchInput';
import { Select } from '@/Components/Select';
import { formatDate, formatRupiah } from '@/lib/date';
import { statusPeminjamanMap as statusMap } from '@/lib/status';

interface Peminjaman {
    id: number;
    kode: string;
    status: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    laboratorium: { nama: string };
    details: { alat: { nama: string }; jumlah: number }[];
    pengembalian: { waktu_pengembalian: string; total_denda: number; denda_dibayar: number } | null;
}

const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'terlambat', label: 'Terlambat' },
    { value: 'ditolak', label: 'Ditolak' },
    { value: 'dibatalkan', label: 'Dibatalkan' },
];

export default function Index() {
    const { items, summary } = usePage().props as any;
    const loading = usePageLoading();
    const { filters, apply } = useFilter('/dashboard/mahasiswa/laporan');

    const columns = [
        { header: 'Kode', accessor: 'kode' as keyof Peminjaman },
        { header: 'Lab', accessor: (row: Peminjaman) => row.laboratorium?.nama ?? '-' },
        { header: 'Periode', accessor: (row: Peminjaman) => `${formatDate(row.tanggal_mulai)} s/d ${formatDate(row.tanggal_selesai)}` },
        {
            header: 'Status',
            accessor: (row: Peminjaman) => {
                const s = statusMap[row.status] ?? { label: row.status, variant: 'neutral' };
                return <Badge variant={s.variant}>{s.label}</Badge>;
            },
        },
        {
            header: 'Denda',
            accessor: (row: Peminjaman) => {
                const denda = row.pengembalian?.total_denda ?? 0;
                return <span>{formatRupiah(denda)}</span>;
            },
            className: 'text-right',
        },
        {
            header: 'Aksi',
            accessor: (row: Peminjaman) => (
                <Link href={`/dashboard/mahasiswa/peminjaman/${row.id}`}>
                    <Button size="icon" variant="ghost" leftIcon={<Eye className="h-4 w-4" />} aria-label="Detail" />
                </Link>
            ),
            className: 'text-right',
        },
    ];

    return (
        <>
            <Head title="Laporan Peminjaman" />
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Laporan Peminjaman</h1>
                <p className="text-slate-500 dark:text-slate-400">Ringkasan riwayat peminjaman dan denda Anda.</p>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <Card className="bg-linear-to-br from-indigo-600 to-violet-600 text-white">
                    <p className="text-sm text-white/80">Total Denda</p>
                    <p className="mt-1 text-2xl font-bold">{formatRupiah(summary?.total)}</p>
                </Card>
                <Card>
                    <p className="text-sm text-slate-500">Dibayar</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-600">{formatRupiah(summary?.dibayar)}</p>
                </Card>
                <Card>
                    <p className="text-sm text-slate-500">Sisa Denda</p>
                    <p className="mt-1 text-2xl font-bold text-rose-600">{formatRupiah(summary?.sisa)}</p>
                </Card>
            </div>

            <Card>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                    <SearchInput
                        value={filters?.search ?? ''}
                        onSearch={(val) => apply({ search: val })}
                        placeholder="Cari kode atau nama alat..."
                        className="flex-1"
                    />
                    <Select
                        options={statusOptions}
                        value={filters?.status ?? ''}
                        onChange={(e) => apply({ status: e.target.value })}
                        className="w-44"
                    />
                    <Button onClick={() => apply({})} leftIcon={<Search className="h-4 w-4" />}>Cari</Button>
                </div>
                <DataTable<Peminjaman>
                    isLoading={loading}
                    columns={columns}
                    data={items.data}
                    keyExtractor={(row) => row.id}
                    emptyText="Belum ada riwayat peminjaman."
                />
                <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />
            </Card>
        </>
    );
}
