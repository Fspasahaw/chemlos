import { Head, useForm, usePage } from '@inertiajs/react';
import { CheckCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { usePageLoading } from '../../../../Hooks/usePageLoading';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { DataTable } from '@/Components/DataTable';
import { DateTimePicker } from '@/Components/DateTimePicker';
import { FileUpload } from '@/Components/FileUpload';
import { Input } from '@/Components/Input';
import { Pagination } from '@/Components/Pagination';
import { Select } from '@/Components/Select';
import { Textarea } from '@/Components/Textarea';
import { formatDate, formatRupiah } from '@/lib/date';

interface Peminjaman {
    id: number;
    kode: string;
    user: { nama_lengkap: string };
    laboratorium: { nama: string };
    tanggal_mulai: string;
    tanggal_selesai: string;
    jam_selesai: string;
    details: { id: number; alat: { nama: string }; jumlah: number }[];
}

interface DetailForm {
    kondisi_pengembalian: string;
    catatan_pengembalian: string;
    denda_per_alat: string;
}

const kondisiOptions = [
    { value: 'baik', label: 'Baik' },
    { value: 'rusak_ringan', label: 'Rusak Ringan' },
    { value: 'rusak_berat', label: 'Rusak Berat' },
    { value: 'hilang', label: 'Hilang' },
];

export default function Index() {
    const { items, dendaSettings } = usePage().props as any;
    const loading = usePageLoading();
    const [active, setActive] = useState<number | null>(null);

    const form = useForm({
        waktu_pengembalian: new Date().toISOString().slice(0, 16),
        kondisi_umum: '',
        foto_bukti: null as File | null,
        detail: {} as Record<number, DetailForm>,
    });

    const activeItem = items.data.find((p: Peminjaman) => p.id === active);

    useEffect(() => {
        if (activeItem) {
            const detail: Record<number, DetailForm> = {};
            activeItem.details.forEach((d: Peminjaman['details'][0]) => {
                detail[d.id] = { kondisi_pengembalian: 'baik', catatan_pengembalian: '', denda_per_alat: '' };
            });
            form.setData({ waktu_pengembalian: new Date().toISOString().slice(0, 16), kondisi_umum: '', foto_bukti: null, detail });
        }
    }, [active]);

    const setDetail = (id: number, field: keyof DetailForm, val: string) => {
        form.setData('detail', { ...form.data.detail, [id]: { ...form.data.detail[id], [field]: val } });
    };

    const dendaPreview = useMemo(() => {
        if (!activeItem || !dendaSettings) return { keterlambatan: 0, kerusakan: 0, total: 0, terlambat: false };
        const batas = new Date(`${activeItem.tanggal_selesai}T${activeItem.jam_selesai ?? '23:59'}`);
        batas.setMinutes(batas.getMinutes() + (dendaSettings.toleransi_keterlambatan_menit || 0));
        const waktu = new Date(form.data.waktu_pengembalian);
        let keterlambatan = 0;
        let terlambat = false;
        if (waktu > batas) {
            terlambat = true;
            const menit = Math.max(0, Math.round((waktu.getTime() - batas.getTime()) / 60000));
            if (dendaSettings.denda_per_jam > 0) {
                const jam = Math.ceil(menit / 60);
                keterlambatan = jam * dendaSettings.denda_per_jam;
            } else {
                const hari = Math.ceil(menit / 1440);
                keterlambatan = hari * dendaSettings.denda_per_hari;
            }
            if (dendaSettings.maksimal_denda > 0) keterlambatan = Math.min(keterlambatan, dendaSettings.maksimal_denda);
        }
        let kerusakan = 0;
        activeItem.details.forEach((d: any) => {
            const input = form.data.detail[d.id] ?? {};
            const kondisi = input.kondisi_pengembalian ?? 'baik';
            let perAlat = 0;
            if (input.denda_per_alat !== '' && Number(input.denda_per_alat) > 0) {
                perAlat = Number(input.denda_per_alat);
            } else if (kondisi === 'rusak_ringan') perAlat = dendaSettings.denda_rusak_ringan * d.jumlah;
            else if (kondisi === 'rusak_berat') perAlat = dendaSettings.denda_rusak_berat * d.jumlah;
            else if (kondisi === 'hilang') perAlat = dendaSettings.denda_hilang * d.jumlah;
            kerusakan += perAlat;
        });
        return { keterlambatan, kerusakan, total: keterlambatan + kerusakan, terlambat };
    }, [activeItem, form.data.waktu_pengembalian, form.data.detail, dendaSettings]);

    const submit = (id: number) => {
        form.post(`/dashboard/admin/pengembalian/${id}`, { forceFormData: true, preserveScroll: true });
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
            <Head title="Pengembalian" />
            <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Pengembalian Alat</h1>
            {activeItem && (
                <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900">
                    <p className="mb-2 font-semibold">{activeItem.kode} &bull; {activeItem.user.nama_lengkap}</p>
                    <div className="space-y-3">
                        <DateTimePicker label="Waktu Pengembalian" value={form.data.waktu_pengembalian} onChange={(e) => form.setData('waktu_pengembalian', e.target.value)} />
                        {activeItem.details.map((d: Peminjaman['details'][0]) => (
                            <div key={d.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                                <p className="text-sm font-medium">{d.alat.nama} x {d.jumlah}</p>
                                <div className="mt-2 grid gap-3 md:grid-cols-3">
                                    <Select options={kondisiOptions} value={form.data.detail[d.id]?.kondisi_pengembalian ?? 'baik'} onChange={(e) => setDetail(d.id, 'kondisi_pengembalian', e.target.value)} />
                                    <Input placeholder="Catatan" value={form.data.detail[d.id]?.catatan_pengembalian ?? ''} onChange={(e) => setDetail(d.id, 'catatan_pengembalian', e.target.value)} />
                                    <Input type="number" min={0} placeholder="Denda per alat (Rp)" value={form.data.detail[d.id]?.denda_per_alat ?? ''} onChange={(e) => setDetail(d.id, 'denda_per_alat', e.target.value)} />
                                </div>
                            </div>
                        ))}
                        <Textarea placeholder="Kondisi umum / keterangan denda" value={form.data.kondisi_umum} onChange={(e) => form.setData('kondisi_umum', e.target.value)} rows={2} />
                        <FileUpload accept="image/*" value={form.data.foto_bukti} onChange={(file) => form.setData('foto_bukti', file)} />
                        {form.errors.foto_bukti && <p className="text-sm text-red-500">{form.errors.foto_bukti}</p>}

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
                            <div className="mb-2 flex items-center gap-2">
                                <span className="font-semibold text-slate-900 dark:text-slate-100">Estimasi Denda</span>
                                {dendaPreview.terlambat && <Badge variant="danger">Terlambat</Badge>}
                            </div>
                            <div className="grid gap-2 text-sm md:grid-cols-3">
                                <p className="text-slate-600 dark:text-slate-300">Keterlambatan: <span className="font-medium">{formatRupiah(dendaPreview.keterlambatan)}</span></p>
                                <p className="text-slate-600 dark:text-slate-300">Kerusakan/Hilang: <span className="font-medium">{formatRupiah(dendaPreview.kerusakan)}</span></p>
                                <p className="text-slate-900 dark:text-slate-100">Total: <span className="font-bold">{formatRupiah(dendaPreview.total)}</span></p>
                            </div>
                        </div>

                        <Button isLoading={form.processing} leftIcon={<CheckCircle className="h-4 w-4" />} onClick={() => submit(activeItem.id)} className="w-full">Selesai Pengembalian</Button>
                    </div>
                </div>
            )}
            <DataTable isLoading={loading} columns={columns} data={items.data as Peminjaman[]} keyExtractor={(p) => p.id} emptyText="Tidak ada peminjaman aktif." />
            <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />
        </>
    );
}
