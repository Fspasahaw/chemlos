import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/Components/Button';
import { FileUpload } from '@/Components/FileUpload';
import { Input } from '@/Components/Input';
import { NumberStepper } from '@/Components/NumberStepper';
import { Select } from '@/Components/Select';
import { SelectSearch } from '@/Components/SelectSearch';
import { Textarea } from '@/Components/Textarea';

const jenisOptions = [
    { value: 'aplikasi', label: 'Aplikasi' },
    { value: 'alat', label: 'Alat' },
];

const sumberOptions = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'url_eksternal', label: 'URL Eksternal' },
    { value: 'upload', label: 'Upload' },
];

const statusOptions = [
    { value: 'aktif', label: 'Aktif' },
    { value: 'nonaktif', label: 'Nonaktif' },
];

export default function Edit() {
    const { item, alatOptions } = usePage().props as any;
    const { data, setData, post, processing, errors, transform } = useForm({
        judul: item.judul ?? '',
        deskripsi: item.deskripsi ?? '',
        jenis: item.jenis ?? 'aplikasi',
        alat_id: item.alat_id ? String(item.alat_id) : '',
        sumber: item.sumber ?? 'youtube',
        url: item.url ?? '',
        file: null as File | null,
        durasi: String(item.durasi ?? ''),
        status: item.status ?? 'aktif',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        transform((formData) => ({ ...formData, _method: 'PUT' }));
        post(`/dashboard/admin/video-tutorial/${item.id}`, { forceFormData: data.sumber === 'upload' && data.file !== null });
    };

    const alatOptionsList = [{ value: '', label: 'Pilih Alat' }, ...alatOptions.map((a: any) => ({ value: String(a.id), label: a.nama }))];

    return (
        <>
            <Head title="Edit Video Tutorial" />
            <div className="mb-6">
                <Link href="/dashboard/admin/video-tutorial" className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400">
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Link>
                <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Edit Video Tutorial</h1>
            </div>
            <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                <Input label="Judul *" value={data.judul} onChange={(e) => setData('judul', e.target.value)} error={errors.judul} />
                <Textarea label="Deskripsi" value={data.deskripsi} onChange={(e) => setData('deskripsi', e.target.value)} rows={3} error={errors.deskripsi} />
                <div className="grid gap-4 md:grid-cols-2">
                    <Select label="Jenis *" options={jenisOptions} value={data.jenis} onChange={(e) => setData('jenis', e.target.value as any)} error={errors.jenis} />
                    {data.jenis === 'alat' && (
                        <SelectSearch label="Alat *" options={alatOptionsList} value={data.alat_id} onChange={(v) => setData('alat_id', v)} error={errors.alat_id} />
                    )}
                </div>
                <Select label="Sumber *" options={sumberOptions} value={data.sumber} onChange={(e) => setData('sumber', e.target.value as any)} error={errors.sumber} />
                {data.sumber !== 'upload' ? (
                    <Input label="URL *" value={data.url} onChange={(e) => setData('url', e.target.value)} error={errors.url} />
                ) : (
                    <FileUpload label="File Video" accept="video/*" value={data.file ?? item.file} onChange={(file) => setData('file', file)} error={errors.file} />
                )}
                <NumberStepper min={0} label="Durasi (detik)" value={Number(data.durasi) || 0} onChange={(v) => setData('durasi', String(v))} error={errors.durasi} />
                <Select label="Status *" options={statusOptions} value={data.status} onChange={(e) => setData('status', e.target.value as any)} error={errors.status} />
                <div className="flex justify-end">
                    <Button type="submit" isLoading={processing} leftIcon={<Save className="h-4 w-4" />}>Simpan Perubahan</Button>
                </div>
            </form>
        </>
    );
}
