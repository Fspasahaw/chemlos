import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { AlertTriangle, CalendarClock, CheckCircle, ClipboardList, Clock, Eye, FileText, Users, Wrench } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '../../../Components/Badge';
import { Calendar } from '../../../Components/Calendar';
import { Card } from '../../../Components/Card';
import { EmptyTable } from '../../../Components/EmptyTable';
import { formatDate, formatDateTime, formatMonthYear, formatRupiah } from '../../../lib/date';
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
    const { auth, metrics, tren_peminjaman, status_peminjaman, distribusi_lab, peminjaman_menunggu, pengembalian_terbaru, notifikasi_belum_dibaca } = usePage().props as any;
    const [kalenderEvents, setKalenderEvents] = useState<CalendarEvent[]>([]);
    const trenRef = useRef<HTMLCanvasElement>(null);
    const statusRef = useRef<HTMLCanvasElement>(null);
    const labRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        axios.get('/kalender/peminjaman').then((r) => setKalenderEvents(r.data ?? []));
    }, []);

    useEffect(() => {
        const charts: Chart[] = [];
        if (trenRef.current) {
            charts.push(new Chart(trenRef.current, {
                type: 'line',
                data: {
                    labels: tren_peminjaman.map((r: any) => formatMonthYear(r.bulan)),
                    datasets: [{ label: 'Bimbingan', data: tren_peminjaman.map((r: any) => r.total), fill: true, tension: 0.4, backgroundColor: 'rgba(99,102,241,0.2)', borderColor: '#6366f1' }],
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
        if (labRef.current) {
            charts.push(new Chart(labRef.current, {
                type: 'bar',
                data: {
                    labels: distribusi_lab.map((r: any) => r.label),
                    datasets: [{ label: 'Peminjaman', data: distribusi_lab.map((r: any) => r.total), backgroundColor: '#10b981', borderRadius: 6 }],
                },
                options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
            }));
        }
        return () => charts.forEach((c) => c.destroy());
    }, [tren_peminjaman, status_peminjaman, distribusi_lab]);

    const metricCards = [
        { label: 'Mahasiswa Bimbingan', value: metrics.total_mahasiswa_bimbingan, icon: Users, color: 'bg-blue-50 text-blue-600', href: '/dashboard/dosen/peminjaman' },
        { label: 'Peminjaman Aktif', value: metrics.peminjaman_aktif_bimbingan, icon: ClipboardList, color: 'bg-indigo-50 text-indigo-600', href: '/dashboard/dosen/peminjaman' },
        { label: 'Menunggu Persetujuan', value: metrics.peminjaman_menunggu_persetujuan, icon: Clock, color: 'bg-amber-50 text-amber-600', href: '/dashboard/dosen/peminjaman' },
        { label: 'Kerusakan Terkait', value: metrics.kerusakan_terkait_bimbingan, icon: AlertTriangle, color: 'bg-rose-50 text-rose-600', href: '/dashboard/dosen/kerusakan' },
        { label: 'Jatuh Tempo', value: metrics.pengembalian_jatuh_tempo, icon: CalendarClock, color: 'bg-orange-50 text-orange-600', href: '/dashboard/dosen/pengembalian' },
    ];

    const quickLinks = [
        { href: '/dashboard/dosen/peminjaman', icon: ClipboardList, title: 'Persetujuan Peminjaman', desc: 'Setujui/tolak pengajuan mahasiswa' },
        { href: '/dashboard/dosen/kerusakan', icon: AlertTriangle, title: 'Riwayat Kerusakan', desc: 'Lihat kerusakan terkait bimbingan' },
        { href: '/dashboard/dosen/pengembalian', icon: CheckCircle, title: 'Pengembalian', desc: 'Monitor pengembalian mahasiswa' },
        { href: '/dashboard/dosen/laporan', icon: FileText, title: 'Laporan', desc: 'Export laporan bimbingan' },
    ];

    return (
        <>
            <Head title="Dashboard Dosen" />
            <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                <h1 className="text-2xl font-bold">Dashboard Dosen</h1>
                <p className="text-slate-500 dark:text-slate-400">Selamat datang, {auth?.user?.nama_lengkap ?? 'Dosen'}. Notifikasi belum dibaca: {notifikasi_belum_dibaca}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                    <Card.Header title="Tren Peminjaman Bimbingan 6 Bulan" />
                    <canvas ref={trenRef} height="120" />
                </Card>
                <Card>
                    <Card.Header title="Status Peminjaman Bimbingan" />
                    <canvas ref={statusRef} height="200" />
                </Card>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Card>
                    <Card.Header title="Distribusi per Laboratorium" icon={<Wrench className="h-5 w-5" />} />
                    <canvas ref={labRef} height="120" />
                </Card>
                <Card>
                    <Card.Header title="Notifikasi" icon={<Clock className="h-5 w-5" />} action={<span className="text-sm text-slate-500">Belum dibaca: {notifikasi_belum_dibaca}</span>} />
                    <div className="rounded-xl border border-slate-200/80 p-6 text-center text-slate-500 dark:border-slate-800/80">
                        <p className="text-sm">Lihat notifikasi lengkap di menu <Link href="/notifikasi" className="text-indigo-600 hover:underline">Notifikasi</Link>.</p>
                    </div>
                </Card>
            </div>

            <Card className="mt-6">
                <Card.Header title="Peminjaman Menunggu Persetujuan" icon={<Clock className="h-5 w-5" />} />
                <PeminjamanTable items={peminjaman_menunggu} />
            </Card>

            <Card className="mt-6">
                <Card.Header title="Pengembalian Terbaru Bimbingan" icon={<CheckCircle className="h-5 w-5" />} />
                <PengembalianTable items={pengembalian_terbaru} />
            </Card>

            <Card className="mt-6">
                <Card.Header title="Kalender Peminjaman Bimbingan" />
                <Calendar
                    events={kalenderEvents}
                    height="500px"
                    showFilters={(kalenderEvents ?? []).length > 0}
                    onEventClick={(e) => window.location.href = `/dashboard/dosen/peminjaman/${e.id}`}
                />
            </Card>
        </>
    );
}

function PeminjamanTable({ items }: { items: any[] }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                        <th className="px-4 py-3 text-left font-semibold">Kode</th>
                        <th className="px-4 py-3 text-left font-semibold">Mahasiswa</th>
                        <th className="px-4 py-3 text-left font-semibold">Lab</th>
                        <th className="px-4 py-3 text-left font-semibold">Alat</th>
                        <th className="px-4 py-3 text-left font-semibold">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 ? (
                        <EmptyTable colSpan={5} message="Tidak ada peminjaman menunggu." />
                    ) : items.map((p: any) => (
                        <tr key={p.id} className="border-t border-slate-200/80 dark:border-slate-800/80">
                            <td className="px-4 py-3 font-medium">{p.kode}</td>
                            <td className="px-4 py-3">{p.user?.nama_lengkap ?? '-'} <span className="text-xs text-slate-400">({p.user?.npm_nip ?? '-'})</span></td>
                            <td className="px-4 py-3">{p.laboratorium?.nama ?? '-'}</td>
                            <td className="px-4 py-3">{p.details?.map((d: any) => `${d.alat?.nama} (${d.jumlah})`).join(', ')}</td>
                            <td className="px-4 py-3">
                                <Link href={`/dashboard/dosen/peminjaman/${p.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline">
                                    <Eye className="h-3.5 w-3.5" /> Lihat
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function PengembalianTable({ items }: { items: any[] }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                        <th className="px-4 py-3 text-left font-semibold">Kode</th>
                        <th className="px-4 py-3 text-left font-semibold">Mahasiswa</th>
                        <th className="px-4 py-3 text-left font-semibold">Lab</th>
                        <th className="px-4 py-3 text-left font-semibold">Alat</th>
                        <th className="px-4 py-3 text-left font-semibold">Waktu Kembali</th>
                        <th className="px-4 py-3 text-left font-semibold">Status</th>
                        <th className="px-4 py-3 text-left font-semibold">Denda</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 ? (
                        <EmptyTable colSpan={7} message="Tidak ada pengembalian terbaru." />
                    ) : items.map((p: any) => {
                        const st = statusMap[p.status] ?? { label: p.status, variant: 'neutral' };
                        return (
                            <tr key={p.id} className="border-t border-slate-200/80 dark:border-slate-800/80">
                                <td className="px-4 py-3 font-medium">
                                    <Link href={`/dashboard/dosen/peminjaman/${p.id}`} className="text-indigo-600 hover:underline">{p.kode}</Link>
                                </td>
                                <td className="px-4 py-3">{p.user?.nama_lengkap ?? '-'} <span className="text-xs text-slate-400">({p.user?.npm_nip ?? '-'})</span></td>
                                <td className="px-4 py-3">{p.laboratorium?.nama ?? '-'}</td>
                                <td className="px-4 py-3">{p.details?.map((d: any) => `${d.alat?.nama} (${d.jumlah})`).join(', ')}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{p.pengembalian?.waktu_pengembalian ? formatDateTime(p.pengembalian.waktu_pengembalian) : '-'}</td>
                                <td className="px-4 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                                <td className="px-4 py-3">{p.pengembalian?.total_denda ? formatRupiah(p.pengembalian.total_denda) : '-'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
