import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle, Clock, FileText, MapPin, User, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../../../Components/Badge';
import { Button } from '../../../Components/Button';
import { Card } from '../../../Components/Card';
import { ConfirmModal } from '../../../Components/ConfirmModal';
import { DocumentPreview } from '../../../Components/DocumentPreview';
import { ImageWithFallback } from '../../../Components/ImageWithFallback';
import { Stepper } from '../../../Components/Stepper';
import { Timeline } from '../../../Components/Timeline';
import { formatDate, formatDateTime, formatRupiah } from '../../../lib/date';
import { statusPeminjamanMap as statusMap, statusKerusakanMap, kondisiAlatMap as kondisiLabel } from '../../../lib/status';

interface Person {
    id: number;
    nama_lengkap: string;
    npm_nip?: string;
    email?: string;
}

interface Alat {
    id: number;
    nama: string;
    kode: string;
    stok_total: number;
}

interface Laboratorium {
    id: number;
    nama: string;
    slug: string;
    lokasi?: string;
}

interface Detail {
    id: number;
    alat: Alat;
    jumlah: number;
    kondisi_serah_terima?: string;
    kondisi_pengembalian?: string;
    denda_per_alat?: number;
    catatan_serah_terima?: string;
    catatan_pengembalian?: string;
}

interface StatusLog {
    id: number;
    status_dari: string;
    status_ke: string;
    keterangan: string;
    user: Person | null;
    created_at: string;
}

interface SerahTerima {
    waktu_serah_terima: string;
    foto_bukti?: string;
    catatan?: string;
}

interface Pengembalian {
    waktu_pengembalian: string;
    total_denda: number;
    denda_dibayar: number | null;
    keterlambatan_menit: number;
    foto_kondisi?: string;
    catatan?: string;
}

interface Kerusakan {
    id: number;
    alat_id: number;
    kondisi: string;
    jumlah: number;
    keterangan: string;
    status: string;
    foto?: string;
}

interface Peminjaman {
    id: number;
    kode: string;
    status: string;
    tujuan: string;
    tanggal_mulai: string;
    jam_mulai: string;
    tanggal_selesai: string;
    jam_selesai: string;
    file_jsa?: string;
    alasan_penolakan?: string;
    catatan?: string;
    user: Person;
    dosen_pembimbing: Person;
    laboratorium: Laboratorium;
    details: Detail[];
    status_logs: StatusLog[];
    serah_terima: SerahTerima | null;
    pengembalian: Pengembalian | null;
    kerusakan_alats: Kerusakan[];
}



const roleBasePath: Record<string, string> = {
    mahasiswa: '/dashboard/mahasiswa/peminjaman',
    dosen: '/dashboard/dosen/peminjaman',
    laboran: '/dashboard/laboran/peminjaman',
    kepala_lab: '/dashboard/kepala-lab/peminjaman',
    pimpinan: '/dashboard/pimpinan/peminjaman',
    admin: '/dashboard/admin/peminjaman',
};

export default function Show() {
    const { peminjaman, role } = usePage().props as any;
    const p: Peminjaman = peminjaman;
    const [alasan, setAlasan] = useState('');
    const [showJsa, setShowJsa] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);

    const status = statusMap[p.status] ?? { label: p.status, variant: 'neutral' };
    const [showCancel, setShowCancel] = useState(false);

    const pipelineSteps = [
        { key: 'diajukan', label: 'Diajukan' },
        { key: 'menunggu_dosen', label: 'Dosen' },
        { key: 'menunggu_laboran', label: 'Laboran' },
        { key: 'disetujui', label: 'Disetujui' },
        { key: 'berlangsung', label: 'Berlangsung' },
        { key: 'selesai', label: 'Selesai' },
    ];
    const pipelineActive = pipelineSteps.find((s) => s.key === p.status)?.key ?? '';
    const pipelineFailed = ['ditolak', 'dibatalkan'].includes(p.status)
        ? (p.status_logs[p.status_logs.length - 1]?.status_dari ?? '')
        : undefined;

    const timelineItems = p.status_logs.map((log) => ({
        id: log.id,
        icon: log.status_ke === 'selesai' ? 'check' : log.status_ke === 'ditolak' || log.status_ke === 'dibatalkan' ? 'warning' : 'activity' as any,
        title: `${statusMap[log.status_dari]?.label ?? log.status_dari ?? '-'} → ${statusMap[log.status_ke]?.label ?? log.status_ke}`,
        description: log.keterangan,
        status: log.user?.nama_lengkap ?? 'Sistem',
        date: formatDateTime(log.created_at),
    }));

    const canCancel = role === 'mahasiswa' && ['diajukan', 'menunggu_dosen', 'menunggu_laboran'].includes(p.status);
    const canApproveDosen = role === 'dosen' && p.status === 'menunggu_dosen';
    const canApproveLaboran = (role === 'laboran' || role === 'kepala_lab') && p.status === 'menunggu_laboran';
    const basePath = roleBasePath[role] ?? '/dashboard';

    const handleApprove = () => {
        setConfirmAction(null);
        router.post(`${basePath}/${p.id}/approve`, {}, { preserveScroll: true });
    };

    const handleReject = () => {
        if (!alasan) return;
        setConfirmAction(null);
        router.post(`${basePath}/${p.id}/reject`, { alasan_penolakan: alasan }, { preserveScroll: true });
    };

    const handleCancel = () => {
        setShowCancel(false);
        router.post(`/dashboard/mahasiswa/peminjaman/${p.id}/cancel`, {}, { preserveScroll: true });
    };

    const isApprove = confirmAction === 'approve';

    return (
        <>
            <Head title={`Detail ${p.kode}`} />
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Link href={roleBasePath[role] ?? '/dashboard'} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Detail Peminjaman</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{p.kode}</p>
                    </div>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
            </div>

            {pipelineActive && (
                <Card className="mb-6">
                    <Stepper
                        steps={pipelineSteps}
                        activeKey={pipelineActive}
                        failedKey={pipelineFailed}
                        showDescription={false}
                    />
                </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <Card.Header title="Informasi Peminjaman" icon={<FileText className="h-5 w-5" />} />
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Peminjam</p>
                                <p className="font-medium">{p.user.nama_lengkap}</p>
                                <p className="text-sm text-slate-500">{p.user.npm_nip} &bull; {p.user.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Dosen Pembimbing</p>
                                <p className="font-medium">{p.dosen_pembimbing.nama_lengkap}</p>
                                <p className="text-sm text-slate-500">{p.dosen_pembimbing.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Laboratorium</p>
                                <p className="font-medium">{p.laboratorium.nama}</p>
                                <p className="text-sm text-slate-500">{p.laboratorium.lokasi ?? '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Periode</p>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <span>{formatDate(p.tanggal_mulai)} {p.jam_mulai}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-slate-400" />
                                    <span>s/d {formatDate(p.tanggal_selesai)} {p.jam_selesai}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Tujuan</p>
                            <p className="whitespace-pre-line text-sm">{p.tujuan}</p>
                        </div>
                        {p.alasan_penolakan && (
                            <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
                                <span className="font-medium">Alasan Penolakan:</span> {p.alasan_penolakan}
                            </div>
                        )}
                        {p.catatan && (
                            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">
                                <span className="font-medium">Catatan:</span> {p.catatan}
                            </div>
                        )}
                        {p.file_jsa && (
                            <div className="mt-4">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">File JSA</p>
                                <button
                                    type="button"
                                    onClick={() => setShowJsa(true)}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                                >
                                    <FileText className="h-4 w-4" /> Lihat / Unduh JSA
                                </button>
                                <DocumentPreview
                                    file={p.file_jsa}
                                    title="File JSA"
                                    open={showJsa}
                                    onClose={() => setShowJsa(false)}
                                />
                            </div>
                        )}
                    </Card>

                    <Card>
                        <Card.Header title="Daftar Alat" icon={<User className="h-5 w-5" />} />
                        <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold">Alat</th>
                                        <th className="px-4 py-3 text-left font-semibold">Kode</th>
                                        <th className="px-4 py-3 text-left font-semibold">Jumlah</th>
                                        <th className="px-4 py-3 text-left font-semibold">Kondisi Serah Terima</th>
                                        <th className="px-4 py-3 text-left font-semibold">Kondisi Pengembalian</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {p.details.map((d) => (
                                        <tr key={d.id} className="border-t border-slate-200/80 dark:border-slate-800/80">
                                            <td className="px-4 py-3">{d.alat.nama}</td>
                                            <td className="px-4 py-3 text-slate-500">{d.alat.kode}</td>
                                            <td className="px-4 py-3">{d.jumlah}</td>
                                            <td className="px-4 py-3">{d.kondisi_serah_terima ? kondisiLabel[d.kondisi_serah_terima] : '-'}</td>
                                            <td className="px-4 py-3">{d.kondisi_pengembalian ? kondisiLabel[d.kondisi_pengembalian] : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {p.serah_terima && (
                        <Card>
                            <Card.Header title="Serah Terima" icon={<CheckCircle className="h-5 w-5" />} />
                            <p className="text-sm"><span className="font-medium">Waktu:</span> {formatDateTime(p.serah_terima.waktu_serah_terima)}</p>
                            <p className="text-sm"><span className="font-medium">Catatan:</span> {p.serah_terima.catatan ?? '-'}</p>
                            {p.serah_terima.foto_bukti && (
                                <a href={`/storage/${p.serah_terima.foto_bukti}`} target="_blank" rel="noreferrer" className="mt-2 inline-block rounded-xl border border-slate-200 p-1 dark:border-slate-700">
                                    <ImageWithFallback src={`/storage/${p.serah_terima.foto_bukti}`} alt="Foto serah terima" className="h-40 rounded-lg object-cover" />
                                </a>
                            )}
                        </Card>
                    )}

                    {p.pengembalian && (
                        <Card>
                            <Card.Header title="Pengembalian" icon={<Clock className="h-5 w-5" />} />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm"><span className="font-medium">Waktu:</span> {formatDateTime(p.pengembalian.waktu_pengembalian)}</p>
                                    <p className="text-sm"><span className="font-medium">Keterlambatan:</span> {p.pengembalian.keterlambatan_menit} menit</p>
                                    <p className="text-sm"><span className="font-medium">Catatan:</span> {p.pengembalian.catatan ?? '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm"><span className="font-medium">Total Denda:</span> {formatRupiah(p.pengembalian.total_denda)}</p>
                                    <p className="text-sm"><span className="font-medium">Denda Dibayar:</span> {formatRupiah(p.pengembalian.denda_dibayar)}</p>
                                    <Badge variant={Number(p.pengembalian.denda_dibayar ?? 0) >= Number(p.pengembalian.total_denda) ? 'success' : 'danger'}>
                                        {Number(p.pengembalian.denda_dibayar ?? 0) >= Number(p.pengembalian.total_denda) ? 'Lunas' : 'Belum Lunas'}
                                    </Badge>
                                </div>
                            </div>
                            {p.pengembalian.foto_kondisi && (
                                <a href={`/storage/${p.pengembalian.foto_kondisi}`} target="_blank" rel="noreferrer" className="mt-2 inline-block rounded-xl border border-slate-200 p-1 dark:border-slate-700">
                                    <ImageWithFallback src={`/storage/${p.pengembalian.foto_kondisi}`} alt="Foto pengembalian" className="h-40 rounded-lg object-cover" />
                                </a>
                            )}
                        </Card>
                    )}

                    {p.kerusakan_alats.length > 0 && (
                        <Card>
                            <Card.Header title="Kerusakan / Kehilangan" icon={<MapPin className="h-5 w-5" />} />
                            <div className="space-y-3">
                                {p.kerusakan_alats.map((k) => (
                                    <div key={k.id} className="rounded-xl border border-slate-200/80 p-3 dark:border-slate-800/80">
                                        <p className="text-sm font-medium">{kondisiLabel[k.kondisi] ?? k.kondisi} x {k.jumlah}</p>
                                        <p className="text-sm text-slate-500">{k.keterangan}</p>
                                        <Badge variant={statusKerusakanMap[k.status]?.variant === 'success' ? 'success' : 'warning'}>{statusKerusakanMap[k.status]?.label ?? k.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <Card.Header title="Aksi" />
                        {(canApproveDosen || canApproveLaboran) && (
                            <div className="flex flex-col gap-2">
                                <Button variant="primary" leftIcon={<CheckCircle className="h-4 w-4" />} onClick={() => { setAlasan(''); setConfirmAction('approve'); }}>Setuju</Button>
                                <Button variant="outline" leftIcon={<XCircle className="h-4 w-4" />} onClick={() => { setAlasan(''); setConfirmAction('reject'); }}>Tolak</Button>
                            </div>
                        )}
                        {canCancel && (
                            <Button variant="danger" leftIcon={<XCircle className="h-4 w-4" />} onClick={() => setShowCancel(true)}>Batalkan Peminjaman</Button>
                        )}
                        {!canApproveDosen && !canApproveLaboran && !canCancel && (
                            <p className="text-sm text-slate-500">Tidak ada aksi tersedia untuk status saat ini.</p>
                        )}
                    </Card>

                    <Card>
                        <Card.Header title="Lini Masa Status" icon={<Clock className="h-5 w-5" />} />
                        <Timeline items={timelineItems} size="lg" />
                    </Card>
                </div>
            </div>

            <ConfirmModal
                open={showCancel}
                onClose={() => setShowCancel(false)}
                onConfirm={handleCancel}
                title="Batalkan Peminjaman"
                description={`Yakin ingin membatalkan peminjaman ${p.kode}? Tindakan ini tidak dapat diurungkan.`}
                confirmLabel="Ya, Batalkan"
                variant="danger"
            />

            <ConfirmModal
                open={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={isApprove ? handleApprove : handleReject}
                title={isApprove ? 'Setujui Peminjaman' : 'Tolak Peminjaman'}
                description={isApprove ? `Yakin ingin menyetujui peminjaman ${p.kode}?` : `Berikan alasan penolakan untuk peminjaman ${p.kode}.`}
                confirmLabel={isApprove ? 'Setuju' : 'Tolak'}
                variant={isApprove ? 'info' : 'danger'}
                confirmDisabled={!isApprove && !alasan.trim()}
            >
                {!isApprove && (
                    <textarea
                        value={alasan}
                        onChange={(e) => setAlasan(e.target.value)}
                        placeholder="Alasan penolakan"
                        rows={3}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    />
                )}
            </ConfirmModal>
        </>
    );
}
