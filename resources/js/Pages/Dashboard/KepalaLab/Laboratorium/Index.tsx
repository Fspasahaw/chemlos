import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Eye, Search } from 'lucide-react';
import { useFilter } from '@/Hooks/useFilter';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { Card } from '@/Components/Card';
import { Pagination } from '@/Components/Pagination';
import { SearchInput } from '@/Components/SearchInput';
import { Select } from '@/Components/Select';
import { EmptyTable } from '@/Components/EmptyTable';

export default function Index() {
    const { items } = usePage().props as any;
    const { filters, apply } = useFilter('/dashboard/kepala-lab/laboratorium');

    return (
        <>
            <Head title="Laboratorium" />
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Laboratorium Saya</h1>
                <p className="text-slate-500 dark:text-slate-400">Daftar laboratorium yang Anda kelola.</p>
            </div>
            <Card>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                    <SearchInput
                        value={filters?.search ?? ''}
                        onSearch={(val) => apply({ search: val })}
                        placeholder="Cari nama/kode"
                        className="flex-1"
                    />
                    <Select
                        options={[
                            { value: '', label: 'Semua Status' },
                            { value: 'aktif', label: 'Aktif' },
                            { value: 'nonaktif', label: 'Nonaktif' },
                        ]}
                        value={filters?.status ?? ''}
                        onChange={(e) => apply({ status: e.target.value })}
                        className="w-44"
                    />
                    <Button onClick={() => apply({})} leftIcon={<Search className="h-4 w-4" />}>Cari</Button>
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr><th className="px-4 py-3 text-left font-semibold">Nama</th><th className="px-4 py-3 text-left font-semibold">Kode</th><th className="px-4 py-3 text-left font-semibold">Lokasi</th><th className="px-4 py-3 text-left font-semibold">Status</th><th className="px-4 py-3 text-left font-semibold">Aksi</th></tr>
                        </thead>
                        <tbody>
                            {items.data.length === 0 ? <EmptyTable colSpan={5} message="Tidak ada data." /> : items.data.map((item: any) => (
                                <tr key={item.id} className="border-t border-slate-200/80 dark:border-slate-800/80">
                                    <td className="px-4 py-3 font-medium">{item.nama}</td>
                                    <td className="px-4 py-3">{item.kode}</td>
                                    <td className="px-4 py-3">{item.lokasi}</td>
                                    <td className="px-4 py-3"><Badge variant={item.status === 'aktif' ? 'success' : 'neutral'}>{item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}</Badge></td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Link href={`/dashboard/kepala-lab/laboratorium/${item.id}`} title="Lihat detail" className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"><Eye className="h-4 w-4 text-slate-600" /></Link>
                                            <Link href={`/dashboard/kepala-lab/laboratorium/${item.id}/edit`} className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20"><Edit className="h-3 w-3" /> Edit</Link>
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
