import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Wrench } from 'lucide-react';
import { Badge } from './Badge';
import { Card } from './Card';
import { formatDate, formatRupiah } from '../lib/date';
import { kondisiAlatMap, statusMaintenanceMap } from '../lib/status';

export default function MaintenanceShow({ base, title = 'Detail Maintenance' }: { base: string; title?: string }) {
    const { item } = usePage().props as any;
    const m = item;
    const st = statusMaintenanceMap[m.status] ?? { label: m.status, variant: 'neutral' };

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

            <Card className="space-y-6">
                <div className="flex items-center gap-2">
                    <Badge variant={st.variant}>{st.label}</Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Alat</p>
                        <p className="font-semibold">{m.alat?.nama ?? '-'} <span className="text-sm text-slate-500">({m.alat?.kode})</span></p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Laboratorium</p>
                        <p className="font-semibold">{m.laboratorium?.nama ?? '-'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Jumlah Unit</p>
                        <p className="font-semibold">{m.jumlah}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Tanggal Mulai</p>
                        <p className="font-semibold">{formatDate(m.tanggal_mulai)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Tanggal Selesai</p>
                        <p className="font-semibold">{m.tanggal_selesai ? formatDate(m.tanggal_selesai) : '-'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Teknisi</p>
                        <p className="font-semibold">{m.teknisi ?? '-'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Biaya</p>
                        <p className="font-semibold">{m.biaya ? formatRupiah(m.biaya) : '-'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Dilaporkan Oleh</p>
                        <p className="font-semibold">{m.laboran?.nama_lengkap ?? '-'}</p>
                    </div>
                    {m.kerusakan && (
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Kerusakan Terkait</p>
                            <p className="font-semibold">{kondisiAlatMap[m.kerusakan.kondisi] ?? m.kerusakan.kondisi} ({m.kerusakan.jumlah} unit)</p>
                        </div>
                    )}
                </div>

                {m.keterangan && (
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Keterangan</p>
                        <p className="mt-1 whitespace-pre-wrap text-slate-700 dark:text-slate-300">{m.keterangan}</p>
                    </div>
                )}

                {m.kerusakan && (
                    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
                        <h3 className="mb-2 flex items-center gap-2 font-semibold text-indigo-700 dark:text-indigo-300">
                            <Wrench className="h-4 w-4" /> Dari Kerusakan
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Kondisi: {kondisiAlatMap[m.kerusakan.kondisi] ?? m.kerusakan.kondisi}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Jumlah: {m.kerusakan.jumlah}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Tanggal lapor: {formatDate(m.kerusakan.tanggal_dilaporkan)}</p>
                    </div>
                )}
            </Card>
        </>
    );
}
