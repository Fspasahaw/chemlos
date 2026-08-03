import { Head, router, usePage } from '@inertiajs/react';
import { Search, XCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { usePageLoading } from '../../../../Hooks/usePageLoading';
import { Badge } from '../../../../Components/Badge';
import { Button } from '../../../../Components/Button';
import { Card } from '../../../../Components/Card';
import { DataTable, Column } from '../../../../Components/DataTable';
import { Input } from '../../../../Components/Input';
import { Pagination } from '../../../../Components/Pagination';
import { SearchInput } from '../../../../Components/SearchInput';
import { Select } from '../../../../Components/Select';
import { statusVerifikasiMap as statusMap } from '../../../../lib/status';

interface UserItem {
    id: number;
    nama_lengkap: string;
    email: string;
    npm_nip: string | null;
    status: string;
    roles?: { name: string }[];
}

export default function Index() {
    const { items, filters } = usePage().props as any;
    const loading = usePageLoading();
    const [search, setSearch] = useState(filters?.search ?? '');
    const [rejectId, setRejectId] = useState<number | null>(null);
    const [reason, setReason] = useState('');

    const apply = (params: Record<string, string>) => router.get('/dashboard/laboran/verifikasi-akun', params, { preserveState: true, preserveScroll: true });

    const action = (url: string, body?: Record<string, any>) => router.post(url, body ?? {}, { preserveScroll: true });

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
                            onClick={() => action(`/dashboard/laboran/verifikasi-akun/${item.id}/approve`)}
                        >
                            Setuju
                        </Button>
                        {rejectId === item.id ? (
                            <>
                                <Input
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Alasan"
                                    className="w-32"
                                />
                                <Button
                                    size="sm"
                                    variant="danger"
                                    leftIcon={<XCircle className="h-3 w-3" />}
                                    onClick={() => {
                                        if (reason) {
                                            action(`/dashboard/laboran/verifikasi-akun/${item.id}/reject`, { rejection_reason: reason });
                                            setRejectId(null);
                                            setReason('');
                                        }
                                    }}
                                >
                                    Tolak
                                </Button>
                            </>
                        ) : (
                            <Button
                                size="sm"
                                variant="outline"
                                leftIcon={<XCircle className="h-3 w-3" />}
                                onClick={() => setRejectId(item.id)}
                            >
                                Tolak
                            </Button>
                        )}
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
                        value={search}
                        onChange={(v) => setSearch(v)}
                        onSearch={() => apply({ search })}
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
                        onChange={(e) => apply({ status: e.target.value, search })}
                        className="w-48"
                    />
                    <Button onClick={() => apply({ search })} leftIcon={<Search className="h-4 w-4" />}>Cari</Button>
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
        </>
    );
}
