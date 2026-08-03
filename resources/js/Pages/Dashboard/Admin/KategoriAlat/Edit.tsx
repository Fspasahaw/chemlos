import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Eye, Save } from 'lucide-react';
import { Button } from '@/Components/Button';
import { Input } from '@/Components/Input';
import { Select } from '@/Components/Select';
import { Textarea } from '@/Components/Textarea';

const statusOptions = [
    { value: 'aktif', label: 'Aktif' },
    { value: 'nonaktif', label: 'Nonaktif' },
];

export default function Edit() {
    const { item } = usePage().props as any;
    const { data, setData, put, processing, errors } = useForm({
        nama: item.nama ?? '',
        kode: item.kode ?? '',
        deskripsi: item.deskripsi ?? '',
        status: item.status ?? 'aktif',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/dashboard/admin/kategori-alat/${item.id}`);
    };

    return (
        <>
            <Head title="Edit Kategori Alat" />
            <div className="mb-6">
                <Link href="/dashboard/admin/kategori-alat" className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400">
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Link>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Edit Kategori Alat</h1>
                    <Link href={`/dashboard/admin/kategori-alat/${item.id}`}>
                        <Button size="sm" variant="neutral" leftIcon={<Eye className="h-4 w-4" />}>Lihat Detail</Button>
                    </Link>
                </div>
            </div>
            <form onSubmit={submit} className="mx-auto max-w-xl space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                <Input label="Nama *" value={data.nama} onChange={(e) => setData('nama', e.target.value)} error={errors.nama} />
                <Input label="Kode *" value={data.kode} onChange={(e) => setData('kode', e.target.value)} error={errors.kode} />
                <Select label="Status *" options={statusOptions} value={data.status} onChange={(e) => setData('status', e.target.value)} error={errors.status} />
                <Textarea label="Deskripsi" value={data.deskripsi} onChange={(e) => setData('deskripsi', e.target.value)} rows={3} error={errors.deskripsi} />
                <div className="flex justify-end">
                    <Button type="submit" isLoading={processing} leftIcon={<Save className="h-4 w-4" />}>Perbarui</Button>
                </div>
            </form>
        </>
    );
}
