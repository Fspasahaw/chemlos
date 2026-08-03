import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Bell,
    Building2,
    ClipboardList,
    Eye,
    FileText,
    FlaskConical,
    GraduationCap,
    Package,
    Settings,
    UserCheck,
    Users,
    Wrench,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Badge } from '../../../Components/Badge';
import { Card } from '../../../Components/Card';
import { formatDate, formatDateTime, formatMonthYear } from '../../../lib/date';
import { statusPeminjamanMap as statusMap } from '../../../lib/status';
import { EmptyTable } from '../../../Components/EmptyTable';



export default function Index() {
    const { auth, metrics, tren_peminjaman, distribusi_lab, status_peminjaman, peminjaman_terbaru, pendaftaran_menunggu, aktivitas_terbaru, notifikasi_belum_dibaca, features } = usePage().props as any;
    const isEnabled = (key: string) => !!features?.[key];
    const trenRef = useRef<HTMLCanvasElement>(null);
    const labRef = useRef<HTMLCanvasElement>(null);
    const statusRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const charts: Chart[] = [];
        if (trenRef.current) {
            charts.push(new Chart(trenRef.current, {
                type: 'line',
                data: {
                    labels: tren_peminjaman.map((r: any) => formatMonthYear(r.bulan)),
                    datasets: [{ label: 'Peminjaman', data: tren_peminjaman.map((r: any) => r.total), fill: true, tension: 0.4, backgroundColor: 'rgba(99,102,241,0.2)', borderColor: '#6366f1' }],
                },
                options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
            }));
        }
        if (labRef.current) {
            charts.push(new Chart(labRef.current, {
                type: 'bar',
                data: {
                    labels: distribusi_lab.map((r: any) => r.label),
                    datasets: [{ label: 'Peminjaman', data: distribusi_lab.map((r: any) => r.total), backgroundColor: '#6366f1', borderRadius: 6 }],
                },
                options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
            }));
        }
        if (statusRef.current) {
            charts.push(new Chart(statusRef.current, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(status_peminjaman).map((s) => statusMap[s]?.label ?? s),
                    datasets: [{ data: Object.values(status_peminjaman), backgroundColor: ['#f59e0b', '#10b981', '#6366f1', '#f43f5e', '#94a3b8', '#06b6d4', '#84cc16', '#d946ef'] }],
                },
                options: { responsive: true, plugins: { legend: { position: 'right' } } },
            }));
        }
        return () => charts.forEach((c) => c.destroy());
    }, [tren_peminjaman, distribusi_lab, status_peminjaman]);

    const pendaftaranStatusMap: Record<string, { label: string; variant: any }> = {
        pending_email: { label: 'Belum Verifikasi Email', variant: 'info' },
        pending_approval: { label: 'Menunggu Persetujuan', variant: 'warning' },
        rejected: { label: 'Ditolak', variant: 'danger' },
    };

    const metricCards = [
        { label: 'Total Pengguna', value: metrics.total_pengguna, icon: Users, color: 'bg-emerald-50 text-emerald-600', href: '/dashboard/pimpinan/pengguna' },
        { label: 'Peminjaman Aktif', value: metrics.peminjaman_aktif, icon: ClipboardList, color: 'bg-blue-50 text-blue-600', href: '/dashboard/pimpinan/peminjaman' },
        { label: 'Alat Tersedia', value: metrics.alat_tersedia, icon: Wrench, color: 'bg-indigo-50 text-indigo-600', href: '/dashboard/pimpinan/alat' },
        { label: 'Laboratorium Aktif', value: metrics.laboratorium_aktif, icon: Building2, color: 'bg-purple-50 text-purple-600', href: '/dashboard/pimpinan/laboratorium' },
        { label: 'Pendaftaran Menunggu', value: metrics.pendaftaran_menunggu, icon: UserCheck, color: 'bg-amber-50 text-amber-600', href: '/dashboard/pimpinan/pengguna?status=pending_approval' },
        { label: 'Maintenance Berlangsung', value: metrics.maintenance_berlangsung, icon: Wrench, color: 'bg-rose-50 text-rose-600', href: '/dashboard/pimpinan/maintenance' },
    ];

    const quickLinks = [
        { href: '/dashboard/pimpinan/program-studi', icon: GraduationCap, title: 'Program Studi', desc: 'Lihat data program studi' },
        { href: '/dashboard/pimpinan/laboratorium', icon: FlaskConical, title: 'Laboratorium', desc: 'Lihat laboratorium aktif' },
        { href: '/dashboard/pimpinan/alat', icon: Package, title: 'Alat', desc: 'Lihat inventaris alat' },
        { href: '/dashboard/pimpinan/peminjaman', icon: ClipboardList, title: 'Peminjaman', desc: 'Pantau peminjaman' },
        { href: '/dashboard/pimpinan/laporan', icon: FileText, title: 'Laporan', desc: 'Lihat & export laporan' },
        { href: '/dashboard/pimpinan/pengaturan', icon: Settings, title: 'Pengaturan', desc: 'Atur identitas & kebijakan', feature: 'pengaturan' },
    ].filter((c) => (c.feature ? isEnabled(c.feature) : true));

    return (
        <>
            <Head title="Dashboard Pimpinan" />
            <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                <h1 className="text-2xl font-bold">Dashboard Pimpinan</h1>
                <p className="text-slate-500 dark:text-slate-400">Selamat datang, {auth?.user?.nama_lengkap ?? 'Pimpinan'}.</p>
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

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    <Card.Header title="Tren Peminjaman 6 Bulan" />
                    <canvas ref={trenRef} height="120" />
                </Card>
                <Card>
                    <Card.Header title="Distribusi per Laboratorium" />
                    <canvas ref={labRef} height="120" />
                </Card>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Card>
                    <Card.Header title="Status Peminjaman" />
                    <canvas ref={statusRef} height="200" />
                </Card>
                <Card>
                    <Card.Header title="Notifikasi" icon={<Bell className="h-5 w-5" />} action={<span className="text-sm text-slate-500">Belum dibaca: {notifikasi_belum_dibaca}</span>} />
                    <div className="rounded-xl border border-slate-200/80 p-6 text-center text-slate-500 dark:border-slate-800/80">
                        <p className="text-sm">Lihat notifikasi lengkap di menu <Link href="/notifikasi" className="text-indigo-600 hover:underline">Notifikasi</Link>.</p>
                    </div>
                </Card>
            </div>

            <div className="mt-6 grid gap-6">
                <Card>
                    <Card.Header title="Peminjaman Terbaru" />
                    <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Kode</th>
                                    <th className="px-4 py-3 text-left font-semibold">Peminjam</th>
                                    <th className="px-4 py-3 text-left font-semibold">Lab</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {peminjaman_terbaru.length === 0 ? (
                                    <EmptyTable colSpan={5} message="Tidak ada peminjaman." />
                                ) : peminjaman_terbaru.map((p: any) => {
                                    const st = statusMap[p.status] ?? { label: p.status, variant: 'neutral' };
                                    return (
                                        <tr key={p.id} className="border-t border-slate-200/80 dark:border-slate-800/80">
                                            <td className="px-4 py-3 font-medium">{p.kode}</td>
                                            <td className="px-4 py-3">{p.peminjam}</td>
                                            <td className="px-4 py-3">{p.laboratorium}</td>
                                            <td className="px-4 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                                            <td className="px-4 py-3"><Link href={`/dashboard/pimpinan/peminjaman/${p.id}`} title="Lihat detail" className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"><Eye className="h-4 w-4 text-slate-600" /></Link></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card>
                    <Card.Header title="Pendaftaran Menunggu" />
                    <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Nama</th>
                                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendaftaran_menunggu.length === 0 ? (
                                    <EmptyTable colSpan={4} message="Tidak ada pendaftaran menunggu." />
                                ) : pendaftaran_menunggu.map((u: any) => {
                                    const st = pendaftaranStatusMap[u.status] ?? { label: u.status, variant: 'neutral' };
                                    return (
                                        <tr key={u.id} className="border-t border-slate-200/80 dark:border-slate-800/80">
                                            <td className="px-4 py-3 font-medium">{u.nama_lengkap}</td>
                                            <td className="px-4 py-3">{u.email}</td>
                                            <td className="px-4 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                                            <td className="px-4 py-3"><Link href={`/dashboard/pimpinan/pengguna/${u.id}`} title="Lihat detail" className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"><Eye className="h-4 w-4 text-slate-600" /></Link></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card>
                    <Card.Header title="Aktivitas Terbaru" />
                    <div className="space-y-3">
                        {aktivitas_terbaru.length === 0 ? (
                            <p className="text-center text-sm text-slate-500">Tidak ada aktivitas.</p>
                        ) : aktivitas_terbaru.map((a: any) => (
                            <div key={a.id} className="rounded-xl border border-slate-200/80 p-3 dark:border-slate-800/80">
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{a.user}</p>
                                <p className="text-sm text-slate-500">{a.description}</p>
                                <p className="text-xs text-slate-400">{formatDateTime(a.created_at)}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </>
    );
}
