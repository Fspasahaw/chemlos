import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/Components/Button';
import { Input } from '@/Components/Input';
import { Select } from '@/Components/Select';
import { Textarea } from '@/Components/Textarea';

const jenjangOptions = [
    { value: 'D3', label: 'D3' },
    { value: 'S1', label: 'S1' },
    { value: 'S2', label: 'S2' },
    { value: 'S3', label: 'S3' },
    { value: 'Profesi', label: 'Profesi' },
];

const statusOptions = [
    { value: 'aktif', label: 'Aktif' },
    { value: 'nonaktif', label: 'Nonaktif' },
];

export default function Edit() {
    const { item } = usePage().props as any;
    const { data, setData, put, processing, errors } = useForm({
        nama: item.nama,
        jenjang: item.jenjang,
        kode: item.kode,
        status: item.status,
        deskripsi: item.deskripsi ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/dashboard/pimpinan/program-studi/${item.id}`);
    };

    return (
        <>
            <Head title="Edit Program Studi" />
            <div className="mb-6">
                <Link href="/dashboard/pimpinan/program-studi" className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400">
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Link>
                <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Edit Program Studi</h1>
            </div>

            <form onSubmit={submit} className="mx-auto max-w-2xl rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                <div className="space-y-4">
                    <Input label="Nama *" value={data.nama} onChange={(e) => setData('nama', e.target.value)} error={errors.nama} />
                    <div className="grid gap-4 md:grid-cols-2">
                        <Select label="Jenjang *" options={jenjangOptions} value={data.jenjang} onChange={(e) => setData('jenjang', e.target.value)} error={errors.jenjang} />
                        <Select label="Status *" options={statusOptions} value={data.status} onChange={(e) => setData('status', e.target.value)} error={errors.status} />
                    </div>
                    <Input label="Kode *" value={data.kode} onChange={(e) => setData('kode', e.target.value)} error={errors.kode} />
                    <Textarea label="Deskripsi" value={data.deskripsi} onChange={(e) => setData('deskripsi', e.target.value)} rows={4} error={errors.deskripsi} />
                </div>
                <div className="mt-6 flex justify-end">
                    <Button type="submit" isLoading={processing} leftIcon={<Save className="h-4 w-4" />}>Perbarui</Button>
                </div>
            </form>
        </>
    );
}
