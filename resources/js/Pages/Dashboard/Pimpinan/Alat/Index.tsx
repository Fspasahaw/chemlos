import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../../Components/Button';
import { Card } from '../../../../Components/Card';
import { Pagination } from '../../../../Components/Pagination';
import { SearchInput } from '../../../../Components/SearchInput';
import { Select } from '../../../../Components/Select';
import { EmptyTable } from '../../../../Components/EmptyTable';
import { alatStatusMap } from '../../../../lib/status';

export default function Index() {
    const { items, filters, labs, kategoris } = usePage().props as any;
    const [search, setSearch] = useState(filters?.search ?? '');

    const apply = (params: Record<string, string>) => router.get('/dashboard/pimpinan/alat', params, { preserveState: true, preserveScroll: true });

    return (
        <>
            <Head title="Alat" />
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Alat</h1>
                <p className="text-slate-500 dark:text-slate-400">Tampilan data alat (read-only).</p>
            </div>
            <Card>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                    <SearchInput
                        value={search}
                        onChange={(v) => setSearch(v)}
                        onSearch={() => apply({ search })}
                        placeholder="Cari nama/kode"
                        className="flex-1"
                    />
                    <Select
                        options={[{ value: '', label: 'Semua Lab' }, ...Object.entries(labs ?? {}).map(([id, nama]) => ({ value: id, label: String(nama) }))]}
                        value={filters?.laboratorium ?? ''}
                        onChange={(e) => apply({ laboratorium: e.target.value, search })}
                        className="w-44"
                    />
                    <Select
                        options={[{ value: '', label: 'Semua Kategori' }, ...Object.entries(kategoris ?? {}).map(([id, nama]) => ({ value: id, label: String(nama) }))]}
                        value={filters?.kategori ?? ''}
                        onChange={(e) => apply({ kategori: e.target.value, search })}
                        className="w-44"
                    />
                    <Select
                        options={[
                            { value: '', label: 'Semua Status' },
                            { value: 'tersedia', label: 'Tersedia' },
                            { value: 'dipinjam', label: 'Dipinjam' },
                            { value: 'maintenance', label: 'Dalam Perbaikan' },
                            { value: 'tidak_tersedia', label: 'Tidak Tersedia' },
                        ]}
                        value={filters?.status ?? ''}
                        onChange={(e) => apply({ status: e.target.value, search })}
                        className="w-44"
                    />
                    <Button onClick={() => apply({ search })} leftIcon={<Search className="h-4 w-4" />}>Cari</Button>
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr><th className="px-4 py-3 text-left font-semibold">Nama</th><th className="px-4 py-3 text-left font-semibold">Kode</th><th className="px-4 py-3 text-left font-semibold">Lab</th><th className="px-4 py-3 text-left font-semibold">Kategori</th><th className="px-4 py-3 text-left font-semibold">Stok</th><th className="px-4 py-3 text-left font-semibold">Status</th><th className="px-4 py-3 text-left font-semibold">Aksi</th></tr>
                        </thead>
                        <tbody>
                            {items.data.length === 0 ? <EmptyTable colSpan={7} message="Tidak ada data." /> : items.data.map((item: any) => (
                                <tr key={item.id} className="border-t border-slate-200/80 dark:border-slate-800/80">
                                    <td className="px-4 py-3 font-medium">{item.nama}</td>
                                    <td className="px-4 py-3">{item.kode}</td>
                                    <td className="px-4 py-3">{item.laboratorium?.nama ?? '-'}</td>
                                    <td className="px-4 py-3">{item.kategori_alat?.nama ?? '-'}</td>
                                    <td className="px-4 py-3">{item.stok_tersedia} / {item.stok_total}</td>
                                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs ${alatStatusMap[item.status]?.variant === 'success' ? 'bg-emerald-100 text-emerald-700' : alatStatusMap[item.status]?.variant === 'danger' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>{alatStatusMap[item.status]?.label ?? item.status}</span></td>
                                    <td className="px-4 py-3"><Link href={`/dashboard/pimpinan/alat/${item.id}`} className="text-sm font-medium text-indigo-600 hover:underline"><Eye className="inline h-3 w-3" /> Detail</Link></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />
            </Card>
        </>
    );
}
