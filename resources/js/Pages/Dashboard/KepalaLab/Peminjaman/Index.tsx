import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckCircle, Eye, Search, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePageLoading } from '../../../../Hooks/usePageLoading';
import { Badge } from '../../../../Components/Badge';
import { Button } from '../../../../Components/Button';
import { DataTable } from '../../../../Components/DataTable';
import { FilterChips } from '../../../../Components/FilterChips';
import { Input } from '../../../../Components/Input';
import { Pagination } from '../../../../Components/Pagination';
import { Tooltip } from '../../../../Components/Tooltip';
import { formatDate } from '../../../../lib/date';
import { statusPeminjamanMap as statusMap } from '../../../../lib/status';

interface Peminjaman {
    id: number;
    kode: string;
    tujuan: string;
    status: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    user: { nama_lengkap: string; npm_nip: string };
    laboratorium: { nama: string };
    details: { alat: { nama: string }; jumlah: number }[];
}

const statusOptions = [
    { value: '', label: 'Semua' },
    ...Object.entries(statusMap).map(([value, item]) => ({ value, label: item.label })),
];

export default function Index() {
    const { items, filters } = usePage().props as any;
    const loading = usePageLoading();
    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');
    const [rejectId, setRejectId] = useState<number | null>(null);
    const [alasan, setAlasan] = useState('');

    useEffect(() => {
        const t = setTimeout(() => {
            router.get('/dashboard/kepala-lab/peminjaman', { search, status }, { preserveState: true, preserveScroll: true });
        }, 400);
        return () => clearTimeout(t);
    }, [search, status]);

    const approve = (p: Peminjaman) => router.post(`/dashboard/kepala-lab/peminjaman/${p.id}/approve`, {}, { preserveScroll: true });

    const submitReject = (p: Peminjaman) => {
        if (!alasan) return;
        router.post(`/dashboard/kepala-lab/peminjaman/${p.id}/reject`, { alasan_penolakan: alasan }, { preserveScroll: true });
    };

    const columns = [
        { header: 'Kode', accessor: 'kode' as keyof Peminjaman },
        { header: 'Mahasiswa', accessor: (row: Peminjaman) => `${row.user.nama_lengkap} (${row.user.npm_nip})` },
        { header: 'Lab', accessor: (row: Peminjaman) => row.laboratorium.nama },
        { header: 'Tanggal', accessor: (row: Peminjaman) => `${formatDate(row.tanggal_mulai)} s/d ${formatDate(row.tanggal_selesai)}` },
        {
            header: 'Status',
            accessor: (row: Peminjaman) => {
                const s = statusMap[row.status] ?? { label: row.status, variant: 'neutral' };
                return <Badge variant={s.variant}>{s.label}</Badge>;
            },
        },
        { header: 'Alat', accessor: (row: Peminjaman) => row.details.map((d) => `${d.alat.nama} (${d.jumlah})`).join(', ') },
        {
            header: 'Aksi',
            accessor: (row: Peminjaman) => (
                <div className="flex flex-wrap items-center justify-end gap-2">
                    <Tooltip content="Lihat detail">
                        <Link href={`/dashboard/kepala-lab/peminjaman/${row.id}`} className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Tooltip>
                    {row.status === 'menunggu_laboran' && (
                        rejectId === row.id ? (
                            <div className="flex items-center gap-2">
                                <Input value={alasan} onChange={(e) => setAlasan(e.target.value)} placeholder="Alasan" className="w-40" />
                                <Button size="sm" variant="danger" onClick={() => submitReject(row)} disabled={!alasan}>Tolak</Button>
                                <button onClick={() => { setRejectId(null); setAlasan(''); }} className="text-xs text-slate-500 hover:underline">Batal</button>
                            </div>
                        ) : (
                            <>
                                <Tooltip content="Setujui">
                                    <button onClick={() => approve(row)} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                                        <CheckCircle className="h-4 w-4" />
                                    </button>
                                </Tooltip>
                                <Tooltip content="Tolak">
                                    <button onClick={() => setRejectId(row.id)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                                        <XCircle className="h-4 w-4" />
                                    </button>
                                </Tooltip>
                            </>
                        )
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Persetujuan Peminjaman" />
            <h1 className="mb-6 text-2xl font-bold">Persetujuan Peminjaman</h1>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-md flex-1">
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari kode, mahasiswa, atau alat..."
                        leftIcon={<Search className="h-4 w-4" />}
                    />
                </div>
                <FilterChips options={statusOptions} value={status} onChange={setStatus} />
            </div>

            <DataTable<Peminjaman>
                isLoading={loading}
                columns={columns}
                data={items.data}
                keyExtractor={(row) => row.id}
                emptyText="Tidak ada peminjaman."
            />

            <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />
        </>
    );
}
