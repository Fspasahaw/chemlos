import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, Save } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/Components/Button';
import { Input } from '@/Components/Input';
import { Select } from '@/Components/Select';

interface ProgramStudi { id: number; nama: string; jenjang: string; }

const roleOptions = [
    { value: 'mahasiswa', label: 'Mahasiswa' },
    { value: 'dosen', label: 'Dosen' },
];

export default function Edit() {
    const { item, programStudi } = usePage().props as any;
    const roleName = item.roles?.[0]?.name ?? '';
    const { data, setData, put, processing, errors } = useForm({
        nama_lengkap: item.nama_lengkap ?? '',
        npm_nip: item.npm_nip ?? '',
        email: item.email ?? '',
        password: '',
        role: roleName,
        program_studi_id: item.program_studi_id ? String(item.program_studi_id) : '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const isMahasiswa = data.role === 'mahasiswa';

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/dashboard/laboran/pengguna/${item.id}`);
    };

    const programOptions = [{ value: '', label: '- Pilih Program Studi -' }, ...programStudi.map((p: ProgramStudi) => ({ value: String(p.id), label: `${p.nama} (${p.jenjang})` }))];

    return (
        <>
            <Head title="Edit Pengguna" />
            <div className="mb-6">
                <Link href="/dashboard/laboran/pengguna" className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400">
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Link>
                <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Edit Pengguna</h1>
            </div>

            <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Nama Lengkap *" value={data.nama_lengkap} onChange={(e) => setData('nama_lengkap', e.target.value)} error={errors.nama_lengkap} />
                    <Input label="NPM/NIP *" value={data.npm_nip} onChange={(e) => setData('npm_nip', e.target.value)} error={errors.npm_nip} />
                </div>

                <Select
                    label="Peran *"
                    options={roleOptions}
                    value={data.role}
                    onChange={(e) => setData('role', e.target.value)}
                    error={errors.role}
                />

                {isMahasiswa && (
                    <Select
                        label="Program Studi *"
                        options={programOptions}
                        value={data.program_studi_id}
                        onChange={(e) => setData('program_studi_id', e.target.value)}
                        error={errors.program_studi_id}
                    />
                )}

                <Input
                    type="email"
                    label="Email *"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                />

                <Input
                    type={showPassword ? 'text' : 'password'}
                    label="Password Baru"
                    hint="Kosongkan jika tidak ingin mengubah password."
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    rightIcon={
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-indigo-600" aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    }
                />

                <div className="flex justify-end gap-3">
                    <Link href="/dashboard/laboran/pengguna">
                        <Button type="button" variant="secondary">Batal</Button>
                    </Link>
                    <Button type="submit" isLoading={processing} leftIcon={<Save className="h-4 w-4" />}>Simpan Perubahan</Button>
                </div>
            </form>
        </>
    );
}
