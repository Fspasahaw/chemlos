import { Head, router, usePage } from '@inertiajs/react';
import { Search, XCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useFilter } from '@/Hooks/useFilter';
import { usePageLoading } from '@/Hooks/usePageLoading';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { Card } from '@/Components/Card';
import { ConfirmModal } from '@/Components/ConfirmModal';
import { DataTable, Column } from '@/Components/DataTable';
import { Pagination } from '@/Components/Pagination';
import { SearchInput } from '@/Components/SearchInput';
import { Select } from '@/Components/Select';
import { Textarea } from '@/Components/Textarea';
import { statusVerifikasiMap as statusMap } from '@/lib/status';

interface UserItem {
    id: number;
    nama_lengkap: string;
    email: string;
    npm_nip: string | null;
    status: string;
    roles?: { name: string }[];
}

type ConfirmAction = {
    item: UserItem;
    type: 'approve' | 'reject';
};

export default function Index() {
    const { items } = usePage().props as any;
    const loading = usePageLoading();
    const { filters, apply } = useFilter('/dashboard/laboran/verifikasi-akun');
    const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
    const [reason, setReason] = useState('');
    const [reasonError, setReasonError] = useState('');

    const action = (url: string, body?: Record<string, any>) => router.post(url, body ?? {}, { preserveScroll: true });

    const openApprove = (item: UserItem) => {
        setReason('');
        setReasonError('');
        setConfirm({ item, type: 'approve' });
    };

    const openReject = (item: UserItem) => {
        setReason('');
        setReasonError('');
        setConfirm({ item, type: 'reject' });
    };

    const closeModal = () => {
        setConfirm(null);
        setReason('');
        setReasonError('');
    };

    const handleConfirm = () => {
        if (! confirm) return;

        if (confirm.type === 'approve') {
            action(`/dashboard/laboran/verifikasi-akun/${confirm.item.id}/approve`);
            closeModal();
            return;
        }

        if (! reason.trim()) {
            setReasonError('Alasan penolakan wajib diisi.');
            return;
        }

        action(`/dashboard/laboran/verifikasi-akun/${confirm.item.id}/reject`, { rejection_reason: reason });
        closeModal();
    };

    const columns: Column<UserItem>[] = [
        { header: 'Nama', accessor: 'nama_lengkap' },
        { header: 'Email', accessor: 'email' },
        { header: 'NPM/NIP', accessor: (item) => item.npm_nip ?? '-' },
        { header: 'Peran', accessor: (item) => item.roles?.map((r: any) => r.name).join(', ') ?? '-' },
        {
            header: 'Status',
            accessor: (item) => {
                const st = statusMap[item.status] ?? { label: item.status, variant: 'neutral' as const };
                return <Badge variant={st.variant}>{st.label}</Badge>;
            },
        },
        {
            header: 'Aksi',
            accessor: (item) => (
                ['pending_email', 'pending_approval'].includes(item.status) ? (
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="success"
                            leftIcon={<CheckCircle className="h-3 w-3" />}
                            onClick={() => openApprove(item)}
                        >
                            Setuju
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<XCircle className="h-3 w-3" />}
                            onClick={() => openReject(item)}
                        >
                            Tolak
                        </Button>
                    </div>
                ) : null
            ),
            className: 'w-px',
        },
    ];

    return (
        <>
            <Head title="Verifikasi Akun" />
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Verifikasi Akun</h1>
                <p className="text-slate-500 dark:text-slate-400">Setujui atau tolak akun mahasiswa dan dosen.</p>
            </div>
            <Card>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                    <SearchInput
                        value={filters?.search ?? ''}
                        onSearch={(val) => apply({ search: val })}
                        placeholder="Cari nama/email/NPM/NIP"
                        className="flex-1"
                    />
                    <Select
                        options={[
                            { value: '', label: 'Semua Status' },
                            { value: 'pending_email', label: 'Pending Email' },
                            { value: 'pending_approval', label: 'Pending Persetujuan' },
                            { value: 'rejected', label: 'Ditolak' },
                        ]}
                        value={filters?.status ?? ''}
                        onChange={(e) => apply({ status: e.target.value })}
                        className="w-48"
                    />
                    <Button onClick={() => apply({})} leftIcon={<Search className="h-4 w-4" />}>Cari</Button>
                </div>
                <DataTable
                    isLoading={loading}
                    columns={columns}
                    data={items.data}
                    keyExtractor={(row) => row.id}
                    emptyText="Tidak ada data verifikasi."
                />
                <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />
            </Card>

            <ConfirmModal
                open={!! confirm}
                onClose={closeModal}
                onConfirm={handleConfirm}
                title={confirm?.type === 'approve' ? 'Setujui Akun' : 'Tolak Akun'}
                description={
                    confirm
                        ? (confirm.type === 'approve'
                            ? `Yakin ingin menyetujui akun ${confirm.item.nama_lengkap}?`
                            : `Yakin ingin menolak akun ${confirm.item.nama_lengkap}? Berikan alasan penolakan.`)
                        : 'Apakah Anda yakin?'
                }
                confirmLabel={confirm?.type === 'approve' ? 'Setuju' : 'Tolak'}
                cancelLabel="Batal"
                variant={confirm?.type === 'approve' ? 'info' : 'danger'}
            >
                {confirm?.type === 'reject' && (
                    <Textarea
                        label="Alasan Penolakan *"
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value);
                            if (reasonError) setReasonError('');
                        }}
                        error={reasonError}
                        placeholder="Jelaskan alasan penolakan..."
                        rows={3}
                        autoResize
                    />
                )}
            </ConfirmModal>
        </>
    );
}
