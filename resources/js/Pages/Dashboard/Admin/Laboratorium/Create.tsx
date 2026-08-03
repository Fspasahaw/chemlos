import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/Components/Button';
import { FileUpload } from '@/Components/FileUpload';
import { Input } from '@/Components/Input';
import { NumberStepper } from '@/Components/NumberStepper';
import { Select } from '@/Components/Select';
import { SelectSearchMulti } from '@/Components/SelectSearchMulti';

import { Textarea } from '@/Components/Textarea';
import { TimePicker } from '@/Components/TimePicker';

interface UserOption { id: number; nama_lengkap: string; email: string; }

const hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const statusOptions = [
    { value: 'aktif', label: 'Aktif' },
    { value: 'nonaktif', label: 'Nonaktif' },
];

export default function Create() {
    const { pengelola } = usePage().props as any;
    const { data, setData, post, processing, errors } = useForm({
        nama: '', kode: '', deskripsi: '', lokasi: '', gedung: '', lantai: '', ruangan: '',
        kapasitas: '', jam_buka: '08:00', jam_tutup: '17:00', hari_operasional: [] as string[],
        email: '', telepon: '', status: 'aktif', foto_utama: null as File | null,
        pengelola: [] as string[],
        pengelola_peran: [] as string[],
    });

    const toggleHari = (hari: string) => {
        setData('hari_operasional', data.hari_operasional.includes(hari) ? data.hari_operasional.filter((h) => h !== hari) : [...data.hari_operasional, hari]);
    };

    const setPengelola = (ids: string[]) => {
        const peranMap: Record<string, string> = {};
        data.pengelola.forEach((id, i) => { peranMap[id] = data.pengelola_peran[i] ?? 'laboran'; });
        setData('pengelola', ids);
        setData('pengelola_peran', ids.map((id) => peranMap[id] ?? 'laboran'));
    };

    const setPeran = (id: number, peran: string) => {
        const key = String(id);
        const index = data.pengelola.indexOf(key);
        if (index >= 0) {
            const next = [...data.pengelola_peran];
            next[index] = peran;
            setData('pengelola_peran', next);
        }
    };

    const pengelolaOptions = (pengelola as UserOption[]).map((u) => ({ value: String(u.id), label: `${u.nama_lengkap} (${u.email})` }));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dashboard/admin/laboratorium', { forceFormData: data.foto_utama !== null });
    };

    return (
        <>
            <Head title="Tambah Laboratorium" />
            <div className="mb-6">
                <Link href="/dashboard/admin/laboratorium" className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400">
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Link>
                <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Tambah Laboratorium</h1>
            </div>
            <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Nama *" value={data.nama} onChange={(e) => setData('nama', e.target.value)} error={errors.nama} />
                    <Input label="Kode *" value={data.kode} onChange={(e) => setData('kode', e.target.value)} error={errors.kode} />
                    <Input label="Lokasi *" value={data.lokasi} onChange={(e) => setData('lokasi', e.target.value)} error={errors.lokasi} />
                    <Input label="Gedung" value={data.gedung} onChange={(e) => setData('gedung', e.target.value)} error={errors.gedung} />
                    <Input label="Lantai" value={data.lantai} onChange={(e) => setData('lantai', e.target.value)} error={errors.lantai} />
                    <Input label="Ruangan" value={data.ruangan} onChange={(e) => setData('ruangan', e.target.value)} error={errors.ruangan} />
                    <NumberStepper min={0} label="Kapasitas" value={Number(data.kapasitas) || 0} onChange={(v) => setData('kapasitas', String(v))} error={errors.kapasitas} />
                    <Input type="email" label="Email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} />
                    <Input label="Telepon" value={data.telepon} onChange={(e) => setData('telepon', e.target.value)} error={errors.telepon} />
                    <Select label="Status *" options={statusOptions} value={data.status} onChange={(e) => setData('status', e.target.value)} error={errors.status} />
                    <TimePicker label="Jam Buka" value={data.jam_buka} onChange={(e) => setData('jam_buka', e.target.value)} error={errors.jam_buka} />
                    <TimePicker label="Jam Tutup" value={data.jam_tutup} onChange={(e) => setData('jam_tutup', e.target.value)} error={errors.jam_tutup} />
                </div>
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Hari Operasional</label>
                    <div className="flex flex-wrap gap-2">
                        {hariList.map((h) => (
                            <button
                                key={h}
                                type="button"
                                onClick={() => toggleHari(h)}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition ${data.hari_operasional.includes(h) ? 'bg-indigo-600 text-white' : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
                            >{h}</button>
                        ))}
                    </div>
                    {errors.hari_operasional && <p className="mt-1 text-xs text-rose-500">{errors.hari_operasional}</p>}
                </div>
                <Textarea label="Deskripsi" value={data.deskripsi} onChange={(e) => setData('deskripsi', e.target.value)} rows={3} error={errors.deskripsi} />
                <FileUpload label="Foto Utama" value={data.foto_utama} onChange={(file) => setData('foto_utama', file)} error={errors.foto_utama} />
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Pengelola</label>
                    <SelectSearchMulti
                        options={pengelolaOptions}
                        value={data.pengelola}
                        onChange={setPengelola}
                        placeholder="Cari pengelola..."
                    />
                    {data.pengelola.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {data.pengelola.map((id) => {
                                const u = (pengelola as UserOption[]).find((x) => String(x.id) === id);
                                if (!u) return null;
                                const index = data.pengelola.indexOf(id);
                                return (
                                    <div key={id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{u.nama_lengkap}</p>
                                            <p className="text-xs text-slate-500 truncate">{u.email}</p>
                                        </div>
                                        <Select
                                            options={[
                                                { value: 'laboran', label: 'Laboran' },
                                                { value: 'kepala_lab', label: 'Kepala Lab' },
                                            ]}
                                            value={data.pengelola_peran[index] ?? 'laboran'}
                                            onChange={(e) => setPeran(u.id, e.target.value)}
                                            className="w-40 shrink-0"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="flex justify-end">
                    <Button type="submit" isLoading={processing} leftIcon={<Save className="h-4 w-4" />}>Simpan</Button>
                </div>
            </form>
        </>
    );
}
