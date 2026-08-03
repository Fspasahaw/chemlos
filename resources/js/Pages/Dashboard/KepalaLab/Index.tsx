import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Beaker,
    CheckCircle,
    ClipboardList,
    Clock,
    Eye,
    FileText,
    FlaskConical,
    Package,
    Wrench,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Badge } from '../../../Components/Badge';
import { Card } from '../../../Components/Card';
import { EmptyTable } from '../../../Components/EmptyTable';
import { formatDate, formatDateTime, formatMonthYear } from '../../../lib/date';
import { alatStatusMap, statusKerusakanMap, statusMaintenanceMap, statusPeminjamanMap as statusMap } from '../../../lib/status';

export default function Index() {
    const { auth, metrics, tren_peminjaman, distribusi_status_alat, distribusi_status_peminjaman, labs, peminjaman_terbaru, kerusakan_terbaru, maintenance_terbaru, notifikasi_belum_dibaca } = usePage().props as any;
    const trenRef = useRef<HTMLCanvasElement>(null);
    const statusRef = useRef<HTMLCanvasElement>(null);
    const peminjamanStatusRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const charts: Chart[] = [];
        if (trenRef.current) {
            charts.push(new Chart(trenRef.current, {
                type: 'line',
                data: {
                    labels: tren_peminjaman.map((r: any) => formatMonthYear(r.bulan)),
                    datasets: [{ label: 'Peminjaman Lab', data: tren_peminjaman.map((r: any) => r.total), fill: true, tension: 0.4, backgroundColor: 'rgba(99,102,241,0.2)', borderColor: '#6366f1' }],
                },
                options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
            }));
        }
        if (statusRef.current) {
            charts.push(new Chart(statusRef.current, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(distribusi_status_alat).map((s) => alatStatusMap[s]?.label ?? s),
                    datasets: [{ data: Object.values(distribusi_status_alat), backgroundColor: ['#10b981', '#f59e0b', '#f43f5e', '#94a3b8'] }],
                },
                options: { responsive: true, plugins: { legend: { position: 'right' } } },
            }));
        }
        if (peminjamanStatusRef.current) {
            charts.push(new Chart(peminjamanStatusRef.current, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(distribusi_status_peminjaman).map((s) => statusMap[s]?.label ?? s),
                    datasets: [{ data: Object.values(distribusi_status_peminjaman), backgroundColor: ['#f59e0b', '#6366f1', '#10b981', '#f43f5e', '#94a3b8', '#06b6d4', '#84cc16'] }],
                },
                options: { responsive: true, plugins: { legend: { position: 'right' } } },
            }));
        }
        return () => charts.forEach((c) => c.destroy());
    }, [tren_peminjaman, distribusi_status_alat, distribusi_status_peminjaman]);

    const metricCards = [
        { label: 'Total Alat Lab', value: metrics.total_alat, icon: Beaker, color: 'bg-blue-50 text-blue-600', href: '/dashboard/kepala-lab/alat' },
        { label: 'Alat Tersedia', value: metrics.alat_tersedia, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600', href: '/dashboard/kepala-lab/alat' },
        { label: 'Peminjaman Aktif Lab', value: metrics.peminjaman_aktif, icon: ClipboardList, color: 'bg-indigo-50 text-indigo-600', href: '/dashboard/kepala-lab/peminjaman' },
        { label: 'Maintenance Berlangsung Lab', value: metrics.maintenance_berlangsung, icon: Wrench, color: 'bg-rose-50 text-rose-600', href: '/dashboard/kepala-lab/maintenance' },
        { label: 'Peminjaman Menunggu Persetujuan', value: metrics.peminjaman_menunggu, icon: Clock, color: 'bg-amber-50 text-amber-600', href: '/dashboard/kepala-lab/peminjaman' },
        { label: 'Kerusakan Belum Selesai', value: metrics.kerusakan_belum_selesai, icon: AlertTriangle, color: 'bg-orange-50 text-orange-600', href: '/dashboard/kepala-lab/kerusakan' },
    ];

    const quickLinks = [
        { href: '/dashboard/kepala-lab/laboratorium', icon: FlaskConical, title: 'Laboratorium', desc: 'Lihat laboratorium yang dikelola' },
        { href: '/dashboard/kepala-lab/alat', icon: Package, title: 'Manajemen Alat', desc: 'Kelola alat lab' },
        { href: '/dashboard/kepala-lab/peminjaman', icon: ClipboardList, title: 'Peminjaman Lab', desc: 'Setujui/tolak peminjaman' },
        { href: '/dashboard/kepala-lab/maintenance', icon: Wrench, title: 'Maintenance', desc: 'Jadwal & status perbaikan' },
        { href: '/dashboard/kepala-lab/kerusakan', icon: AlertTriangle, title: 'Kerusakan', desc: 'Lihat & tindak lanjut kerusakan' },
        { href: '/dashboard/kepala-lab/laporan', icon: FileText, title: 'Laporan', desc: 'Lihat & export laporan lab' },
    ];

    return (
        <>
            <Head title="Dashboard Kepala Lab" />
            <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                <h1 className="text-2xl font-bold">Dashboard Kepala Lab</h1>
                <p className="text-slate-500 dark:text-slate-400">Selamat datang, {auth?.user?.nama_lengkap ?? 'Kepala Lab'}.</p>
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

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {labs.map((l: any) => (
                    <Link key={l.id} href={`/dashboard/kepala-lab/laboratorium/${l.id}`} className="group">
                        <Card className="h-full transition duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                            <div className="flex items-start gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/20">
                                    <FlaskConical className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{l.nama}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{l.alats_count} alat &bull; {l.peminjaman_aktif_count ?? 0} peminjaman aktif</p>
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Card>
                    <Card.Header title="Tren Peminjaman Lab 6 Bulan" />
                    <canvas ref={trenRef} height="120" />
                </Card>
                <Card>
                    <Card.Header title="Distribusi Status Peminjaman Lab" />
                    <canvas ref={peminjamanStatusRef} height="200" />
                </Card>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Card>
                    <Card.Header title="Kondisi Alat Lab" />
                    <canvas ref={statusRef} height="200" />
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
                    <Card.Header title="Peminjaman Terbaru Lab" />
                    <PeminjamanTable items={peminjaman_terbaru} />
                </Card>

                <Card>
                    <Card.Header title="Kerusakan Terbaru Lab" />
                    <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Alat</th>
                                    <th className="px-4 py-3 text-left font-semibold">Jumlah</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold">Waktu</th>
                                    <th className="px-4 py-3 text-left font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {kerusakan_terbaru.length === 0 ? (
                                    <EmptyTable colSpan={5} message="Tidak ada data kerusakan." />
                                ) : kerusakan_terbaru.map((k: any) => {
                                    const st = statusKerusakanMap[k.status] ?? { label: k.status, variant: 'neutral' };
                                    return (
                                        <tr key={k.id} className="border-t border-slate-200/80 dark:border-slate-800/80">
                                            <td className="px-4 py-3 font-medium">{k.alat?.nama ?? '-'}</td>
                                            <td className="px-4 py-3">{k.jumlah}</td>
                                            <td className="px-4 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                                            <td className="px-4 py-3">{formatDateTime(k.created_at)}</td>
                                            <td className="px-4 py-3"><Link href={`/dashboard/kepala-lab/kerusakan/${k.id}`} title="Lihat detail" className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"><Eye className="h-4 w-4 text-slate-600" /></Link></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card>
                    <Card.Header title="Maintenance Terbaru Lab" />
                    <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Alat</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold">Tanggal Mulai</th>
                                    <th className="px-4 py-3 text-left font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {maintenance_terbaru.length === 0 ? (
                                    <EmptyTable colSpan={4} message="Tidak ada data maintenance." />
                                ) : maintenance_terbaru.map((m: any) => {
                                    const st = statusMaintenanceMap[m.status] ?? { label: m.status, variant: 'neutral' };
                                    return (
                                        <tr key={m.id} className="border-t border-slate-200/80 dark:border-slate-800/80">
                                            <td className="px-4 py-3 font-medium">{m.alat?.nama ?? '-'}</td>
                                            <td className="px-4 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                                            <td className="px-4 py-3">{formatDate(m.tanggal_mulai)}</td>
                                            <td className="px-4 py-3"><Link href={`/dashboard/kepala-lab/maintenance/${m.id}`} title="Lihat detail" className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"><Eye className="h-4 w-4 text-slate-600" /></Link></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </>
    );
}

function PeminjamanTable({ items, roleBase = 'kepala-lab' }: { items: any[]; roleBase?: string }) {
    return (
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
                    {items.length === 0 ? (
                        <EmptyTable colSpan={5} message="Tidak ada data." />
                    ) : items.map((p: any) => {
                        const st = statusMap[p.status] ?? { label: p.status, variant: 'neutral' };
                        return (
                            <tr key={p.id} className="border-t border-slate-200/80 dark:border-slate-800/80">
                                <td className="px-4 py-3 font-medium">{p.kode}</td>
                                <td className="px-4 py-3">{p.user?.nama_lengkap ?? '-'}</td>
                                <td className="px-4 py-3">{p.laboratorium?.nama ?? '-'}</td>
                                <td className="px-4 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                                <td className="px-4 py-3"><Link href={`/dashboard/${roleBase}/peminjaman/${p.id}`} title="Lihat detail" className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"><Eye className="h-4 w-4 text-slate-600" /></Link></td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
