import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckCircle, Eye, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useFilter } from '@/Hooks/useFilter';
import { usePageLoading } from '@/Hooks/usePageLoading';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { ConfirmDeleteButton } from '@/Components/ConfirmDeleteButton';
import { ConfirmModal } from '@/Components/ConfirmModal';
import { DataTable } from '@/Components/DataTable';
import { DatePicker } from '@/Components/DatePicker';
import { FilterChips } from '@/Components/FilterChips';
import { Pagination } from '@/Components/Pagination';
import { SearchInput } from '@/Components/SearchInput';
import { Select } from '@/Components/Select';
import { Textarea } from '@/Components/Textarea';
import { formatDate } from '@/lib/date';
import { statusPeminjamanMap as statusMap } from '@/lib/status';

interface Peminjaman {
    id: number;
    kode: string;
    tujuan: string;
    status: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    jam_mulai: string;
    jam_selesai: string;
    user: { nama_lengkap: string; npm_nip: string };
    dosen_pembimbing?: { nama_lengkap: string } | null;
    laboratorium: { nama: string };
    details: { alat: { nama: string; kode?: string }; jumlah: number }[];
}

const statusOptions = [
    { value: '', label: 'Semua Status' },
    ...Object.entries(statusMap).map(([value, item]) => ({ value, label: item.label })),
];

export default function Index() {
    const { items, labs } = usePage().props as any;
    const loading = usePageLoading();
    const base = '/dashboard/admin/peminjaman';
    const { filters, apply } = useFilter(base);

    const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);
    const [selected, setSelected] = useState<Peminjaman | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const labOptions = [
        { value: '', label: 'Semua Lab' },
        ...Object.entries((labs ?? {}) as Record<string, string>).map(([id, nama]) => ({ value: id, label: nama })),
    ];

    const handleConfirm = () => {
        if (!selected) return;

        if (confirmAction === 'approve') {
            router.post(`${base}/${selected.id}/approve`, {}, { preserveScroll: true });
        } else if (confirmAction === 'reject') {
            if (!rejectReason.trim()) return;
            router.post(`${base}/${selected.id}/reject`, { alasan_penolakan: rejectReason }, { preserveScroll: true });
        }

        setConfirmAction(null);
        setSelected(null);
        setRejectReason('');
    };

    const openApprove = (p: Peminjaman) => {
        setSelected(p);
        setConfirmAction('approve');
    };

    const openReject = (p: Peminjaman) => {
        setSelected(p);
        setConfirmAction('reject');
        setRejectReason('');
    };

    const columns = [
        { header: 'Kode', accessor: 'kode' as keyof Peminjaman },
        { header: 'Peminjam', accessor: (p: Peminjaman) => `${p.user.nama_lengkap} (${p.user.npm_nip})` },
        { header: 'Lab', accessor: (p: Peminjaman) => p.laboratorium?.nama ?? '-' },
        { header: 'Dosen', accessor: (p: Peminjaman) => p.dosen_pembimbing?.nama_lengkap ?? '-' },
        {
            header: 'Alat',
            accessor: (p: Peminjaman) => p.details.map((d) => `${d.alat.nama} x${d.jumlah}`).join(', '),
        },
        { header: 'Periode', accessor: (p: Peminjaman) => `${formatDate(p.tanggal_mulai)} ${p.jam_mulai?.substring(0,5) ?? ''} - ${formatDate(p.tanggal_selesai)} ${p.jam_selesai?.substring(0,5) ?? ''}` },
        {
            header: 'Status',
            accessor: (p: Peminjaman) => {
                const s = statusMap[p.status] ?? { label: p.status, variant: 'neutral' };
                return <Badge variant={s.variant}>{s.label}</Badge>;
            },
        },
        {
            header: 'Aksi',
            accessor: (p: Peminjaman) => (
                <div className="flex justify-end gap-2">
                    <Link href={`${base}/${p.id}`}>
                        <Button size="sm" variant="neutral" leftIcon={<Eye className="h-4 w-4" />}>Detail</Button>
                    </Link>
                    {['diajukan', 'menunggu_dosen', 'menunggu_laboran'].includes(p.status) && (
                        <>
                            <Button size="sm" leftIcon={<CheckCircle className="h-4 w-4" />} onClick={() => openApprove(p)}>Setuju</Button>
                            <Button size="sm" variant="danger" leftIcon={<XCircle className="h-4 w-4" />} onClick={() => openReject(p)}>Tolak</Button>
                        </>
                    )}
                    <ConfirmDeleteButton
                        onDelete={() => router.delete(`${base}/${p.id}`)}
                        description={`Hapus peminjaman ${p.kode}?`}
                    />
                </div>
            ),
            className: 'text-right w-96',
        },
    ];

    const isApprove = confirmAction === 'approve';

    return (
        <>
            <Head title="Manajemen Peminjaman" />
            <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Manajemen Peminjaman</h1>
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end flex-wrap">
                    <SearchInput value={filters?.search ?? ''} onSearch={(v) => apply({ search: v })} placeholder="Cari kode/peminjam/alat..." className="max-w-sm" />
                    <Select options={labOptions} value={filters?.laboratorium ?? ''} onChange={(e) => apply({ laboratorium: e.target.value })} className="max-w-xs" />
                    <DatePicker value={filters?.start ?? ''} onChange={(e) => apply({ start: e.target.value })} placeholder="Mulai" className="max-w-[180px]" />
                    <DatePicker value={filters?.end ?? ''} onChange={(e) => apply({ end: e.target.value })} placeholder="Selesai" className="max-w-[180px]" />
                    <Button onClick={() => apply({})} size="md">Cari</Button>
                </div>
                <FilterChips options={statusOptions} value={filters?.status ?? ''} onChange={(v) => apply({ status: v as string })} />
            </div>
            <DataTable isLoading={loading} columns={columns} data={items.data as Peminjaman[]} keyExtractor={(p) => p.id} emptyText="Tidak ada data peminjaman." />
            <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />

            <ConfirmModal
                open={!!confirmAction}
                onClose={() => { setConfirmAction(null); setSelected(null); setRejectReason(''); }}
                onConfirm={handleConfirm}
                title={isApprove ? 'Setujui Peminjaman' : 'Tolak Peminjaman'}
                description={isApprove ? `Yakin ingin menyetujui peminjaman ${selected?.kode ?? ''}?` : `Berikan alasan penolakan untuk peminjaman ${selected?.kode ?? ''}.`}
                confirmLabel={isApprove ? 'Setuju' : 'Tolak'}
                variant={isApprove ? 'info' : 'danger'}
                confirmDisabled={!isApprove && !rejectReason.trim()}
            >
                {!isApprove && (
                    <Textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Alasan penolakan"
                        rows={3}
                    />
                )}
            </ConfirmModal>
        </>
    );
}
