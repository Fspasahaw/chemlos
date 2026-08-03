import { Head, useForm, usePage } from '@inertiajs/react';
import { CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePageLoading } from '../../../../Hooks/usePageLoading';
import { Button } from '@/Components/Button';
import { DataTable } from '@/Components/DataTable';
import { DateTimePicker } from '@/Components/DateTimePicker';
import { FileUpload } from '@/Components/FileUpload';
import { Input } from '@/Components/Input';
import { Pagination } from '@/Components/Pagination';
import { Select } from '@/Components/Select';
import { Textarea } from '@/Components/Textarea';
import { formatDate } from '../../../../lib/date';

interface Peminjaman {
    id: number;
    kode: string;
    user: { nama_lengkap: string };
    laboratorium: { nama: string };
    tanggal_mulai: string;
    tanggal_selesai: string;
    details: { id: number; alat: { nama: string }; jumlah: number }[];
}

interface DetailForm {
    kondisi_serah_terima: string;
    catatan_serah_terima: string;
}

const kondisiOptions = [
    { value: 'baik', label: 'Baik' },
    { value: 'rusak_ringan', label: 'Rusak Ringan' },
    { value: 'rusak_berat', label: 'Rusak Berat' },
    { value: 'hilang', label: 'Hilang' },
];

export default function Index() {
    const { items } = usePage().props as any;
    const loading = usePageLoading();
    const [active, setActive] = useState<number | null>(null);

    const form = useForm({
        waktu_serah_terima: new Date().toISOString().slice(0, 16),
        kondisi_umum: '',
        foto_bukti: null as File | null,
        detail: {} as Record<number, DetailForm>,
    });

    const activeItem = items.data.find((p: Peminjaman) => p.id === active);

    useEffect(() => {
        if (activeItem) {
            const detail: Record<number, DetailForm> = {};
            activeItem.details.forEach((d: Peminjaman['details'][0]) => {
                detail[d.id] = { kondisi_serah_terima: 'baik', catatan_serah_terima: '' };
            });
            form.setData({ waktu_serah_terima: new Date().toISOString().slice(0, 16), kondisi_umum: '', foto_bukti: null, detail });
        }
    }, [active]);

    const setDetail = (id: number, field: keyof DetailForm, val: string) => {
        form.setData('detail', { ...form.data.detail, [id]: { ...form.data.detail[id], [field]: val } });
    };

    const submit = (id: number) => {
        form.post(`/dashboard/admin/serah-terima/${id}`, { forceFormData: true, preserveScroll: true });
    };

    const columns = [
        { header: 'Kode', accessor: 'kode' as keyof Peminjaman },
        { header: 'Peminjam', accessor: (p: Peminjaman) => p.user.nama_lengkap },
        { header: 'Laboratorium', accessor: (p: Peminjaman) => p.laboratorium.nama },
        { header: 'Periode', accessor: (p: Peminjaman) => `${formatDate(p.tanggal_mulai)} s/d ${formatDate(p.tanggal_selesai)}` },
        {
            header: 'Aksi',
            accessor: (p: Peminjaman) => (
                <Button size="sm" onClick={() => setActive(active === p.id ? null : p.id)}>{active === p.id ? 'Tutup' : 'Proses'}</Button>
            ),
            className: 'text-right',
        },
    ];

    return (
        <>
            <Head title="Serah Terima" />
            <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Serah Terima Alat</h1>
            {activeItem && (
                <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900">
                    <p className="mb-2 font-semibold">{activeItem.kode} &bull; {activeItem.user.nama_lengkap}</p>
                    <div className="space-y-3">
                        {activeItem.details.map((d: Peminjaman['details'][0]) => (
                            <div key={d.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                                <p className="text-sm font-medium">{d.alat.nama} x {d.jumlah}</p>
                                <div className="mt-2 grid gap-3 md:grid-cols-2">
                                    <Select options={kondisiOptions} value={form.data.detail[d.id]?.kondisi_serah_terima ?? 'baik'} onChange={(e) => setDetail(d.id, 'kondisi_serah_terima', e.target.value)} />
                                    <Input placeholder="Catatan" value={form.data.detail[d.id]?.catatan_serah_terima ?? ''} onChange={(e) => setDetail(d.id, 'catatan_serah_terima', e.target.value)} />
                                </div>
                            </div>
                        ))}
                        <DateTimePicker label="Waktu Serah Terima" value={form.data.waktu_serah_terima} onChange={(e) => form.setData('waktu_serah_terima', e.target.value)} />
                        <Textarea placeholder="Kondisi umum" value={form.data.kondisi_umum} onChange={(e) => form.setData('kondisi_umum', e.target.value)} rows={2} />
                        <FileUpload accept="image/*" value={form.data.foto_bukti} onChange={(file) => form.setData('foto_bukti', file)} />
                        {form.errors.foto_bukti && <p className="text-sm text-red-500">{form.errors.foto_bukti}</p>}
                        <Button isLoading={form.processing} leftIcon={<CheckCircle className="h-4 w-4" />} onClick={() => submit(activeItem.id)} className="w-full">Selesai Serah Terima</Button>
                    </div>
                </div>
            )}
            <DataTable isLoading={loading} columns={columns} data={items.data as Peminjaman[]} keyExtractor={(p) => p.id} emptyText="Tidak ada peminjaman siap serah terima." />
            <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />
        </>
    );
}
