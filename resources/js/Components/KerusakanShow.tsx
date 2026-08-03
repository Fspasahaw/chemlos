import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Image as ImageIcon, Wrench } from 'lucide-react';
import { Badge } from './Badge';
import { Card } from './Card';
import { ImageWithFallback } from './ImageWithFallback';
import { formatDate } from '../lib/date';
import { kondisiAlatBadgeMap, statusKerusakanMap, statusMaintenanceMap } from '../lib/status';

export default function KerusakanShow({ base, title = 'Detail Kerusakan' }: { base: string; title?: string }) {
    const { item } = usePage().props as any;
    const k = item;
    const st = statusKerusakanMap[k.status] ?? { label: k.status, variant: 'neutral' };
    const ko = kondisiAlatBadgeMap[k.kondisi] ?? { label: k.kondisi, variant: 'neutral' };

    return (
        <>
            <Head title={title} />
            <div className="mb-6 flex items-center gap-4">
                <Link
                    href={base}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/80"
                >
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Link>
                <h1 className="text-2xl font-bold">{title}</h1>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 space-y-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={ko.variant}>{ko.label}</Badge>
                        <Badge variant={st.variant}>{st.label}</Badge>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Alat</p>
                            <p className="font-semibold">{k.alat?.nama ?? '-'} <span className="text-sm text-slate-500">({k.alat?.kode})</span></p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Laboratorium</p>
                            <p className="font-semibold">{k.alat?.laboratorium?.nama ?? '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Jumlah Rusak</p>
                            <p className="font-semibold">{k.jumlah}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Tanggal Dilaporkan</p>
                            <p className="font-semibold">{formatDate(k.tanggal_dilaporkan)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Pelapor</p>
                            <p className="font-semibold">{k.pelapor?.nama_lengkap ?? '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Peminjaman</p>
                            <p className="font-semibold">{k.peminjaman?.kode ?? '-'}</p>
                        </div>
                    </div>

                    {k.keterangan && (
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Keterangan</p>
                            <p className="mt-1 whitespace-pre-wrap text-slate-700 dark:text-slate-300">{k.keterangan}</p>
                        </div>
                    )}

                    {k.maintenance && (
                        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
                            <h3 className="mb-2 flex items-center gap-2 font-semibold text-indigo-700 dark:text-indigo-300">
                                <Wrench className="h-4 w-4" /> Maintenance Terkait
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300">Status: {statusMaintenanceMap[k.maintenance.status]?.label ?? k.maintenance.status}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">Tanggal mulai: {formatDate(k.maintenance.tanggal_mulai)}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">Tanggal selesai: {k.maintenance.tanggal_selesai ? formatDate(k.maintenance.tanggal_selesai) : '-'}</p>
                        </div>
                    )}
                </Card>

                <Card>
                    <h3 className="mb-4 font-semibold">Foto Kerusakan</h3>
                    {k.foto ? (
                        <ImageWithFallback src={`/storage/${k.foto}`} alt="Foto kerusakan" className="w-full rounded-2xl" />
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-slate-400 dark:border-slate-700 dark:bg-slate-900/50">
                            <ImageIcon className="mb-2 h-10 w-10" />
                            <p className="text-sm">Tidak ada foto</p>
                        </div>
                    )}
                </Card>
            </div>
        </>
    );
}
