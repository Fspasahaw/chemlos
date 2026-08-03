import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Search } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../../../../Components/Badge';
import { Button } from '../../../../Components/Button';
import { Card } from '../../../../Components/Card';
import { Pagination } from '../../../../Components/Pagination';
import { SearchInput } from '../../../../Components/SearchInput';
import { Select } from '../../../../Components/Select';
import { Tooltip } from '../../../../Components/Tooltip';
import { EmptyTable } from '../../../../Components/EmptyTable';

export default function Index() {
    const { items, filters, ketua_prodi } = usePage().props as any;
    const [search, setSearch] = useState(filters?.search ?? '');
    const isKetuaProdi = ketua_prodi?.jabatan_pimpinan === 'ketua_program_studi' && ketua_prodi?.program_studi_id;

    const apply = (params: Record<string, string>) => router.get('/dashboard/pimpinan/program-studi', params, { preserveState: true, preserveScroll: true });

    return (
        <>
            <Head title="Program Studi" />
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Program Studi</h1>
                <p className="text-slate-500 dark:text-slate-400">Tampilan data program studi (read-only).</p>
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
                        options={[
                            { value: '', label: 'Semua Jenjang' },
                            { value: 'D3', label: 'D3' },
                            { value: 'S1', label: 'S1' },
                            { value: 'S2', label: 'S2' },
                            { value: 'S3', label: 'S3' },
                            { value: 'Profesi', label: 'Profesi' },
                        ]}
                        value={filters?.jenjang ?? ''}
                        onChange={(e) => apply({ jenjang: e.target.value, search })}
                        className="w-44"
                    />
                    <Select
                        options={[
                            { value: '', label: 'Semua Status' },
                            { value: 'aktif', label: 'Aktif' },
                            { value: 'nonaktif', label: 'Nonaktif' },
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
                            <tr><th className="px-4 py-3 text-left font-semibold">Nama</th><th className="px-4 py-3 text-left font-semibold">Jenjang</th><th className="px-4 py-3 text-left font-semibold">Kode</th><th className="px-4 py-3 text-left font-semibold">Status</th><th className="px-4 py-3 text-left font-semibold">Mahasiswa</th>{isKetuaProdi && <th className="px-4 py-3 text-right font-semibold">Aksi</th>}</tr>
                        </thead>
                        <tbody>
                            {items.data.length === 0 ? <EmptyTable colSpan={isKetuaProdi ? 6 : 5} message="Tidak ada data." /> : items.data.map((item: any) => (
                                <tr key={item.id} className="border-t border-slate-200/80 dark:border-slate-800/80">
                                    <td className="px-4 py-3 font-medium">{item.nama}</td>
                                    <td className="px-4 py-3">{item.jenjang}</td>
                                    <td className="px-4 py-3">{item.kode}</td>
                                    <td className="px-4 py-3"><Badge variant={item.status === 'aktif' ? 'success' : 'neutral'}>{item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}</Badge></td>
                                    <td className="px-4 py-3">{item.mahasiswa_count ?? 0}</td>
                                    {isKetuaProdi && (
                                        <td className="px-4 py-3 text-right">
                                            {ketua_prodi.program_studi_id === item.id ? (
                                                <Tooltip content="Edit program studi yang diampu">
                                                    <Link href={`/dashboard/pimpinan/program-studi/${item.id}/edit`} className="rounded-lg p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20">
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Tooltip>
                                            ) : (
                                                <span className="text-xs text-slate-400">-</span>
                                            )}
                                        </td>
                                    )}
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
