import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import { useFilter } from '@/Hooks/useFilter';
import { usePageLoading } from '@/Hooks/usePageLoading';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { Card } from '@/Components/Card';
import { Pagination } from '@/Components/Pagination';
import { SearchInput } from '@/Components/SearchInput';
import { Tooltip } from '@/Components/Tooltip';
import { Select } from '@/Components/Select';
import { EmptyTable } from '@/Components/EmptyTable';
import { formatDate, formatRupiah } from '@/lib/date';
import { statusPeminjamanMap as statusMap } from '@/lib/status';

export default function Index() {
    const { items } = usePage().props as any;
    const loading = usePageLoading();
    const { filters, apply } = useFilter('/dashboard/dosen/pengembalian');

    return (
        <>
            <Head title="Pengembalian" />
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Pengembalian Bimbingan</h1>
                <p className="text-slate-500 dark:text-slate-400">Pantau pengembalian mahasiswa bimbingan.</p>
            </div>
            <Card>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                    <SearchInput
                        value={filters?.search ?? ''}
                        onSearch={(val) => apply({ search: val })}
                        placeholder="Cari mahasiswa"
                        className="flex-1"
                    />
                    <Select
                        options={[{ value: '', label: 'Semua Status' }, { value: 'berlangsung', label: statusMap['berlangsung']?.label ?? 'Berlangsung' }, { value: 'terlambat', label: statusMap['terlambat']?.label ?? 'Terlambat' }, { value: 'selesai', label: statusMap['selesai']?.label ?? 'Selesai' }]}
                        value={filters?.status ?? ''}
                        onChange={(e) => apply({ status: e.target.value })}
                        className="w-44"
                    />
                    <Button onClick={() => apply({})} leftIcon={<Search className="h-4 w-4" />}>Cari</Button>
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr><th className="px-4 py-3 text-left font-semibold">Kode</th><th className="px-4 py-3 text-left font-semibold">Mahasiswa</th><th className="px-4 py-3 text-left font-semibold">Lab</th><th className="px-4 py-3 text-left font-semibold">Periode</th><th className="px-4 py-3 text-left font-semibold">Status</th><th className="px-4 py-3 text-left font-semibold">Denda</th><th className="px-4 py-3 text-right font-semibold">Aksi</th></tr>
                        </thead>
                        <tbody>
                            {items.data.length === 0 ? <EmptyTable colSpan={7} message="Tidak ada data." /> : items.data.map((item: any) => {
                                const st = statusMap[item.status] ?? { label: item.status, variant: 'neutral' };
                                return (
                                    <tr key={item.id} className="border-t border-slate-200/80 dark:border-slate-800/80">
                                        <td className="px-4 py-3 font-medium">{item.kode}</td>
                                        <td className="px-4 py-3">{item.user?.nama_lengkap ?? '-'}</td>
                                        <td className="px-4 py-3">{item.laboratorium?.nama ?? '-'}</td>
                                        <td className="px-4 py-3">{formatDate(item.tanggal_mulai)} s/d {formatDate(item.tanggal_selesai)}</td>
                                        <td className="px-4 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                                        <td className="px-4 py-3">{formatRupiah(item.pengembalian?.total_denda)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <Tooltip content="Lihat detail">
                                                <Link href={`/dashboard/dosen/peminjaman/${item.id}`} className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Tooltip>
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
