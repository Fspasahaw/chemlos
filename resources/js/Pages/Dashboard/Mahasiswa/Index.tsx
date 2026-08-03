import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { AlertTriangle, Bell, CheckCircle, ClipboardList, Clock, FlaskConical, Plus, TrendingUp, Wrench } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '../../../Components/Badge';
import { Calendar } from '../../../Components/Calendar';
import { Card } from '../../../Components/Card';
import { formatDate, formatMonthYear, formatRupiah } from '../../../lib/date';
import { statusPeminjamanMap as statusMap } from '../../../lib/status';
import Chart from 'chart.js/auto';

interface CalendarEvent {
    id: number;
    title: string;
    start: string;
    end?: string;
    color?: string;
    url?: string;
    extendedProps?: Record<string, any>;
}

export default function Index() {
    const { auth, metrics, tren_bulanan, status_peminjaman, peminjaman_terbaru, notifikasi_terbaru } = usePage().props as any;
    const [kalenderEvents, setKalenderEvents] = useState<CalendarEvent[]>([]);
    const trenRef = useRef<HTMLCanvasElement>(null);
    const statusRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        axios.get('/kalender/peminjaman').then((r) => setKalenderEvents(r.data ?? []));
    }, []);

    useEffect(() => {
        const charts: Chart[] = [];
        if (trenRef.current) {
            charts.push(new Chart(trenRef.current, {
                type: 'line',
                data: {
                    labels: tren_bulanan.map((r: any) => formatMonthYear(r.bulan)),
                    datasets: [{ label: 'Peminjaman', data: tren_bulanan.map((r: any) => r.total), fill: true, tension: 0.4, backgroundColor: 'rgba(99,102,241,0.2)', borderColor: '#6366f1' }],
                },
                options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
            }));
        }
        if (statusRef.current) {
            charts.push(new Chart(statusRef.current, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(status_peminjaman).map((s) => statusMap[s]?.label ?? s),
                    datasets: [{ data: Object.values(status_peminjaman), backgroundColor: ['#f59e0b', '#6366f1', '#10b981', '#f43f5e', '#94a3b8', '#06b6d4', '#84cc16'] }],
                },
                options: { responsive: true, plugins: { legend: { position: 'right' } } },
            }));
        }
        return () => charts.forEach((c) => c.destroy());
    }, [tren_bulanan, status_peminjaman]);

    const metricCards = [
        { label: 'Peminjaman Aktif', value: metrics.peminjaman_aktif, icon: ClipboardList, color: 'bg-indigo-50 text-indigo-600', href: '/dashboard/mahasiswa/peminjaman' },
        { label: 'Peminjaman Menunggu', value: metrics.peminjaman_menunggu, icon: Clock, color: 'bg-amber-50 text-amber-600', href: '/dashboard/mahasiswa/peminjaman' },
        { label: 'Peminjaman Selesai', value: metrics.peminjaman_selesai, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600', href: '/dashboard/mahasiswa/peminjaman' },
        { label: 'Notifikasi Belum Dibaca', value: metrics.notifikasi_belum_dibaca, icon: Bell, color: 'bg-blue-50 text-blue-600', href: '/notifikasi' },
        { label: 'Denda Tertunggak', value: formatRupiah(metrics.denda_tertunggak ?? 0), icon: AlertTriangle, color: 'bg-rose-50 text-rose-600', href: '/dashboard/mahasiswa/pengembalian' },
    ];

    const quickLinks = [
        { href: '/dashboard/mahasiswa/peminjaman/baru', icon: Plus, title: 'Ajukan Peminjaman', desc: 'Pilih lab, alat, dan ajukan peminjaman' },
        { href: '/dashboard/mahasiswa/peminjaman', icon: ClipboardList, title: 'Riwayat Peminjaman', desc: 'Pantau status peminjaman Anda' },
        { href: '/laboratorium', icon: FlaskConical, title: 'Lihat Laboratorium', desc: 'Jelajahi laboratorium yang tersedia' },
        { href: '/alat', icon: Wrench, title: 'Lihat Alat', desc: 'Cari alat yang bisa dipinjam' },
    ];

    return (
        <>
            <Head title="Dashboard Mahasiswa" />
            <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                <h1 className="text-2xl font-bold">Dashboard Mahasiswa</h1>
                <p className="text-slate-500 dark:text-slate-400">Selamat datang, {auth?.user?.nama_lengkap ?? 'Mahasiswa'}.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                    <Card.Header title="Status Peminjaman Saya" icon={<TrendingUp className="h-5 w-5" />} />
                    <canvas ref={statusRef} height="200" />
                </Card>
                <Card>
                    <Card.Header title="Peminjaman per Bulan (6 Bulan Terakhir)" icon={<TrendingUp className="h-5 w-5" />} />
                    <canvas ref={trenRef} height="120" />
                </Card>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Card>
                    <Card.Header title="Peminjaman Terbaru" icon={<ClipboardList className="h-5 w-5" />} />
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Kode</th>
                                    <th className="px-4 py-3 text-left font-semibold">Lab</th>
                                    <th className="px-4 py-3 text-left font-semibold">Periode</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {peminjaman_terbaru.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">Belum ada peminjaman.</td>
                                    </tr>
                                ) : peminjaman_terbaru.map((p: any) => {
                                    const st = statusMap[p.status] ?? { label: p.status, variant: 'neutral' };
                                    return (
                                        <tr key={p.id} className="border-t border-slate-200/80 dark:border-slate-800/80">
                                            <td className="px-4 py-3 font-medium">{p.kode}</td>
                                            <td className="px-4 py-3">{p.laboratorium?.nama ?? '-'}</td>
                                            <td className="px-4 py-3">{formatDate(p.tanggal_mulai)} s/d {formatDate(p.tanggal_selesai)}</td>
                                            <td className="px-4 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                                            <td className="px-4 py-3">
                                                <Link href={`/dashboard/mahasiswa/peminjaman/${p.id}`} className="text-sm font-medium text-indigo-600 hover:underline">Lihat</Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
                <Card>
                    <Card.Header title="Notifikasi Terbaru" icon={<Bell className="h-5 w-5" />} action={<Link href="/notifikasi" className="text-sm text-indigo-600 hover:underline">Lihat semua</Link>} />
                    <div className="space-y-3">
                        {notifikasi_terbaru?.length === 0 ? (
                            <p className="text-center text-sm text-slate-500">Tidak ada notifikasi.</p>
                        ) : notifikasi_terbaru?.map((n: any) => (
                            <Link key={n.id} href={n.url ?? '/notifikasi'} className="flex items-start gap-3 rounded-xl border border-slate-200/80 p-3 transition hover:bg-slate-50 dark:border-slate-800/80 dark:hover:bg-slate-800/50">
                                <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${n.read_at ? 'bg-slate-300' : 'bg-rose-500'}`} />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{n.judul}</p>
                                    <p className="text-xs text-slate-500 line-clamp-2">{n.isi}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </Card>
            </div>

            <Card className="mt-6">
                <Card.Header title="Kalender Peminjaman" />
                <Calendar
                    events={kalenderEvents}
                    height="500px"
                    showFilters={(kalenderEvents ?? []).length > 0}
                    onEventClick={(e) => window.location.href = `/dashboard/mahasiswa/peminjaman/${e.id}`}
                />
            </Card>
        </>
    );
}
