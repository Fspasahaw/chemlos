import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Plus, Search, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePageLoading } from '../../../../Hooks/usePageLoading';
import { Badge } from '../../../../Components/Badge';
import { ConfirmActionButton } from '../../../../Components/ConfirmActionButton';
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
    status: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    laboratorium: { nama: string };
    details: { alat: { nama: string }; jumlah: number }[];
}

const statusOptions = [
    { value: '', label: 'Semua' },
    ...Object.entries(statusMap).map(([value, item]) => ({ value, label: item.label })),
];



const canCancel = (status: string) => ['diajukan', 'menunggu_dosen', 'menunggu_laboran'].includes(status);

export default function Index() {
    const { items, filters } = usePage().props as any;
    const loading = usePageLoading();
    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');

    useEffect(() => {
        const t = setTimeout(() => {
            router.get('/dashboard/mahasiswa/peminjaman', { search, status }, { preserveState: true, preserveScroll: true, replace: true });
        }, 400);
        return () => clearTimeout(t);
    }, [search, status]);

    const handleCancel = (p: Peminjaman) => {
        router.post(`/dashboard/mahasiswa/peminjaman/${p.id}/cancel`, {}, { preserveScroll: true });
    };

    const columns = [
        { header: 'Kode', accessor: 'kode' as keyof Peminjaman },
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
                <div className="flex items-center justify-end gap-2">
                    <Tooltip content="Lihat detail">
                        <Link href={`/dashboard/mahasiswa/peminjaman/${row.id}`} className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Tooltip>
                    {canCancel(row.status) && (
                        <ConfirmActionButton
                            icon={<XCircle className="h-4 w-4" />}
                            label="Batalkan peminjaman"
                            description={`Yakin ingin membatalkan peminjaman ${row.kode}?`}
                            variant="danger"
                            className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            onConfirm={() => handleCancel(row)}
                        />
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Riwayat Peminjaman" />
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold">Peminjaman Saya</h1>
                <Link href="/dashboard/mahasiswa/peminjaman/baru" className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
                    <Plus className="h-4 w-4" /> Ajukan Peminjaman
                </Link>
            </div>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-md flex-1">
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari kode atau nama alat..."
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
                emptyText="Belum ada peminjaman."
            />

            <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />
        </>
    );
}
