import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckCircle, Eye, Pencil, Plus, RotateCcw, ShieldAlert, Trash2, UserCog, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useFilter } from '@/Hooks/useFilter';
import { usePageLoading } from '@/Hooks/usePageLoading';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { DataTable } from '@/Components/DataTable';
import { FilterChips } from '@/Components/FilterChips';
import Modal from '@/Components/Modal';
import { Pagination } from '@/Components/Pagination';
import { SearchInput } from '@/Components/SearchInput';
import { TableActions } from '@/Components/TableActions';
import { useLang } from '@/Providers/LanguageProvider';
import { formatDate } from '@/lib/date';

interface UserItem {
    id: number;
    nama_lengkap: string;
    email: string;
    npm_nip: string;
    status: string;
    roles: { name: string }[];
    created_at: string;
}

const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'pending_email', label: 'Belum Verifikasi Email' },
    { value: 'pending_approval', label: 'Menunggu Persetujuan' },
    { value: 'approved', label: 'Aktif' },
    { value: 'rejected', label: 'Ditolak' },
    { value: 'suspended', label: 'Dinonaktifkan' },
];

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

export default function Index() {
    const { t } = useLang();
    const { items, roles } = usePage().props as any;
    const loading = usePageLoading();
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [roleModal, setRoleModal] = useState<UserItem | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [rejectModal, setRejectModal] = useState<UserItem | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const base = '/dashboard/admin/users';
    const { filters, apply } = useFilter(base);

    const action = (url: string, userId: number, payload: Record<string, any> = {}) => {
        setLoadingId(userId);
        router.post(url, payload, { preserveScroll: true, onFinish: () => setLoadingId(null) });
    };

    const deleteUser = (userId: number) => {
        setLoadingId(userId);
        router.delete(`${base}/${userId}`, { preserveScroll: true, onFinish: () => setLoadingId(null) });
    };

    const openRoleModal = (item: UserItem) => {
        setRoleModal(item);
        setSelectedRoles(item.roles.map((r) => r.name));
    };

    const saveRoles = () => {
        if (!roleModal) return;
        action(`${base}/${roleModal.id}/set-role`, roleModal.id, { roles: selectedRoles });
        setRoleModal(null);
    };

    const openRejectModal = (item: UserItem) => {
        setRejectModal(item);
        setRejectReason('');
    };

    const submitReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectModal || !rejectReason.trim()) return;
        action(`${base}/${rejectModal.id}/reject`, rejectModal.id, { rejection_reason: rejectReason });
        setRejectModal(null);
    };

    const needsApproval = (s: string) => ['pending_email', 'pending_approval'].includes(s);

    const columns = [
        { header: t('Nama', 'Name'), accessor: 'nama_lengkap' as keyof UserItem },
        { header: 'Email', accessor: 'email' as keyof UserItem },
        { header: 'NPM/NIP', accessor: 'npm_nip' as keyof UserItem },
        {
            header: t('Status', 'Status'),
            accessor: (row: UserItem) => (
                <Badge variant={statusBadgeMap[row.status] ?? 'neutral'}>{statusLabelMap[row.status] ?? row.status}</Badge>
            ),
        },
        { header: t('Role', 'Role'), accessor: (row: UserItem) => row.roles.map((r) => r.name).join(', ') || '-' },
        {
            header: t('Terdaftar', 'Registered'),
            accessor: (row: UserItem) => formatDate(row.created_at),
        },
        {
            header: t('Aksi', 'Actions'),
            accessor: (row: UserItem) => (
                <TableActions
                    actions={[
                        { id: 'detail', label: t('Detail', 'Detail'), icon: <Eye className="h-4 w-4" />, href: `${base}/${row.id}`, variant: 'neutral' },
                        { id: 'edit', label: t('Edit', 'Edit'), icon: <Pencil className="h-4 w-4" />, href: `${base}/${row.id}/edit`, variant: 'primary' },
                        {
                            id: 'approve',
                            label: t('Setujui', 'Approve'),
                            icon: <CheckCircle className="h-4 w-4" />,
                            variant: 'success',
                            hidden: !needsApproval(row.status),
                            disabled: loadingId === row.id,
                            onClick: () => action(`${base}/${row.id}/verify`, row.id),
                        },
                        {
                            id: 'reject',
                            label: t('Tolak', 'Reject'),
                            icon: <XCircle className="h-4 w-4" />,
                            variant: 'danger',
                            hidden: !needsApproval(row.status),
                            disabled: loadingId === row.id,
                            onClick: () => openRejectModal(row),
                        },
                        {
                            id: 'role',
                            label: t('Set Role', 'Set Role'),
                            icon: <UserCog className="h-4 w-4" />,
                            variant: 'primary',
                            onClick: () => openRoleModal(row),
                        },
                        {
                            id: 'suspend',
                            label: t('Suspend', 'Suspend'),
                            icon: <ShieldAlert className="h-4 w-4" />,
                            variant: 'warning',
                            disabled: loadingId === row.id,
                            confirm: {
                                title: t('Tangguhkan', 'Suspend'),
                                description: `Yakin ingin menangguhkan akun ${row.nama_lengkap}?`,
                                confirmLabel: t('Tangguhkan', 'Suspend'),
                                variant: 'warning',
                            },
                            onClick: () => action(`${base}/${row.id}/suspend`, row.id),
                        },
                        {
                            id: 'reset',
                            label: t('Reset Password', 'Reset Password'),
                            icon: <RotateCcw className="h-4 w-4" />,
                            variant: 'info',
                            disabled: loadingId === row.id,
                            confirm: {
                                title: 'Reset Password',
                                description: `Reset password untuk ${row.nama_lengkap}? Pengguna akan menerima password baru.`,
                                confirmLabel: 'Reset',
                                variant: 'primary',
                            },
                            onClick: () => action(`${base}/${row.id}/reset-password`, row.id),
                        },
                        {
                            id: 'delete',
                            label: t('Hapus', 'Delete'),
                            icon: <Trash2 className="h-4 w-4" />,
                            variant: 'danger',
                            disabled: loadingId === row.id,
                            confirm: {
                                title: 'Hapus Pengguna',
                                description: `Yakin ingin menghapus pengguna ${row.nama_lengkap}?`,
                                confirmLabel: 'Hapus',
                                variant: 'danger',
                            },
                            onClick: () => deleteUser(row.id),
                        },
                    ]}
                />
            ),
            className: 'text-right',
        },
    ];

    const roleOptions = (roles as string[]).map((r) => ({ value: r, label: r.replace(/_/g, ' ') }));

    return (
        <>
            <Head title={t('Pengguna', 'Users')} />
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('Pengguna', 'Users')}</h1>
                <Link href={`${base}/create`}>
                    <Button leftIcon={<Plus className="h-4 w-4" />}>{t('Tambah Pengguna', 'Add User')}</Button>
                </Link>
            </div>

            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <SearchInput
                        value={filters?.search ?? ''}
                        onSearch={(v) => apply({ search: v })}
                        placeholder="Cari nama/email/NPM..."
                        className="max-w-sm"
                    />
                    <Button onClick={() => apply({})} size="md">{t('Cari', 'Search')}</Button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <FilterChips
                        options={statusOptions}
                        value={filters?.status ?? ''}
                        onChange={(v) => apply({ status: v as string })}
                    />
                    <FilterChips
                        options={[{ value: '', label: 'Semua Role' }, ...roleOptions]}
                        value={filters?.role ?? ''}
                        onChange={(v) => apply({ role: v as string })}
                    />
                </div>
            </div>

            <DataTable isLoading={loading} columns={columns} data={items.data as UserItem[]} keyExtractor={(row) => row.id} emptyText={t('Tidak ada data.', 'No data.')} />
            <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />

            {roleModal && (
                <Modal
                    open={!!roleModal}
                    onClose={() => setRoleModal(null)}
                    title={t('Atur Peran', 'Set Roles')}
                    footer={
                        <>
                            <Button variant="outline" size="sm" onClick={() => setRoleModal(null)}>{t('Batal', 'Cancel')}</Button>
                            <Button size="sm" onClick={saveRoles}>{t('Simpan', 'Save')}</Button>
                        </>
                    }
                >
                    <div className="space-y-2">
                        {roleOptions.map((r) => (
                            <label key={r.value} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                                <input
                                    type="checkbox"
                                    checked={selectedRoles.includes(r.value)}
                                    onChange={() => setSelectedRoles(selectedRoles.includes(r.value) ? selectedRoles.filter((x) => x !== r.value) : [...selectedRoles, r.value])}
                                    className="h-4 w-4 accent-indigo-600"
                                />
                                <span className="text-sm capitalize">{r.label}</span>
                            </label>
                        ))}
                    </div>
                </Modal>
            )}

            {rejectModal && (
                <Modal
                    open={!!rejectModal}
                    onClose={() => setRejectModal(null)}
                    title={t('Tolak Akun', 'Reject Account')}
                    footer={
                        <>
                            <Button variant="outline" size="sm" onClick={() => setRejectModal(null)}>{t('Batal', 'Cancel')}</Button>
                            <Button variant="danger" size="sm" onClick={submitReject} disabled={!rejectReason.trim()}>{t('Tolak', 'Reject')}</Button>
                        </>
                    }
                >
                    <form onSubmit={submitReject} className="space-y-3">
                        <p className="text-sm text-slate-600 dark:text-slate-300">{t('Akun', 'Account')}: <strong>{rejectModal.nama_lengkap}</strong></p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={3}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900"
                            placeholder={t('Masukkan alasan penolakan...', 'Enter rejection reason...')}
                            required
                        />
                    </form>
                </Modal>
            )}
        </>
    );
}
