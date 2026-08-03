import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Beaker, Package } from 'lucide-react';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { EmptyState } from '@/Components/EmptyState';

export default function Show() {
    const { item } = usePage().props as any;
    const base = '/dashboard/admin/kategori-alat';

    return (
        <>
            <Head title={`Kategori: ${item.nama}`} />
            <div className="mb-6">
                <Link href={base} className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400">
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Link>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Beaker className="h-7 w-7 text-indigo-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{item.nama}</h1>
                            <p className="text-sm text-slate-500">{item.kode}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant={item.status === 'aktif' ? 'success' : 'neutral'}>{item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}</Badge>
                        <Link href={`${base}/${item.id}/edit`}><Button size="sm">Edit</Button></Link>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                {item.deskripsi && (
                    <div className="mb-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Deskripsi</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-900 dark:text-slate-100">{item.deskripsi}</p>
                    </div>
                )}

                <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Daftar Alat ({item.alats?.length ?? 0})</h2>
                {item.alats?.length ? (
                    <ul className="space-y-2">
                        {item.alats.map((a: any) => (
                            <li key={a.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                                <div className="flex items-center gap-3">
                                    <Package className="h-5 w-5 text-indigo-600" />
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-slate-100">{a.nama}</p>
                                        <p className="text-xs text-slate-500">{a.kode} • {a.laboratorium?.nama ?? '-'}</p>
                                    </div>
                                </div>
                                <Link href={`/dashboard/admin/alat/${a.id}`}><Button size="sm" variant="neutral">Detail</Button></Link>
                            </li>
                        ))}
                    </ul>
                ) : <EmptyState title="Belum ada alat" description="Kategori ini belum memiliki alat." />}
            </div>
        </>
    );
}
