import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/Components/Button';
import { Input } from '@/Components/Input';
import { Select } from '@/Components/Select';
import { SelectSearchMulti } from '@/Components/SelectSearchMulti';

interface ProgramStudi { id: number; nama: string; jenjang: string; }

const jabatanOptions = [
    { value: '', label: '- Pilih -' },
    { value: 'kepala_departemen', label: 'Kepala Departemen' },
    { value: 'sekretaris_departemen', label: 'Sekretaris Departemen' },
    { value: 'ketua_program_studi', label: 'Ketua Program Studi' },
    { value: 'koordinator_k3l', label: 'Koordinator K3L' },
];

const statusOptions = [
    { value: 'pending_email', label: 'Belum Verifikasi Email' },
    { value: 'pending_approval', label: 'Menunggu Persetujuan' },
    { value: 'approved', label: 'Aktif' },
    { value: 'suspended', label: 'Dinonaktifkan' },
];

export default function Create() {
    const { roles, programStudi } = usePage().props as any;
    const { data, setData, post, processing, errors } = useForm({
        nama_lengkap: '',
        email: '',
        npm_nip: '',
        password: '',
        roles: [] as string[],
        program_studi_id: '',
        jabatan_pimpinan: '',
        status: 'approved',
    });
    const [showPassword, setShowPassword] = useState(false);

    const needsJabatan = data.roles.includes('pimpinan');
    const needsProgramStudi = data.roles.includes('mahasiswa') || (data.roles.includes('pimpinan') && data.jabatan_pimpinan === 'ketua_program_studi');

    useEffect(() => {
        if (! needsProgramStudi) {
            setData('program_studi_id', '');
        }
    }, [needsProgramStudi]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dashboard/admin/users');
    };

    const programOptions = [{ value: '', label: '- Pilih -' }, ...programStudi.map((p: ProgramStudi) => ({ value: String(p.id), label: `${p.nama} (${p.jenjang})` }))];

    return (
        <>
            <Head title="Tambah Pengguna" />
            <div className="mb-6">
                <Link href="/dashboard/admin/users" className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400">
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Link>
                <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Tambah Pengguna</h1>
            </div>
            <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Nama Lengkap *" value={data.nama_lengkap} onChange={(e) => setData('nama_lengkap', e.target.value)} error={errors.nama_lengkap} />
                    <Input label="NPM/NIP *" value={data.npm_nip} onChange={(e) => setData('npm_nip', e.target.value)} error={errors.npm_nip} />
                </div>
                <Input type="email" label="Email *" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} />
                <Input
                    type={showPassword ? 'text' : 'password'}
                    label="Password *"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    rightIcon={
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-indigo-600">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    }
                />
                <SelectSearchMulti
                    label="Peran *"
                    options={roles.map((r: string) => ({ value: r, label: r.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) }))}
                    value={data.roles}
                    onChange={(values) => setData('roles', values)}
                    placeholder="Pilih peran..."
                    error={errors.roles}
                />
                <div className="grid gap-4 md:grid-cols-2">
                    {needsJabatan && <Select label="Jabatan Pimpinan" options={jabatanOptions} value={data.jabatan_pimpinan} onChange={(e) => setData('jabatan_pimpinan', e.target.value)} error={errors.jabatan_pimpinan} />}
                    {needsProgramStudi && <Select label="Program Studi *" options={programOptions} value={data.program_studi_id} onChange={(e) => setData('program_studi_id', e.target.value)} error={errors.program_studi_id} />}
                    <Select label="Status" options={statusOptions} value={data.status} onChange={(e) => setData('status', e.target.value)} error={errors.status} />
                </div>
                <div className="flex justify-end">
                    <Button type="submit" isLoading={processing} leftIcon={<Save className="h-4 w-4" />}>Simpan</Button>
                </div>
            </form>
        </>
    );
}
