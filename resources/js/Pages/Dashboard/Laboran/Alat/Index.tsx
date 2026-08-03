import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, FileText, Plus, QrCode, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../../Components/Button';
import { Card } from '../../../../Components/Card';
import { Pagination } from '../../../../Components/Pagination';
import { SearchInput } from '../../../../Components/SearchInput';
import { Select } from '../../../../Components/Select';
import { EmptyTable } from '../../../../Components/EmptyTable';
import { alatStatusMap } from '../../../../lib/status';

export default function Index() {
    const { items, filters, kategoris, base = '/dashboard/laboran/alat', features } = usePage().props as any;
    const isEnabled = (key: string) => !!features?.[key];
    const [search, setSearch] = useState(filters?.search ?? '');

    const apply = (params: Record<string, string>) => router.get(base, params, { preserveState: true, preserveScroll: true });

    return (
        <>
            <Head title="Manajemen Alat" />
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Manajemen Alat</h1>
                    <p className="text-slate-500 dark:text-slate-400">Daftar alat di laboratorium yang Anda kelola.</p>
                </div>
                <Link href={`${base}/create`} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"><Plus className="h-4 w-4" /> Tambah Alat</Link>
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
                        options={[{ value: '', label: 'Semua Kategori' }, ...Object.entries(kategoris ?? {}).map(([id, nama]) => ({ value: id, label: String(nama) }))]}
                        value={filters?.kategori ?? ''}
                        onChange={(e) => apply({ kategori: e.target.value, search })}
                        className="w-48"
                    />
                    <Button onClick={() => apply({ search })} leftIcon={<Search className="h-4 w-4" />}>Cari</Button>
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr><th className="px-4 py-3 text-left font-semibold">Nama</th><th className="px-4 py-3 text-left font-semibold">Kode</th><th className="px-4 py-3 text-left font-semibold">Kategori</th><th className="px-4 py-3 text-left font-semibold">Stok</th><th className="px-4 py-3 text-left font-semibold">Status</th><th className="px-4 py-3 text-left font-semibold">Aksi</th></tr>
                        </thead>
                        <tbody>
                            {items.data.length === 0 ? <EmptyTable colSpan={6} message="Tidak ada data." /> : items.data.map((item: any) => (
                                <tr key={item.id} className="border-t border-slate-200/80 dark:border-slate-800/80">
                                    <td className="px-4 py-3 font-medium">{item.nama}</td>
                                    <td className="px-4 py-3">{item.kode}</td>
                                    <td className="px-4 py-3">{item.kategori_alat?.nama ?? '-'}</td>
                                    <td className="px-4 py-3">{item.stok_tersedia} / {item.stok_total}</td>
                                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs ${alatStatusMap[item.status]?.variant === 'success' ? 'bg-emerald-100 text-emerald-700' : alatStatusMap[item.status]?.variant === 'danger' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>{alatStatusMap[item.status]?.label ?? item.status}</span></td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Link href={`${base}/${item.id}`} title="Lihat detail" className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"><Eye className="h-4 w-4 text-slate-600" /></Link>
                                            <Link href={`${base}/${item.id}/edit`} className="text-sm font-medium text-indigo-600 hover:underline">Edit</Link>
                                            {isEnabled('qr_code') && (
                                                <>
                                                    <a href={`${base}/${item.id}/qr`} title="Unduh QR" className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"><QrCode className="h-4 w-4 text-slate-600" /></a>
                                                    <a href={`${base}/${item.id}/qr/label`} title="Cetak Label" className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"><FileText className="h-4 w-4 text-slate-600" /></a>
                                                </>
                                            )}
                                        </div>
                                    </td>
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
