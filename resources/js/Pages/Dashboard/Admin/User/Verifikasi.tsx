import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckCircle, Eye, Search, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useFilter } from '@/Hooks/useFilter';
import { usePageLoading } from '@/Hooks/usePageLoading';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { DataTable } from '@/Components/DataTable';
import { SearchInput } from '@/Components/SearchInput';
import Modal from '@/Components/Modal';
import { Pagination } from '@/Components/Pagination';
import { Tooltip } from '@/Components/Tooltip';

interface UserItem {
    id: number;
    nama_lengkap: string;
    email: string;
    npm_nip: string;
    status: string;
    roles: { name: string }[];
    created_at: string;
}

const statusBadgeMap: Record<string, 'info' | 'warning' | 'success' | 'danger' | 'neutral'> = {
    pending_email: 'info',
    pending_approval: 'warning',
    approved: 'success',
    rejected: 'danger',
    suspended: 'neutral',
};

const statusLabelMap: Record<string, string> = {
    pending_email: 'Belum Verifikasi Email',
    pending_approval: 'Menunggu Persetujuan',
    approved: 'Aktif',
    rejected: 'Ditolak',
    suspended: 'Dinonaktifkan',
};

export default function Verifikasi() {
    const { items } = usePage().props as any;
    const loading = usePageLoading();
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [rejectModal, setRejectModal] = useState<UserItem | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const base = '/dashboard/admin/users';
    const filterBase = '/dashboard/admin/verifikasi-akun';
    const { filters, apply } = useFilter(filterBase);

    const action = (url: string, userId: number, payload: Record<string, any> = {}) => {
        setLoadingId(userId);
        router.post(url, payload, { preserveScroll: true, onFinish: () => setLoadingId(null) });
    };

    const submitReject = () => {
        if (!rejectModal || !rejectReason.trim()) return;
        action(`${base}/${rejectModal.id}/reject`, rejectModal.id, { rejection_reason: rejectReason });
        setRejectModal(null);
    };

    const columns = [
        { header: 'Nama', accessor: 'nama_lengkap' as keyof UserItem },
        { header: 'Email', accessor: 'email' as keyof UserItem },
        { header: 'NPM/NIP', accessor: 'npm_nip' as keyof UserItem },
        {
            header: 'Status',
            accessor: (row: UserItem) => <Badge variant={statusBadgeMap[row.status] ?? 'neutral'}>{statusLabelMap[row.status] ?? row.status}</Badge>,
        },
        { header: 'Role', accessor: (row: UserItem) => row.roles.map((r) => r.name).join(', ') || '-' },
        {
            header: 'Aksi',
            accessor: (row: UserItem) => (
                <div className="flex justify-end gap-1">
                    <Tooltip content="Detail">
                        <Link href={`${base}/${row.id}`} className="inline-flex rounded-lg p-2 text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Tooltip>
                    <Tooltip content="Setujui">
                        <button onClick={() => action(`${base}/${row.id}/verify`, row.id)} disabled={loadingId === row.id} className="inline-flex rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20">
                            <CheckCircle className="h-4 w-4" />
                        </button>
                    </Tooltip>
                    <Tooltip content="Tolak">
                        <button onClick={() => { setRejectModal(row); setRejectReason(''); }} disabled={loadingId === row.id} className="inline-flex rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-900/20">
                            <XCircle className="h-4 w-4" />
                        </button>
                    </Tooltip>
                </div>
            ),
            className: 'text-right',
        },
    ];

    return (
        <>
            <Head title="Verifikasi Akun" />
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Verifikasi Akun</h1>
                <Link href="/dashboard/admin/users" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">Kembali ke Pengguna</Link>
            </div>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <SearchInput
                    value={filters?.search ?? ''}
                    onSearch={(v) => apply({ search: v })}
                    placeholder="Cari nama/email/NPM..."
                    className="max-w-sm"
                />
                <Button onClick={() => apply({})} size="md" leftIcon={<Search className="h-4 w-4" />}>Cari</Button>
            </div>

            <DataTable isLoading={loading} columns={columns} data={items.data as UserItem[]} keyExtractor={(row) => row.id} emptyText="Tidak ada akun menunggu verifikasi." />
            <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />

            <Modal
                open={!!rejectModal}
                onClose={() => setRejectModal(null)}
                title="Tolak Akun"
                size="sm"
                footer={(
                    <>
                        <Button type="button" variant="outline" size="sm" onClick={() => setRejectModal(null)}>Batal</Button>
                        <Button type="button" size="sm" variant="danger" onClick={submitReject}>Tolak</Button>
                    </>
                )}
            >
                <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Alasan penolakan"
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    required
                />
            </Modal>
        </>
    );
}
