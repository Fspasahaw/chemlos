import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Edit, Eye, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePageLoading } from '../../../../Hooks/usePageLoading';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { Card } from '@/Components/Card';
import { DataTable } from '@/Components/DataTable';
import { Input } from '@/Components/Input';
import Modal from '@/Components/Modal';
import { Pagination } from '@/Components/Pagination';
import { Select } from '@/Components/Select';
import { Tooltip } from '@/Components/Tooltip';
import { statusVerifikasiMap as statusMap } from '@/lib/status';

interface UserItem {
    id: number;
    nama_lengkap: string;
    email: string;
    npm_nip: string;
    status: string;
    roles: { name: string }[];
    program_studi?: { nama: string };
}

const roleOptions = [
    { value: '', label: 'Semua Peran' },
    { value: 'mahasiswa', label: 'Mahasiswa' },
    { value: 'dosen', label: 'Dosen' },
];

const statusOptions = [
    { value: '', label: 'Semua Status' },
    ...Object.entries(statusMap).map(([value, item]) => ({ value, label: item.label })),
];

export default function Index() {
    const { items, filters } = usePage().props as any;
    const loading = usePageLoading();
    const { delete: destroy, processing } = useForm();
    const [search, setSearch] = useState(filters?.search ?? '');
    const [role, setRole] = useState(filters?.role ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    useEffect(() => {
        const t = setTimeout(() => {
            router.get('/dashboard/laboran/pengguna', { search, role, status }, { preserveState: true, preserveScroll: true, replace: true });
        }, 400);
        return () => clearTimeout(t);
    }, [search, role, status]);

    const handleDelete = () => {
        if (!deleteId) return;
        destroy(`/dashboard/laboran/pengguna/${deleteId}`, { preserveScroll: true, onFinish: () => setDeleteId(null) });
    };

    const columns = [
        { header: 'Nama', accessor: (row: UserItem) => row.nama_lengkap },
        { header: 'Email', accessor: (row: UserItem) => row.email },
        { header: 'NPM/NIP', accessor: (row: UserItem) => row.npm_nip },
        { header: 'Peran', accessor: (row: UserItem) => row.roles.map((r) => r.name.replace(/_/g, ' ')).join(', ') },
        { header: 'Program Studi', accessor: (row: UserItem) => row.program_studi?.nama ?? '-' },
        {
            header: 'Status',
            accessor: (row: UserItem) => {
                const s = statusMap[row.status] ?? { label: row.status, variant: 'neutral' };
                return <Badge variant={s.variant as any}>{s.label}</Badge>;
            },
        },
        {
            header: 'Aksi',
            accessor: (row: UserItem) => (
                <div className="flex items-center justify-end gap-2">
                    <Tooltip content="Detail">
                        <Link href={`/dashboard/laboran/pengguna/${row.id}`} className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Tooltip>
                    <Tooltip content="Edit">
                        <Link href={`/dashboard/laboran/pengguna/${row.id}/edit`} className="rounded-lg p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20">
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Tooltip>
                    <Tooltip content="Hapus">
                        <button onClick={() => setDeleteId(row.id)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20" aria-label="Hapus">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Pengguna Terbatas" />
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Pengguna Terbatas</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Kelola akun Mahasiswa dan Dosen yang Anda buat.</p>
                </div>
                <Link href="/dashboard/laboran/pengguna/create">
                    <Button leftIcon={<Plus className="h-4 w-4" />}>Tambah Pengguna</Button>
                </Link>
            </div>

            <Card className="mb-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama, email, atau NPM/NIP..." leftIcon={<Search className="h-4 w-4" />} className="flex-1" />
                    <Select options={roleOptions} value={role} onChange={(e) => setRole(e.target.value)} className="w-full sm:w-44" />
                    <Select options={statusOptions} value={status} onChange={(e) => setStatus(e.target.value)} className="w-full sm:w-52" />
                </div>
            </Card>

            <DataTable<UserItem>
                isLoading={loading}
                columns={columns}
                data={items.data}
                keyExtractor={(row) => row.id}
                emptyText="Tidak ada pengguna yang dibuat."
            />

            <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />

            <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Konfirmasi Hapus" size="sm">
                <p className="text-sm text-slate-600 dark:text-slate-300">Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.</p>
                <div className="mt-4 flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={() => setDeleteId(null)}>Batal</Button>
                    <Button type="button" variant="danger" isLoading={processing} onClick={handleDelete}>Hapus</Button>
                </div>
            </Modal>
        </>
    );
}
