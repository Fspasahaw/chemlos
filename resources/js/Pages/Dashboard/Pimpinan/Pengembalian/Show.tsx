import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '../../../../Components/Badge';
import { Button } from '../../../../Components/Button';
import { Card } from '../../../../Components/Card';
import { formatDate, formatDateTime, formatRupiah } from '../../../../lib/date';
import { statusPeminjamanMap as statusMap } from '../../../../lib/status';



export default function Show() {
    const { peminjaman } = usePage().props as any;
    const st = statusMap[peminjaman.status] ?? { label: peminjaman.status, variant: 'neutral' };
    const pengembalian = peminjaman.pengembalian;

    return (
        <>
            <Head title={`Pengembalian ${peminjaman.kode}`} />
            <div className="mb-6 flex items-center gap-3">
                <Link href="/dashboard/pimpinan/pengembalian">
                    <Button variant="ghost" size="icon" leftIcon={<ArrowLeft className="h-4 w-4" />} aria-label="Kembali" />
                </Link>
                <h1 className="text-2xl font-bold">Detail Pengembalian</h1>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">{peminjaman.kode}</h2>
                        <Badge variant={st.variant}>{st.label}</Badge>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div><p className="text-xs text-slate-500">Peminjam</p><p className="font-medium">{peminjaman.user?.nama_lengkap ?? '-'} <span className="text-slate-400">({peminjaman.user?.npm_nip})</span></p></div>
                        <div><p className="text-xs text-slate-500">Laboratorium</p><p className="font-medium">{peminjaman.laboratorium?.nama ?? '-'}</p></div>
                        <div><p className="text-xs text-slate-500">Periode</p><p className="font-medium">{formatDate(peminjaman.tanggal_mulai)} s/d {formatDate(peminjaman.tanggal_selesai)}</p></div>
                        <div><p className="text-xs text-slate-500">Waktu Pengembalian</p><p className="font-medium">{formatDateTime(pengembalian?.waktu_pengembalian)}</p></div>
                    </div>

                    <h3 className="mb-3 mt-6 font-semibold">Alat yang Dipinjam</h3>
                    <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr><th className="px-4 py-3 text-left font-semibold">Nama</th><th className="px-4 py-3 text-left font-semibold">Kode</th><th className="px-4 py-3 text-left font-semibold">Jumlah</th></tr>
                            </thead>
                            <tbody>
                                {peminjaman.details?.map((d: any) => (
                                    <tr key={d.id} className="border-t border-slate-200/80 dark:border-slate-800/80">
                                        <td className="px-4 py-3">{d.alat?.nama ?? '-'}</td>
                                        <td className="px-4 py-3">{d.alat?.kode ?? '-'}</td>
                                        <td className="px-4 py-3">{d.jumlah}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card>
                    <h3 className="mb-4 font-semibold">Ringkasan Denda</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Total Denda</span><span className="font-medium">{formatRupiah(pengembalian?.total_denda)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Dibayar</span><span className="font-medium">{formatRupiah(pengembalian?.denda_dibayar)}</span></div>
                        <div className="flex justify-between border-t border-slate-200/80 pt-3 dark:border-slate-800/80"><span className="text-slate-500">Sisa</span><span className="font-semibold text-rose-500">{formatRupiah(Math.max(0, (pengembalian?.total_denda ?? 0) - (pengembalian?.denda_dibayar ?? 0)))}</span></div>
                    </div>
                    {pengembalian?.catatan && (
                        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800">
                            <p className="text-slate-500">Catatan</p>
                            <p className="mt-1">{pengembalian.catatan}</p>
                        </div>
                    )}
                </Card>
            </div>
        </>
    );
}
