import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    FileText,
    FlaskConical,
    Handshake,
    Package,
    RotateCcw,
    UserCheck,
    Wrench,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Badge } from '../../../Components/Badge';
import { Card } from '../../../Components/Card';
import { EmptyTable } from '../../../Components/EmptyTable';
import { formatDate } from '../../../lib/date';
import { kondisiAlatBadgeMap, statusPeminjamanMap as statusMap } from '../../../lib/status';

export default function Index() {
    const { auth, metrics, peminjaman_minggu_ini, distribusi_status_peminjaman, distribusi_kondisi_alat, peminjaman_menunggu, serah_terima_hari_ini, pengembalian_hari_ini, notifikasi_belum_dibaca } = usePage().props as any;
    const mingguRef = useRef<HTMLCanvasElement>(null);
    const statusRef = useRef<HTMLCanvasElement>(null);
    const kondisiRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const charts: Chart[] = [];
        if (mingguRef.current) {
            charts.push(new Chart(mingguRef.current, {
                type: 'bar',
                data: {
                    labels: peminjaman_minggu_ini.map((r: any) => formatDate(r.tanggal)),
                    datasets: [{ label: 'Peminjaman', data: peminjaman_minggu_ini.map((r: any) => r.total), backgroundColor: '#6366f1', borderRadius: 6 }],
                },
                options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
            }));
        }
        if (statusRef.current) {
            charts.push(new Chart(statusRef.current, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(distribusi_status_peminjaman).map((s) => statusMap[s]?.label ?? s),
                    datasets: [{ data: Object.values(distribusi_status_peminjaman), backgroundColor: ['#f59e0b', '#6366f1', '#10b981', '#f43f5e', '#94a3b8', '#06b6d4', '#84cc16'] }],
                },
                options: { responsive: true, plugins: { legend: { position: 'right' } } },
            }));
        }
        if (kondisiRef.current) {
            charts.push(new Chart(kondisiRef.current, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(distribusi_kondisi_alat).map((s) => kondisiAlatBadgeMap[s]?.label ?? s),
                    datasets: [{ data: Object.values(distribusi_kondisi_alat), backgroundColor: ['#10b981', '#f59e0b', '#f43f5e', '#94a3b8'] }],
                },
                options: { responsive: true, plugins: { legend: { position: 'right' } } },
            }));
        }
        return () => charts.forEach((c) => c.destroy());
    }, [peminjaman_minggu_ini, distribusi_status_peminjaman, distribusi_kondisi_alat]);

    const metricCards = [
        { label: 'Peminjaman Menunggu', value: metrics.peminjaman_menunggu, icon: Clock, color: 'bg-amber-50 text-amber-600', href: '/dashboard/laboran/peminjaman' },
        { label: 'Serah Terima Hari Ini', value: metrics.serah_terima_hari_ini, icon: Handshake, color: 'bg-indigo-50 text-indigo-600', href: '/dashboard/laboran/serah-terima' },
        { label: 'Pengembalian Hari Ini', value: metrics.pengembalian_hari_ini, icon: RotateCcw, color: 'bg-rose-50 text-rose-600', href: '/dashboard/laboran/pengembalian' },
        { label: 'Alat Tersedia Lab', value: metrics.alat_tersedia, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600', href: '/dashboard/laboran/alat' },
        { label: 'Maintenance Berlangsung', value: metrics.maintenance_berlangsung, icon: Wrench, color: 'bg-purple-50 text-purple-600', href: '/dashboard/laboran/maintenance' },
        { label: 'Akun Menunggu Persetujuan', value: metrics.akun_menunggu_persetujuan, icon: UserCheck, color: 'bg-blue-50 text-blue-600', href: '/dashboard/laboran/verifikasi-akun' },
    ];

    const quickLinks = [
        { href: '/dashboard/laboran/verifikasi-akun', icon: UserCheck, title: 'Verifikasi Akun', desc: 'Setujui/tolak akun mahasiswa & dosen' },
        { href: '/dashboard/laboran/laboratorium', icon: FlaskConical, title: 'Laboratorium', desc: 'Lihat laboratorium yang dikelola' },
        { href: '/dashboard/laboran/alat', icon: Package, title: 'Manajemen Alat', desc: 'Tambah, edit, hapus alat lab' },
        { href: '/dashboard/laboran/peminjaman', icon: Clock, title: 'Peminjaman', desc: 'Setujui/tolak pengajuan' },
        { href: '/dashboard/laboran/serah-terima', icon: Handshake, title: 'Serah Terima', desc: 'Serahkan alat ke peminjam' },
        { href: '/dashboard/laboran/pengembalian', icon: RotateCcw, title: 'Pengembalian', desc: 'Terima alat kembali' },
        { href: '/dashboard/laboran/kerusakan', icon: AlertTriangle, title: 'Kerusakan', desc: 'Lihat & tindak lanjut kerusakan' },
        { href: '/dashboard/laboran/maintenance', icon: Wrench, title: 'Maintenance', desc: 'Jadwal & status perbaikan' },
        { href: '/dashboard/laboran/pengguna', icon: UserCheck, title: 'Pengguna', desc: 'Tambah akun mahasiswa/dosen' },
        { href: '/dashboard/laboran/laporan', icon: FileText, title: 'Laporan', desc: 'Lihat & export laporan lab' },
    ];

    return (
        <>
            <Head title="Dashboard Laboran" />
            <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                <h1 className="text-2xl font-bold">Dashboard Laboran</h1>
                <p className="text-slate-500 dark:text-slate-400">Selamat datang, {auth?.user?.nama_lengkap ?? 'Laboran'}. Notifikasi belum dibaca: {notifikasi_belum_dibaca}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {metricCards.map((m) => (
                    <Link key={m.label} href={m.href} className="group">
                        <Card className="flex h-full flex-col justify-between transition duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                            <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${m.color}`}>
                                <m.icon className="h-6 w-6" />
                            </div>
                            <p className="text-2xl font-bold">{m.value}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{m.label}</p>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {quickLinks.map((q) => (
                    <Link key={q.href} href={q.href} className="group flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800/80 dark:bg-slate-900">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
                            <q.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="font-semibold">{q.title}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{q.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Card>
                    <Card.Header title="Peminjaman Minggu Ini" />
                    <canvas ref={mingguRef} height="120" />
                </Card>
                <Card>
                    <Card.Header title="Status Peminjaman Lab" />
                    <canvas ref={statusRef} height="200" />
                </Card>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Card>
                    <Card.Header title="Kondisi Alat Lab" />
                    <canvas ref={kondisiRef} height="200" />
                </Card>
                <Card>
                    <Card.Header title="Notifikasi" icon={<Clock className="h-5 w-5" />} action={<span className="text-sm text-slate-500">Belum dibaca: {notifikasi_belum_dibaca}</span>} />
                    <div className="rounded-xl border border-slate-200/80 p-6 text-center text-slate-500 dark:border-slate-800/80">
                        <p className="text-sm">Lihat notifikasi lengkap di menu <Link href="/notifikasi" className="text-indigo-600 hover:underline">Notifikasi</Link>.</p>
                    </div>
                </Card>
            </div>

            <div className="mt-6 grid gap-6">
                <Card>
                    <Card.Header title="Peminjaman Menunggu Persetujuan" />
                    <PeminjamanTable items={peminjaman_menunggu} />
                </Card>

                <Card>
                    <Card.Header title="Serah Terima Hari Ini" />
                    <PeminjamanTable items={serah_terima_hari_ini} statusFallback="disetujui" />
                </Card>

                <Card>
                    <Card.Header title="Pengembalian Hari Ini" />
                    <PeminjamanTable items={pengembalian_hari_ini} />
                </Card>
            </div>
        </>
    );
}

function PeminjamanTable({ items, statusFallback }: { items: any[]; statusFallback?: string }) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                        <th className="px-4 py-3 text-left font-semibold">Kode</th>
                        <th className="px-4 py-3 text-left font-semibold">Peminjam</th>
                        <th className="px-4 py-3 text-left font-semibold">Lab</th>
                        <th className="px-4 py-3 text-left font-semibold">Status</th>
                        <th className="px-4 py-3 text-left font-semibold">Alat</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 ? (
                        <EmptyTable colSpan={5} message="Tidak ada data." />
                    ) : items.map((p: any) => {
                        const status = p.status ?? statusFallback ?? 'neutral';
                        const st = statusMap[status] ?? { label: status, variant: 'neutral' };
                        return (
                            <tr key={p.id} className="border-t border-slate-200/80 dark:border-slate-800/80">
                                <td className="px-4 py-3 font-medium">
                                    <Link href={`/dashboard/laboran/peminjaman/${p.id}`} className="text-indigo-600 hover:underline">{p.kode}</Link>
                                </td>
                                <td className="px-4 py-3">{p.user?.nama_lengkap ?? '-'} <span className="text-xs text-slate-400">({p.user?.npm_nip ?? '-'})</span></td>
                                <td className="px-4 py-3">{p.laboratorium?.nama ?? '-'}</td>
                                <td className="px-4 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                                <td className="px-4 py-3">{p.details?.map((d: any) => `${d.alat?.nama} (${d.jumlah})`).join(', ')}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
