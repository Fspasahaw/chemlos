import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, Save } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/Components/Button';
import { Checkbox } from '@/Components/Checkbox';
import { Input } from '@/Components/Input';
import { Select } from '@/Components/Select';

interface ProgramStudi { id: number; nama: string; jenjang: string; }
interface Lab { id: number; nama: string; }

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
    { value: 'rejected', label: 'Ditolak' },
    { value: 'suspended', label: 'Dinonaktifkan' },
];

export default function Edit() {
    const { item, roles, programStudi, labs } = usePage().props as any;
    const currentRoles = (item.roles ?? []).map((r: { name: string }) => r.name);
    const { data, setData, put, processing, errors } = useForm({
        nama_lengkap: item.nama_lengkap ?? '',
        email: item.email ?? '',
        npm_nip: item.npm_nip ?? '',
        password: '',
        roles: currentRoles,
        program_studi_id: String(item.program_studi_id ?? ''),
        laboratorium_id: String(item.laboratorium_pengelolas?.[0]?.laboratorium_id ?? ''),
        jabatan_pimpinan: item.jabatan_pimpinan ?? '',
        status: item.status ?? 'approved',
    });
    const [showPassword, setShowPassword] = useState(false);

    const toggleRole = (role: string) => {
        setData('roles', data.roles.includes(role) ? data.roles.filter((r: string) => r !== role) : [...data.roles, role]);
    };

    const needsLab = data.roles.some((r: string) => ['laboran', 'kepala_lab'].includes(r));
    const needsJabatan = data.roles.includes('pimpinan');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/dashboard/admin/users/${item.id}`);
    };

    const programOptions = [{ value: '', label: '- Pilih -' }, ...programStudi.map((p: ProgramStudi) => ({ value: String(p.id), label: `${p.nama} (${p.jenjang})` }))];
    const labOptions = [{ value: '', label: '- Pilih -' }, ...labs.map((l: Lab) => ({ value: String(l.id), label: l.nama }))];

    return (
        <>
            <Head title="Edit Pengguna" />
            <div className="mb-6">
                <Link href="/dashboard/admin/users" className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400">
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Link>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Edit Pengguna</h1>
                    <Link href={`/dashboard/admin/users/${item.id}`}>
                        <Button size="sm" variant="neutral" leftIcon={<Eye className="h-4 w-4" />}>Lihat Detail</Button>
                    </Link>
                </div>
            </div>
            <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Nama Lengkap *" value={data.nama_lengkap} onChange={(e) => setData('nama_lengkap', e.target.value)} error={errors.nama_lengkap} />
                    <Input label="NPM/NIP *" value={data.npm_nip} onChange={(e) => setData('npm_nip', e.target.value)} error={errors.npm_nip} />
                </div>
                <Input type="email" label="Email *" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} />
                <Input
                    type={showPassword ? 'text' : 'password'}
                    label="Password (kosongkan jika tidak diubah)"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    rightIcon={
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-indigo-600">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    }
                />
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Peran *</label>
                    <div className="grid gap-2 sm:grid-cols-2">
                        {(roles as string[]).map((r) => (
                            <div key={r} className="rounded-xl border border-slate-200/80 p-3 dark:border-slate-800/80">
                                <Checkbox
                                    id={`role-${r}`}
                                    label={<span className="text-sm font-medium capitalize">{r.replace(/_/g, ' ')}</span>}
                                    checked={data.roles.includes(r)}
                                    onChange={() => toggleRole(r)}
                                />
                            </div>
                        ))}
                    </div>
                    {errors.roles && <p className="mt-1 text-xs text-rose-500">{errors.roles}</p>}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Select label="Program Studi" options={programOptions} value={data.program_studi_id} onChange={(e) => setData('program_studi_id', e.target.value)} error={errors.program_studi_id} />
                    {needsLab && <Select label="Laboratorium" options={labOptions} value={data.laboratorium_id} onChange={(e) => setData('laboratorium_id', e.target.value)} error={errors.laboratorium_id} />}
                    {needsJabatan && <Select label="Jabatan Pimpinan" options={jabatanOptions} value={data.jabatan_pimpinan} onChange={(e) => setData('jabatan_pimpinan', e.target.value)} error={errors.jabatan_pimpinan} />}
                    <Select label="Status" options={statusOptions} value={data.status} onChange={(e) => setData('status', e.target.value)} error={errors.status} />
                </div>
                <div className="flex justify-end">
                    <Button type="submit" isLoading={processing} leftIcon={<Save className="h-4 w-4" />}>Perbarui</Button>
                </div>
            </form>
        </>
    );
}
