import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, Save, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/Components/Button';
import { FileUpload } from '@/Components/FileUpload';
import { Input } from '@/Components/Input';
import { NumberStepper } from '@/Components/NumberStepper';
import { Select } from '@/Components/Select';
import { SelectSearch } from '@/Components/SelectSearch';
import { Switch } from '@/Components/Switch';
import { Textarea } from '@/Components/Textarea';

interface Option { id: number; nama: string; }

const kondisiOptions = [
    { value: 'baik', label: 'Baik' },
    { value: 'rusak_ringan', label: 'Rusak Ringan' },
    { value: 'rusak_berat', label: 'Rusak Berat' },
    { value: 'hilang', label: 'Hilang' },
];

export default function Create() {
    const { labs, kategoris, base = '/dashboard/laboran/alat' } = usePage().props as any;
    const onlyLab = Array.isArray(labs) && labs.length === 1 ? labs[0] : null;
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        nama: '', kode: '', laboratorium_id: onlyLab ? String(onlyLab.id) : '', kategori_id: '', deskripsi: '', kondisi: 'baik',
        stok_total: '1', persyaratan_khusus: '', pelatihan_wajib: false as boolean,
        foto_utama: null as File | null,
        spesifikasi: {} as Record<string, string>,
    });

    const [specKey, setSpecKey] = useState('');
    const [specValue, setSpecValue] = useState('');

    const addSpec = () => {
        if (!specKey || !specValue) return;
        setData('spesifikasi', { ...data.spesifikasi, [specKey]: specValue });
        setSpecKey('');
        setSpecValue('');
        clearErrors('spesifikasi');
    };

    const removeSpec = (key: string) => {
        const next = { ...data.spesifikasi };
        delete next[key];
        setData('spesifikasi', next);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(base, { forceFormData: data.foto_utama !== null });
    };

    const labOptions = [{ value: '', label: 'Pilih Laboratorium' }, ...labs.map((l: Option) => ({ value: String(l.id), label: l.nama }))];
    const kategoriOptions = [{ value: '', label: 'Pilih Kategori' }, ...kategoris.map((k: Option) => ({ value: String(k.id), label: k.nama }))];

    return (
        <>
            <Head title="Tambah Alat" />
            <div className="mb-6">
                <Link href={base} className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400">
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Link>
                <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Tambah Alat</h1>
            </div>
            <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Nama *" value={data.nama} onChange={(e) => setData('nama', e.target.value)} error={errors.nama} />
                    <Input label="Kode *" value={data.kode} onChange={(e) => setData('kode', e.target.value)} error={errors.kode} />
                    <SelectSearch label="Laboratorium *" options={labOptions} value={data.laboratorium_id} onChange={(v) => setData('laboratorium_id', v)} error={errors.laboratorium_id} disabled={labs.length <= 1} />
                    <SelectSearch label="Kategori *" options={kategoriOptions} value={data.kategori_id} onChange={(v) => setData('kategori_id', v)} error={errors.kategori_id} />
                    <Select label="Kondisi *" options={kondisiOptions} value={data.kondisi} onChange={(e) => setData('kondisi', e.target.value)} error={errors.kondisi} />
                    <NumberStepper min={0} label="Stok Total *" value={Number(data.stok_total) || 0} onChange={(v) => setData('stok_total', String(v))} error={errors.stok_total} />
                </div>
                <Textarea label="Deskripsi" value={data.deskripsi} onChange={(e) => setData('deskripsi', e.target.value)} rows={3} error={errors.deskripsi} />
                <FileUpload label="Foto Utama" value={data.foto_utama} onChange={(file) => setData('foto_utama', file)} error={errors.foto_utama} />
                <Switch checked={data.pelatihan_wajib} onChange={(v) => setData('pelatihan_wajib', v)} label="Wajib Pelatihan" />
                <Textarea label="Persyaratan Khusus" value={data.persyaratan_khusus} onChange={(e) => setData('persyaratan_khusus', e.target.value)} rows={2} error={errors.persyaratan_khusus} />
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Spesifikasi</label>
                    <div className="flex gap-2">
                        <Input placeholder="Kunci" value={specKey} onChange={(e) => setSpecKey(e.target.value)} />
                        <Input placeholder="Nilai" value={specValue} onChange={(e) => setSpecValue(e.target.value)} />
                        <Button type="button" variant="outline" size="sm" onClick={addSpec} leftIcon={<Plus className="h-4 w-4" />}>Tambah</Button>
                    </div>
                    {errors.spesifikasi && <p className="mt-1 text-xs text-rose-500">{errors.spesifikasi}</p>}
                    <div className="mt-2 flex flex-wrap gap-2">
                        {Object.entries(data.spesifikasi).map(([k, v]) => (
                            <span key={k} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300">
                                {k}: {v}
                                <button type="button" onClick={() => removeSpec(k)} className="ml-1 text-indigo-500 hover:text-rose-600"><X className="h-3 w-3" /></button>
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button type="submit" isLoading={processing} leftIcon={<Save className="h-4 w-4" />}>Simpan</Button>
                </div>
            </form>
        </>
    );
}
