import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, GraduationCap, Mail, Pencil, Users } from 'lucide-react';
import { usePageLoading } from '../../../../Hooks/usePageLoading';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { DataTable } from '@/Components/DataTable';
import { programStudiStatusMap } from '@/lib/status';

interface User {
    id: number;
    nama_lengkap: string;
    email: string;
    npm_nip: string;
    roles: { name: string }[];
}

export default function Show() {
    const { item } = usePage().props as any;
    const loading = usePageLoading();
    const users = (item.users ?? []) as User[];

    const columns = [
        { header: 'Nama', accessor: 'nama_lengkap' as keyof User },
        { header: 'Email', accessor: 'email' as keyof User },
        { header: 'NPM/NIP', accessor: 'npm_nip' as keyof User },
        { header: 'Peran', accessor: (row: User) => row.roles.map((r) => r.name).join(', ') || '-' },
    ];

    return (
        <>
            <Head title={`Program Studi: ${item.nama}`} />
            <div className="mb-6">
                <Link href="/dashboard/admin/program-studi" className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400">
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Link>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Detail Program Studi</h1>
                    <Link href={`/dashboard/admin/program-studi/${item.id}/edit`}>
                        <Button size="sm" leftIcon={<Pencil className="h-4 w-4" />}>Edit</Button>
                    </Link>
                </div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300">
                        <GraduationCap className="h-7 w-7" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{item.nama}</h2>
                        <p className="text-sm text-slate-500">{item.kode} • {item.jenjang}</p>
                        <Badge variant={programStudiStatusMap[item.status]?.variant ?? 'neutral'} className="mt-1">{programStudiStatusMap[item.status]?.label ?? item.status}</Badge>
                    </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <InfoItem icon={<Mail className="h-5 w-5 text-slate-400" />} label="Deskripsi" value={item.deskripsi || '-'} />
                    <InfoItem icon={<Users className="h-5 w-5 text-slate-400" />} label="Jumlah Mahasiswa" value={String(users.length)} />
                </div>
                <div className="mt-8">
                    <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Daftar Mahasiswa</h3>
                    <DataTable isLoading={loading} columns={columns} data={users} keyExtractor={(row) => row.id} emptyText="Belum ada mahasiswa terdaftar untuk program studi ini." />
                </div>
            </div>
        </>
    );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3">
            {icon}
            <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{value}</p>
            </div>
        </div>
    );
}
