import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckCircle, Eye, Search, XCircle } from 'lucide-react';
import { useState } from 'react';
import { usePageLoading } from '../../../../Hooks/usePageLoading';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { ConfirmDeleteButton } from '@/Components/ConfirmDeleteButton';
import { DataTable } from '@/Components/DataTable';
import { DatePicker } from '@/Components/DatePicker';
import { FilterChips } from '@/Components/FilterChips';
import { Input } from '@/Components/Input';
import { Pagination } from '@/Components/Pagination';
import { Select } from '@/Components/Select';
import { Textarea } from '@/Components/Textarea';
import { formatDate } from '../../../../lib/date';
import { statusPeminjamanMap as statusMap } from '../../../../lib/status';

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
    const { items, filters, labs } = usePage().props as any;
    const loading = usePageLoading();
    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');
    const [lab, setLab] = useState(filters?.laboratorium ?? '');
    const [start, setStart] = useState(filters?.start ?? '');
    const [end, setEnd] = useState(filters?.end ?? '');
    const [rejectId, setRejectId] = useState<number | null>(null);
    const [alasan, setAlasan] = useState('');
    const base = '/dashboard/admin/peminjaman';

    const cari = () => router.get(base, { search, status, laboratorium: lab, start, end }, { preserveState: true });

    const labOptions = [
        { value: '', label: 'Semua Lab' },
        ...Object.entries((labs ?? {}) as Record<string, string>).map(([id, nama]) => ({ value: id, label: nama })),
    ];

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
                        <Button size="sm" leftIcon={<CheckCircle className="h-4 w-4" />} onClick={() => router.post(`${base}/${p.id}/approve`, {}, { preserveScroll: true })}>Setuju</Button>
                    )}
                    {rejectId === p.id ? (
                        <div className="flex items-center gap-2">
                            <Textarea value={alasan} onChange={(e) => setAlasan(e.target.value)} placeholder="Alasan" className="h-10 w-40 resize-none" />
                            <Button size="sm" variant="danger" onClick={() => { if (alasan) router.post(`${base}/${p.id}/reject`, { alasan_penolakan: alasan }, { preserveScroll: true }); }}>Tolak</Button>
                        </div>
                    ) : (
                        ['diajukan', 'menunggu_dosen', 'menunggu_laboran'].includes(p.status) && (
                            <Button size="sm" variant="danger" leftIcon={<XCircle className="h-4 w-4" />} onClick={() => setRejectId(p.id)}>Tolak</Button>
                        )
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

    return (
        <>
            <Head title="Manajemen Peminjaman" />
            <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Manajemen Peminjaman</h1>
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end flex-wrap">
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && cari()} placeholder="Cari kode/peminjam/alat..." leftIcon={<Search className="h-4 w-4" />} className="max-w-sm" />
                    <Select options={labOptions} value={lab} onChange={(e) => { setLab(e.target.value); cari(); }} className="max-w-xs" />
                    <DatePicker value={start} onChange={(e) => setStart(e.target.value)} placeholder="Mulai" className="max-w-[180px]" />
                    <DatePicker value={end} onChange={(e) => setEnd(e.target.value)} placeholder="Selesai" className="max-w-[180px]" />
                    <Button onClick={cari} size="md">Cari</Button>
                </div>
                <FilterChips options={statusOptions} value={status} onChange={(v) => { setStatus(v as string); router.get(base, { search, status: v, laboratorium: lab, start, end }, { preserveState: true }); }} />
            </div>
            <DataTable isLoading={loading} columns={columns} data={items.data as Peminjaman[]} keyExtractor={(p) => p.id} emptyText="Tidak ada data peminjaman." />
            <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />
        </>
    );
}
