import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../../../../Components/Badge';
import { Button } from '../../../../Components/Button';
import { Card } from '../../../../Components/Card';
import { Pagination } from '../../../../Components/Pagination';
import { SearchInput } from '../../../../Components/SearchInput';
import { Select } from '../../../../Components/Select';
import { EmptyTable } from '../../../../Components/EmptyTable';
import { statusMaintenanceMap } from '../../../../lib/status';
import { formatDate } from '../../../../lib/date';

interface Lab { id: number; nama: string; }

export default function Index() {
    const { items, filters, labs } = usePage().props as any;
    const [search, setSearch] = useState(filters?.search ?? '');

    const apply = (params: Record<string, string>) => router.get('/dashboard/pimpinan/maintenance', params, { preserveState: true, preserveScroll: true });

    return (
        <>
            <Head title="Maintenance Alat" />
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Maintenance Alat</h1>
                <p className="text-slate-500 dark:text-slate-400">Tampilan data maintenance (read-only).</p>
            </div>
            <Card>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                    <SearchInput
                        value={search}
                        onChange={(v) => setSearch(v)}
                        onSearch={() => apply({ search })}
                        placeholder="Cari alat/kode"
                        className="flex-1"
                    />
                    <Select
                        options={[{ value: '', label: 'Semua Status' }, ...Object.entries(statusMaintenanceMap).map(([value, { label }]) => ({ value, label }))]}
                        value={filters?.status ?? ''}
                        onChange={(e) => apply({ status: e.target.value, search })}
                        className="w-44"
                    />
                    <Select
                        options={[{ value: '', label: 'Semua Lab' }, ...(labs ?? []).map((l: Lab) => ({ value: String(l.id), label: l.nama }))]}
                        value={filters?.laboratorium_id ?? ''}
                        onChange={(e) => apply({ laboratorium_id: e.target.value, search })}
                        className="w-44"
                    />
                    <Button onClick={() => apply({ search })} leftIcon={<Search className="h-4 w-4" />}>Cari</Button>
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr><th className="px-4 py-3 text-left font-semibold">Alat</th><th className="px-4 py-3 text-left font-semibold">Lab</th><th className="px-4 py-3 text-left font-semibold">Jumlah</th><th className="px-4 py-3 text-left font-semibold">Status</th><th className="px-4 py-3 text-left font-semibold">Mulai</th><th className="px-4 py-3 text-left font-semibold">Selesai</th><th className="px-4 py-3 text-left font-semibold">Aksi</th></tr>
                        </thead>
                        <tbody>
                            {items.data.length === 0 ? <EmptyTable colSpan={7} message="Tidak ada data." /> : items.data.map((item: any) => {
                                const st = statusMaintenanceMap[item.status] ?? { label: item.status, variant: 'neutral' };
                                return (
                                    <tr key={item.id} className="border-t border-slate-200/80 dark:border-slate-800/80">
                                        <td className="px-4 py-3 font-medium">{item.alat?.nama ?? '-'} <span className="text-xs text-slate-400">{item.alat?.kode}</span></td>
                                        <td className="px-4 py-3">{item.laboratorium?.nama ?? '-'}</td>
                                        <td className="px-4 py-3">{item.jumlah}</td>
                                        <td className="px-4 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                                        <td className="px-4 py-3">{formatDate(item.tanggal_mulai)}</td>
                                        <td className="px-4 py-3">{formatDate(item.tanggal_selesai)}</td>
                                        <td className="px-4 py-3"><Link href={`/dashboard/pimpinan/maintenance/${item.id}`} title="Lihat detail" className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"><Eye className="h-4 w-4 text-slate-600" /></Link></td>
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
