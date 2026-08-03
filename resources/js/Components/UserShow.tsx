import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Edit, Lock, Pencil, RotateCcw, Shield, UserX } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import { ConfirmActionButton } from './ConfirmActionButton';
import { EmptyState } from './EmptyState';
import { SkeletonDetail } from './SkeletonDetail';
import { Tabs } from './Tabs';
import { Timeline } from './Timeline';
import { formatDate, formatDateTime } from '../lib/date';
import { peranLabelMap, roleLabelMap } from '../lib/status';

const statusVariant: Record<string, any> = {
    pending_email: 'info',
    pending_approval: 'warning',
    approved: 'success',
    rejected: 'danger',
    suspended: 'neutral',
};

const statusLabel: Record<string, string> = {
    diajukan: 'Diajukan',
    menunggu_dosen: 'Menunggu Dosen',
    menunggu_laboran: 'Menunggu Laboran',
    disetujui: 'Disetujui',
    berlangsung: 'Berlangsung',
    selesai: 'Selesai',
    terlambat: 'Terlambat',
    ditolak: 'Ditolak',
    dibatalkan: 'Dibatalkan',
};

const statusUserLabel: Record<string, string> = {
    pending_email: 'Pending Email',
    pending_approval: 'Pending Persetujuan',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    inactive: 'Tidak Aktif',
    suspended: 'Dinonaktifkan',
    active: 'Aktif',
};

interface UserShowProps {
    base: string;
    canEdit?: boolean;
    canReset?: boolean;
    canSuspend?: boolean;
}

export default function UserShow({ base, canEdit = true, canReset = false, canSuspend = false }: UserShowProps) {
    const { item, riwayat } = usePage().props as any;
    if (!item) return <SkeletonDetail />;
    const [tab, setTab] = useState('peminjaman');
    const roles = (item.roles ?? []).map((r: any) => roleLabelMap[r.name] ?? r.name).join(', ') || '-';

    const peminjamanItems = (riwayat?.peminjaman ?? []).map((p: any) => ({
        id: p.id,
        icon: p.status === 'selesai' ? 'check' : p.status === 'ditolak' || p.status === 'dibatalkan' ? 'warning' : 'package',
        title: `${p.laboratorium?.nama ?? 'Laboratorium'} — ${p.kode}`,
        description: p.details?.map((d: any) => `${d.alat?.nama ?? 'Alat'} x${d.jumlah}`).join(', '),
        status: statusLabel[p.status] ?? p.status,
        date: `${formatDate(p.tanggal_mulai)} s.d ${formatDate(p.tanggal_selesai)}`,
    }));

    const persetujuanItems = (riwayat?.persetujuan ?? []).map((s: any) => ({
        id: s.id,
        icon: s.status_ke === 'ditolak' ? 'warning' : 'check',
        title: `${s.peminjaman?.kode ?? 'Peminjaman'} — ${s.peminjaman?.user?.nama_lengkap ?? '-'}`,
        description: `${statusLabel[s.status_dari] ?? s.status_dari} → ${statusLabel[s.status_ke] ?? s.status_ke}`,
        status: s.keterangan,
        date: formatDateTime(s.created_at),
    }));

    const aktivitasItems = (riwayat?.aktivitas ?? []).map((a: any, idx: number) => ({
        id: `${a.id}-${idx}`,
        icon: 'activity',
        title: a.description,
        description: a.log_name,
        date: formatDateTime(a.created_at),
    }));

    return (
        <>
            <Head title={`Pengguna: ${item.nama_lengkap}`} />
            <div className="mb-6">
                <Link href={base} className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400">
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Link>
                <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Detail Pengguna</h1>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar src={item.avatar} name={item.nama_lengkap} size="lg" />
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{item.nama_lengkap}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{item.email}</p>
                            <Badge variant={statusVariant[item.status] ?? 'default'} className="mt-1">{statusUserLabel[item.status] ?? item.status}</Badge>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {canEdit && (
                            <Link href={`${base}/${item.id}/edit`}>
                                <Button size="sm" leftIcon={<Pencil className="h-4 w-4" />}>Edit</Button>
                            </Link>
                        )}
                        {canReset && (
                            <ConfirmActionButton
                                icon={<Lock className="h-4 w-4" />}
                                label="Reset Password"
                                description={`Reset password untuk ${item.nama_lengkap}?`}
                                confirmLabel="Reset"
                                variant="primary"
                                onConfirm={() => router.post(`${base}/${item.id}/reset-password`)}
                            />
                        )}
                        {canSuspend && (
                            item.status === 'suspended' ? (
                                <ConfirmActionButton
                                    icon={<RotateCcw className="h-4 w-4" />}
                                    label="Aktifkan"
                                    description={`Aktifkan kembali akun ${item.nama_lengkap}?`}
                                    confirmLabel="Aktifkan"
                                    variant="primary"
                                    onConfirm={() => router.post(`${base}/${item.id}/suspend`)}
                                    className="text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                                />
                            ) : (
                                <ConfirmActionButton
                                    icon={<UserX className="h-4 w-4" />}
                                    label="Nonaktifkan"
                                    description={`Nonaktifkan akun ${item.nama_lengkap}?`}
                                    confirmLabel="Nonaktifkan"
                                    variant="warning"
                                    onConfirm={() => router.post(`${base}/${item.id}/suspend`)}
                                    className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
                                />
                            )
                        )}
                    </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <InfoItem icon={<Shield className="h-5 w-5 text-slate-400" />} label="Peran" value={roles.replace(/_/g, ' ')} />
                    <InfoItem icon={<Shield className="h-5 w-5 text-slate-400" />} label="NPM/NIP" value={item.npm_nip || '-'} />
                    <InfoItem icon={<Shield className="h-5 w-5 text-slate-400" />} label="Program Studi" value={item.program_studi?.nama || '-'} />
                    {item.jabatan_pimpinan && <InfoItem icon={<Shield className="h-5 w-5 text-slate-400" />} label="Jabatan Pimpinan" value={item.jabatan_pimpinan.replace(/_/g, ' ')} />}
                    {item.laboratorium_pengelolas?.length > 0 && <InfoItem icon={<Shield className="h-5 w-5 text-slate-400" />} label="Laboratorium" value={item.laboratorium_pengelolas.map((lp: any) => `${lp.laboratorium.nama} (${peranLabelMap[lp.peran] ?? lp.peran})`).join(', ')} />}
                </div>

                <div className="mt-8">
                    <Tabs tabs={[
                        { key: 'peminjaman', label: 'Peminjaman' },
                        { key: 'persetujuan', label: 'Persetujuan' },
                        { key: 'aktivitas', label: 'Aktivitas' },
                    ]} active={tab} onChange={setTab} />

                    <div className="mt-4">
                        {tab === 'peminjaman' && (
                            riwayat?.peminjaman?.length ? <Timeline items={peminjamanItems} /> : <EmptyState title="Belum ada peminjaman" description="Pengguna ini belum pernah melakukan peminjaman." />
                        )}
                        {tab === 'persetujuan' && (
                            riwayat?.persetujuan?.length ? <Timeline items={persetujuanItems} /> : <EmptyState title="Belum ada persetujuan" description="Pengguna ini belum pernah menyetujui peminjaman." />
                        )}
                        {tab === 'aktivitas' && (
                            riwayat?.aktivitas?.length ? <Timeline items={aktivitasItems} /> : <EmptyState title="Belum ada aktivitas" description="Belum ada aktivitas yang tercatat untuk pengguna ini." />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3">
            {icon}
            <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-sm font-medium capitalize text-slate-900 dark:text-slate-100">{value}</p>
            </div>
        </div>
    );
}
