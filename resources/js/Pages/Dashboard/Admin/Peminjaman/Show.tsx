import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, ClipboardList, Download, FileText, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { ConfirmModal } from '@/Components/ConfirmModal';
import { DocumentPreview } from '@/Components/DocumentPreview';
import { EmptyState } from '@/Components/EmptyState';
import { Tabs } from '@/Components/Tabs';
import { Timeline } from '@/Components/Timeline';
import { formatDate, formatDateTime, formatRupiah } from '@/lib/date';
import { statusPeminjamanMap as statusMap } from '@/lib/status';



export default function Show() {
    const { item } = usePage().props as any;
    const [tab, setTab] = useState('detail');
    const base = '/dashboard/admin/peminjaman';

    const status = statusMap[item.status] ?? { label: item.status, variant: 'neutral' };

    const canApprove = ['diajukan', 'menunggu_dosen', 'menunggu_laboran'].includes(item.status);
    const canReject = ['diajukan', 'menunggu_dosen', 'menunggu_laboran'].includes(item.status);

    const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);
    const [alasan, setAlasan] = useState('');
    const [showJsa, setShowJsa] = useState(false);

    const timelineItems = useMemo(() => (item.status_logs ?? []).map((s: any) => ({
        id: s.id,
        icon: s.status_ke === 'ditolak' || s.status_ke === 'dibatalkan' ? 'warning' : 'check',
        title: `${statusMap[s.status_dari]?.label ?? s.status_dari ?? '-'} → ${statusMap[s.status_ke]?.label ?? s.status_ke}`,
        description: s.keterangan || '-',
        date: `${s.user?.nama_lengkap ?? 'Sistem'} • ${formatDateTime(s.created_at)}`,
    })), [item.status_logs]);

    const handleApprove = () => {
        setConfirmAction(null);
        router.post(`${base}/${item.id}/approve`, {}, { preserveScroll: true });
    };

    const handleReject = () => {
        if (!alasan) return;
        setConfirmAction(null);
        router.post(`${base}/${item.id}/reject`, { alasan_penolakan: alasan }, { preserveScroll: true });
    };

    const dendaInfo = item.total_denda > 0 && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/30 dark:bg-rose-900/20">
            <h3 className="font-semibold text-rose-700 dark:text-rose-300">Rincian Denda</h3>
            <p className="text-sm text-rose-600 dark:text-rose-300">Total denda: {formatRupiah(item.total_denda)}</p>
            <p className="text-sm text-rose-600 dark:text-rose-300">Dibayar: {formatRupiah(item.denda_dibayar)}</p>
        </div>
    );

    const isApprove = confirmAction === 'approve';

    return (
        <>
            <Head title={`Peminjaman ${item.kode}`} />
            <div className="mb-6">
                <Link href={base} className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400">
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Link>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                        <ClipboardList className="h-7 w-7 text-indigo-600" /> Peminjaman {item.kode}
                    </h1>
                    <div className="flex flex-wrap gap-2">
                        {canApprove && <Button size="sm" leftIcon={<CheckCircle className="h-4 w-4" />} onClick={() => { setAlasan(''); setConfirmAction('approve'); }}>Setujui</Button>}
                        {canReject && <Button size="sm" variant="danger" leftIcon={<XCircle className="h-4 w-4" />} onClick={() => { setAlasan(''); setConfirmAction('reject'); }}>Tolak</Button>}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Dibuat {formatDateTime(item.created_at)}</p>
                    </div>
                    {item.file_jsa && (
                        <button
                            type="button"
                            onClick={() => setShowJsa(true)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                            <Download className="h-4 w-4" /> Unduh JSA
                        </button>
                    )}
                </div>

                <Tabs tabs={[
                    { key: 'detail', label: 'Detail' },
                    { key: 'alat', label: 'Daftar Alat' },
                    { key: 'timeline', label: 'Lini Masa Status' },
                ]} active={tab} onChange={setTab} />

                <div className="mt-6">
                    {tab === 'detail' && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <InfoItem label="Peminjam" value={item.user?.nama_lengkap ?? '-'} />
                            <InfoItem label="NPM/NIP" value={item.user?.npm_nip ?? '-'} />
                            <InfoItem label="Email" value={item.user?.email ?? '-'} />
                            <InfoItem label="Dosen Pembimbing" value={item.dosen_pembimbing?.nama_lengkap ?? '-'} />
                            <InfoItem label="Laboratorium" value={item.laboratorium?.nama ?? '-'} />
                            <InfoItem label="Tujuan" value={item.tujuan ?? '-'} />
                            <InfoItem label="Periode" value={`${formatDate(item.tanggal_mulai)} ${item.jam_mulai?.substring(0,5)} - ${formatDate(item.tanggal_selesai)} ${item.jam_selesai?.substring(0,5)}`} />
                            <InfoItem label="Catatan" value={item.catatan || '-'} />
                        </div>
                    )}

                    {tab === 'alat' && (
                        item.details?.length ? (
                            <ul className="space-y-2">
                                {item.details.map((d: any) => (
                                    <li key={d.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                                        <span className="font-medium">{d.alat?.nama}</span>
                                        <span className="text-sm text-slate-500">{d.jumlah} unit</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <EmptyState title="Belum ada alat" description="Peminjaman ini belum memiliki alat." />
                    )}

                    {tab === 'timeline' && (
                        timelineItems.length ? <Timeline items={timelineItems} size="lg" /> : <EmptyState title="Belum ada log status" description="Belum ada perubahan status untuk peminjaman ini." />
                    )}

                    {dendaInfo}
                </div>
            </div>

            {item.file_jsa && (
                <DocumentPreview
                    file={item.file_jsa}
                    title="File JSA"
                    open={showJsa}
                    onClose={() => setShowJsa(false)}
                />
            )}

            <ConfirmModal
                open={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={isApprove ? handleApprove : handleReject}
                title={isApprove ? 'Setujui Peminjaman' : 'Tolak Peminjaman'}
                description={isApprove ? `Yakin ingin menyetujui peminjaman ${item.kode}?` : `Berikan alasan penolakan untuk peminjaman ${item.kode}.`}
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

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{value}</p>
        </div>
    );
}
