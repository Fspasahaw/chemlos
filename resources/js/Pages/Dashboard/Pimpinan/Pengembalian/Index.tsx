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
    user: { nama_lengkap: string; npm_nip: string } | null;
    laboratorium: { nama: string } | null;
    tanggal_mulai: string;
    tanggal_selesai: string;
    status: string;
    pengembalian: { waktu_pengembalian: string; total_denda: number; denda_dibayar: number } | null;
}

export default function Index() {
    const { items } = usePage().props as any;
    const loading = usePageLoading();
    const base = '/dashboard/pimpinan/pengembalian';
    const { filters, apply } = useFilter(base);

    const columns = [
        { header: 'Kode', accessor: 'kode' as keyof Peminjaman },
        { header: 'Peminjam', accessor: (row: Peminjaman) => <>{row.user?.nama_lengkap ?? '-'} <span className="text-xs text-slate-400">{row.user?.npm_nip}</span></> },
        { header: 'Lab', accessor: (row: Peminjaman) => row.laboratorium?.nama ?? '-' },
        { header: 'Periode', accessor: (row: Peminjaman) => `${formatDate(row.tanggal_mulai)} s/d ${formatDate(row.tanggal_selesai)}` },
        {
            header: 'Status',
            accessor: (row: Peminjaman) => {
                const st = statusMap[row.status] ?? { label: row.status, variant: 'neutral' };
                return <Badge variant={st.variant}>{st.label}</Badge>;
            },
        },
        {
            header: 'Denda',
            accessor: (row: Peminjaman) => {
                const denda = row.pengembalian?.total_denda ?? 0;
                const dibayar = row.pengembalian?.denda_dibayar ?? 0;
                const sisa = denda - dibayar;
                return (
                    <div className="text-right">
                        <div className="font-medium">{formatRupiah(denda)}</div>
                        {sisa > 0 && <div className="text-xs text-rose-500">Sisa {formatRupiah(sisa)}</div>}
                    </div>
                );
            },
            className: 'text-right',
        },
        {
            header: 'Aksi',
            accessor: (row: Peminjaman) => (
                <Link href={`${base}/${row.id}`}>
                    <Button size="icon" variant="ghost" leftIcon={<Eye className="h-4 w-4" />} aria-label="Detail" />
                </Link>
            ),
            className: 'text-right',
        },
    ];

    return (
        <>
            <Head title="Pengembalian" />
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Pengembalian</h1>
                <p className="text-slate-500 dark:text-slate-400">Tampilan data pengembalian (read-only).</p>
            </div>
            <Card>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                    <SearchInput
                        value={filters?.search ?? ''}
                        onSearch={(val) => apply({ search: val })}
                        placeholder="Cari kode"
                        className="flex-1"
                    />
                    <Select
                        options={[
                            { value: '', label: 'Semua Status' },
                            { value: 'selesai', label: 'Selesai' },
                            { value: 'terlambat', label: 'Terlambat' },
                        ]}
                        value={filters?.status ?? ''}
                        onChange={(e) => apply({ status: e.target.value })}
                        className="w-44"
                    />
                    <Button onClick={() => apply({})} leftIcon={<Search className="h-4 w-4" />}>Cari</Button>
                </div>
                <DataTable
                    isLoading={loading}
                    columns={columns}
                    data={items.data as Peminjaman[]}
                    keyExtractor={(row) => row.id}
                    emptyText="Tidak ada data pengembalian."
                />
                <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />
            </Card>
        </>
    );
}
