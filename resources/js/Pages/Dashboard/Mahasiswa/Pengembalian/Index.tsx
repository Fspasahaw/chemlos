import { Head, Link, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '../../../../Components/Badge';
import { Card } from '../../../../Components/Card';
import { FilterChips } from '../../../../Components/FilterChips';
import { Input } from '../../../../Components/Input';
import { Pagination } from '../../../../Components/Pagination';
import { EmptyTable } from '../../../../Components/EmptyTable';
import { router } from '@inertiajs/react';
import { formatDate, formatRupiah } from '../../../../lib/date';
import { statusPeminjamanMap as statusMap } from '../../../../lib/status';

const statusOptions = [
    { value: '', label: 'Semua' },
    { value: 'berlangsung', label: statusMap['berlangsung']?.label ?? 'Berlangsung' },
    { value: 'terlambat', label: statusMap['terlambat']?.label ?? 'Terlambat' },
    { value: 'selesai', label: statusMap['selesai']?.label ?? 'Selesai' },
];

export default function Index() {
    const { items, filters } = usePage().props as any;
    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');

    useEffect(() => {
        const t = setTimeout(() => {
            router.get('/dashboard/mahasiswa/pengembalian', { search, status }, { preserveState: true, preserveScroll: true, replace: true });
        }, 400);
        return () => clearTimeout(t);
    }, [search, status]);

    return (
        <>
            <Head title="Pengembalian" />
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Pengembalian Saya</h1>
                <p className="text-slate-500 dark:text-slate-400">Pantau status pengembalian dan denda.</p>
            </div>
            <Card>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari kode peminjaman..."
                            leftIcon={<Search className="h-4 w-4" />}
                        />
                    </div>
                    <FilterChips options={statusOptions} value={status} onChange={setStatus} />
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr><th className="px-4 py-3 text-left font-semibold">Kode</th><th className="px-4 py-3 text-left font-semibold">Lab</th><th className="px-4 py-3 text-left font-semibold">Periode</th><th className="px-4 py-3 text-left font-semibold">Status</th><th className="px-4 py-3 text-left font-semibold">Denda</th><th className="px-4 py-3 text-left font-semibold">Aksi</th></tr>
                        </thead>
                        <tbody>
                            {items.data.length === 0 ? <EmptyTable colSpan={6} message="Tidak ada data." /> : items.data.map((item: any) => {
                                const st = statusMap[item.status] ?? { label: item.status, variant: 'neutral' };
                                const denda = item.pengembalian?.total_denda ? Number(item.pengembalian.total_denda) : 0;
                                const dibayar = Number(item.pengembalian?.denda_dibayar ?? 0);
                                const lunas = denda > 0 && dibayar >= denda;
                                return (
                                    <tr key={item.id} className="border-t border-slate-200/80 dark:border-slate-800/80">
                                        <td className="px-4 py-3 font-medium">{item.kode}</td>
                                        <td className="px-4 py-3">{item.laboratorium?.nama ?? '-'}</td>
                                        <td className="px-4 py-3">{formatDate(item.tanggal_mulai)} s/d {formatDate(item.tanggal_selesai)}</td>
                                        <td className="px-4 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                                        <td className="px-4 py-3">
                                            {denda > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    <span>{formatRupiah(denda)}</span>
                                                    <Badge variant={lunas ? 'success' : 'danger'}>{lunas ? 'Lunas' : 'Belum Lunas'}</Badge>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link href={`/dashboard/mahasiswa/peminjaman/${item.id}`} className="text-sm font-medium text-indigo-600 hover:underline">Detail</Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />
            </Card>
        </>
    );
}
