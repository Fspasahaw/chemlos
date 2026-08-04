import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../../../../Components/Badge';
import { Button } from '../../../../Components/Button';
import { Card } from '../../../../Components/Card';
import { Pagination } from '../../../../Components/Pagination';
import { SearchInput } from '../../../../Components/SearchInput';
import { Select } from '../../../../Components/Select';
import { Tooltip } from '../../../../Components/Tooltip';
import { formatDate } from '../../../../lib/date';
import { statusPeminjamanMap as statusMap } from '../../../../lib/status';
import { EmptyTable } from '../../../../Components/EmptyTable';



export default function Index() {
    const { items, filters } = usePage().props as any;
    const [search, setSearch] = useState(filters?.search ?? '');

    const apply = (params: Record<string, string>) => router.get('/dashboard/pimpinan/peminjaman', params, { preserveState: true, preserveScroll: true, replace: true });

    return (
        <>
            <Head title="Peminjaman" />
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Peminjaman</h1>
                <p className="text-slate-500 dark:text-slate-400">Tampilan data peminjaman (read-only).</p>
            </div>
            <Card>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                    <SearchInput
                        value={search}
                        onChange={(v) => setSearch(v)}
                        onSearch={(val) => apply({ search: val })}
                        placeholder="Cari kode"
                        className="flex-1"
                    />
                    <Select
                        options={[{ value: '', label: 'Semua Status' }, ...Object.keys(statusMap).map((s) => ({ value: s, label: statusMap[s].label }))]}
                        value={filters?.status ?? ''}
                        onChange={(e) => apply({ status: e.target.value, search })}
                        className="w-44"
                    />
                    <Button onClick={() => apply({ search })} leftIcon={<Search className="h-4 w-4" />}>Cari</Button>
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr><th className="px-4 py-3 text-left font-semibold">Kode</th><th className="px-4 py-3 text-left font-semibold">Peminjam</th><th className="px-4 py-3 text-left font-semibold">Lab</th><th className="px-4 py-3 text-left font-semibold">Periode</th><th className="px-4 py-3 text-left font-semibold">Status</th><th className="px-4 py-3 text-right font-semibold">Aksi</th></tr>
                        </thead>
                        <tbody>
                            {items.data.length === 0 ? <EmptyTable colSpan={5} message="Tidak ada data." /> : items.data.map((item: any) => {
                                const st = statusMap[item.status] ?? { label: item.status, variant: 'neutral' };
                                return (
                                    <tr key={item.id} className="border-t border-slate-200/80 dark:border-slate-800/80">
                                        <td className="px-4 py-3 font-medium">{item.kode}</td>
                                        <td className="px-4 py-3">{item.user?.nama_lengkap ?? '-'} <span className="text-xs text-slate-400">{item.user?.npm_nip}</span></td>
                                        <td className="px-4 py-3">{item.laboratorium?.nama ?? '-'}</td>
                                        <td className="px-4 py-3">{formatDate(item.tanggal_mulai)} s/d {formatDate(item.tanggal_selesai)}</td>
                                        <td className="px-4 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                                        <td className="px-4 py-3 text-right">
                                            <Tooltip content="Lihat detail">
                                                <Link href={`/dashboard/pimpinan/peminjaman/${item.id}`} className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
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
