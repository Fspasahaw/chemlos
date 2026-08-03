import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Mail, MessageSquare, Trash2 } from 'lucide-react';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { formatDateTime } from '@/lib/date';
import { pesanKontakStatusMap } from '@/lib/status';

export default function Show() {
    const { item } = usePage().props as any;
    const base = '/dashboard/admin/pesan-kontak';

    return (
        <>
            <Head title={`Pesan: ${item.subjek}`} />
            <div className="mb-6">
                <Link href={base} className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400">
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Link>
                <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Detail Pesan Kontak</h1>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="h-6 w-6 text-indigo-600" />
                        <div>
                            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{item.subjek}</p>
                            <p className="text-sm text-slate-500">{formatDateTime(item.created_at)}</p>
                        </div>
                    </div>
                    <Badge variant={pesanKontakStatusMap[item.status]?.variant ?? 'neutral'}>{pesanKontakStatusMap[item.status]?.label ?? item.status}</Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Nama</p>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{item.nama}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                        <a href={`mailto:${item.email}`} className="font-medium text-indigo-600 hover:underline">{item.email}</a>
                    </div>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pesan</p>
                    <p className="mt-1 whitespace-pre-wrap text-slate-900 dark:text-slate-100">{item.pesan}</p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                    {item.status !== 'dijawab' && (
                        <Button leftIcon={<CheckCircle className="h-4 w-4" />} onClick={() => router.post(`${base}/${item.id}/status`, { status: 'dijawab' }, { preserveScroll: true })}>Tandai Dijawab</Button>
                    )}
                    {item.status === 'baru' && (
                        <Button variant="neutral" leftIcon={<Mail className="h-4 w-4" />} onClick={() => router.post(`${base}/${item.id}/status`, { status: 'dibaca' }, { preserveScroll: true })}>Tandai Dibaca</Button>
                    )}
                    <a href={`mailto:${item.email}?subject=Re: ${encodeURIComponent(item.subjek)}`}>
                        <Button variant="neutral" leftIcon={<Mail className="h-4 w-4" />}>Balas via Email</Button>
                    </a>
                    <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => router.delete(`${base}/${item.id}`)}>Hapus</Button>
                </div>
            </div>
        </>
    );
}
