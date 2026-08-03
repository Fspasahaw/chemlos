import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CheckCircle, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../../../../Components/Button';
import { DateTimePicker } from '../../../../Components/DateTimePicker';
import { FileUpload } from '../../../../Components/FileUpload';
import { Input } from '../../../../Components/Input';
import { Pagination } from '../../../../Components/Pagination';
import { Select } from '../../../../Components/Select';
import { Tooltip } from '../../../../Components/Tooltip';
import { formatDate } from '../../../../lib/date';

interface Peminjaman {
    id: number;
    kode: string;
    user: { nama_lengkap: string; npm_nip?: string };
    laboratorium: { nama: string };
    tanggal_mulai: string;
    tanggal_selesai: string;
    details: { id: number; alat: { nama: string; kode: string }; jumlah: number }[];
}

interface DetailForm {
    kondisi_serah_terima: string;
    catatan_serah_terima: string;
}

interface FormData {
    waktu_serah_terima: string;
    kondisi_umum: string;
    foto_bukti: File | null;
    detail: Record<number, DetailForm>;
}

const kondisiOptions = [
    { value: 'baik', label: 'Baik' },
    { value: 'rusak_ringan', label: 'Rusak Ringan' },
    { value: 'rusak_berat', label: 'Rusak Berat' },
    { value: 'hilang', label: 'Hilang' },
];

const defaultWaktu = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
};

export default function Index() {
    const { items } = usePage().props as any;
    const [active, setActive] = useState<number | null>(null);

    const form = useForm<FormData>({
        waktu_serah_terima: defaultWaktu(),
        kondisi_umum: '',
        foto_bukti: null,
        detail: {},
    });

    const activeItem = items.data.find((p: Peminjaman) => p.id === active);

    useEffect(() => {
        if (activeItem) {
            const detail: Record<number, DetailForm> = {};
            activeItem.details.forEach((d: Peminjaman['details'][0]) => {
                detail[d.id] = { kondisi_serah_terima: 'baik', catatan_serah_terima: '' };
            });
            form.setData({ waktu_serah_terima: defaultWaktu(), kondisi_umum: '', foto_bukti: null, detail });
        }
    }, [active]);

    const setDetail = (id: number, field: keyof DetailForm, val: string) => {
        form.setData('detail', { ...form.data.detail, [id]: { ...form.data.detail[id], [field]: val } });
    };

    const submit = (id: number) => {
        form.post(`/dashboard/laboran/serah-terima/${id}`, { forceFormData: true, preserveScroll: true });
    };

    return (
        <>
            <Head title="Serah Terima" />
            <h1 className="mb-6 text-2xl font-bold">Serah Terima Alat</h1>
            {items.data.length === 0 ? <p className="text-center text-slate-500 dark:text-slate-400">Tidak ada peminjaman siap serah terima.</p> : items.data.map((p: Peminjaman) => (
                <div key={p.id} className="mb-4 rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900">
                    <div className="mb-3 flex items-start justify-between">
                        <div>
                            <p className="font-semibold">{p.kode}</p>
                            <p className="text-sm text-slate-500">{p.user.nama_lengkap} {p.user.npm_nip ? `(${p.user.npm_nip})` : ''} &bull; {p.laboratorium.nama}</p>
                            <p className="text-sm text-slate-500">{formatDate(p.tanggal_mulai)} s/d {formatDate(p.tanggal_selesai)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Tooltip content="Lihat detail">
                                <Link href={`/dashboard/laboran/peminjaman/${p.id}`} className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                                    <Eye className="h-4 w-4" />
                                </Link>
                            </Tooltip>
                            <Button size="sm" variant="primary" onClick={() => setActive(active === p.id ? null : p.id)}>{active === p.id ? 'Tutup' : 'Proses'}</Button>
                        </div>
                    </div>
                    {active === p.id && (
                        <div className="space-y-3">
                            {p.details.map((d) => (
                                <div key={d.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                                    <p className="text-sm font-medium">{d.alat.nama} <span className="text-slate-500">({d.alat.kode})</span> x {d.jumlah}</p>
                                    <div className="mt-2 grid gap-3 md:grid-cols-2">
                                        <Select
                                            label="Kondisi Serah Terima"
                                            options={kondisiOptions}
                                            value={form.data.detail[d.id]?.kondisi_serah_terima ?? 'baik'}
                                            onChange={(e) => setDetail(d.id, 'kondisi_serah_terima', e.target.value)}
                                        />
                                        <Input
                                            label="Catatan"
                                            value={form.data.detail[d.id]?.catatan_serah_terima ?? ''}
                                            onChange={(e) => setDetail(d.id, 'catatan_serah_terima', e.target.value)}
                                            placeholder="Catatan kondisi"
                                        />
                                    </div>
                                </div>
                            ))}
                            <DateTimePicker
                                label="Waktu Serah Terima"
                                value={form.data.waktu_serah_terima}
                                onChange={(e) => form.setData('waktu_serah_terima', e.target.value)}
                            />
                            <Input
                                label="Kondisi Umum"
                                value={form.data.kondisi_umum}
                                onChange={(e) => form.setData('kondisi_umum', e.target.value)}
                                placeholder="Kondisi umum saat serah terima"
                            />
                            <FileUpload
                                accept="image/*"
                                value={form.data.foto_bukti}
                                onChange={(file) => form.setData('foto_bukti', file)}
                                label="Foto bukti serah terima (opsional)"
                            />
                            {form.errors.foto_bukti && <p className="text-sm text-red-500">{form.errors.foto_bukti}</p>}
                            <Button isLoading={form.processing} leftIcon={<CheckCircle className="h-4 w-4" />} onClick={() => submit(p.id)} className="w-full">Selesai Serah Terima</Button>
                        </div>
                    )}
                </div>
            ))}
            <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />
        </>
    );
}
