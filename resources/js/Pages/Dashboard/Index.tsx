import { Head, Link, router, usePage } from '@inertiajs/react';
import { Activity, AlertTriangle, Beaker, Building2, ClipboardCheck, ClipboardList, FlaskConical, GraduationCap, Package, Settings, UserCheck, Users, Video, Wrench } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { useLang } from '../../Providers/LanguageProvider';
import { statusPeminjamanMap } from '../../lib/status';
import { formatDate, formatMonthYear } from '../../lib/date';
import { Badge } from '../../Components/Badge';
import { Button } from '../../Components/Button';

export default function DashboardIndex() {
    const { t } = useLang();
    const { auth, role, metrics, trenPeminjaman, statusCounts, distribusiLab, alatPopuler, pendingUsers, recentPeminjaman, recentActivities, features } = usePage().props as any;
    const isEnabled = (key: string) => !!features?.[key];
    const trenRef = useRef<HTMLCanvasElement>(null);
    const statusRef = useRef<HTMLCanvasElement>(null);
    const labRef = useRef<HTMLCanvasElement>(null);
    const alatRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const charts: Chart[] = [];
        if (trenRef.current) {
            charts.push(new Chart(trenRef.current, {
                type: 'line',
                data: {
                    labels: trenPeminjaman.map((r: any) => formatMonthYear(r.bulan)),
                    datasets: [{ label: t('Peminjaman Bulanan', 'Monthly Bookings'), data: trenPeminjaman.map((r: any) => r.total), fill: true, tension: 0.4, backgroundColor: 'rgba(99,102,241,0.2)', borderColor: '#6366f1' }],
                },
                options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
            }));
        }
        if (statusRef.current) {
            charts.push(new Chart(statusRef.current, {
                type: 'bar',
                data: {
                    labels: Object.keys(statusCounts),
                    datasets: [{ data: Object.values(statusCounts), backgroundColor: ['#f59e0b', '#10b981', '#6366f1', '#f43f5e', '#94a3b8', '#06b6d4', '#8b5cf6', '#14b8a6'], borderRadius: 6 }],
                },
                options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
            }));
        }
        if (labRef.current) {
            charts.push(new Chart(labRef.current, {
                type: 'doughnut',
                data: {
                    labels: distribusiLab.map((r: any) => r.label),
                    datasets: [{ data: distribusiLab.map((r: any) => r.total), backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#8b5cf6'] }],
                },
                options: { responsive: true, plugins: { legend: { position: 'right' } } },
            }));
        }
        if (alatRef.current) {
            charts.push(new Chart(alatRef.current, {
                type: 'bar',
                data: {
                    labels: alatPopuler.map((r: any) => r.label),
                    datasets: [{ label: t('Jumlah Dipinjam', 'Borrowed'), data: alatPopuler.map((r: any) => r.total), backgroundColor: '#10b981', borderRadius: 6 }],
                },
                options: { responsive: true, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { precision: 0 } } } },
            }));
        }
        return () => charts.forEach((c) => c.destroy());
    }, [trenPeminjaman, statusCounts, distribusiLab, alatPopuler, t]);

    const adminCards = [
        { href: '/dashboard/admin/program-studi', title: t('Program Studi', 'Programs'), desc: t('Kelola program studi', 'Manage study programs'), icon: GraduationCap, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' },
        { href: '/dashboard/admin/laboratorium', title: t('Laboratorium', 'Laboratories'), desc: t('Kelola laboratorium', 'Manage laboratories'), icon: FlaskConical, color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20' },
        { href: '/dashboard/admin/kategori-alat', title: t('Kategori Alat', 'Categories'), desc: t('Kelola kategori', 'Manage categories'), icon: Beaker, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' },
        { href: '/dashboard/admin/alat', title: t('Alat', 'Equipment'), desc: t('Kelola alat & stok', 'Manage equipment & stock'), icon: Package, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' },
        { href: '/dashboard/admin/users', title: t('Pengguna', 'Users'), desc: t('Verifikasi & role', 'Verification & roles'), icon: Users, color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20' },
        { href: '/dashboard/admin/verifikasi-akun', title: t('Verifikasi Akun', 'Verifications'), desc: t('Setujui/tolak pendaftaran', 'Approve/reject registrations'), icon: UserCheck, color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20' },
        { href: '/dashboard/admin/peminjaman', title: t('Peminjaman', 'Bookings'), desc: t('Kelola semua peminjaman', 'Manage all bookings'), icon: ClipboardList, color: 'bg-sky-50 text-sky-600 dark:bg-sky-900/20' },
        { href: '/dashboard/admin/serah-terima', title: t('Serah Terima', 'Handover'), desc: t('Serah terima alat pinjam', 'Handover borrowed equipment'), icon: ClipboardCheck, color: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20' },
        { href: '/dashboard/admin/pengembalian', title: t('Pengembalian', 'Returns'), desc: t('Pengembalian alat pinjam', 'Process returns'), icon: ClipboardList, color: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20' },
        { href: '/dashboard/admin/video-tutorial', title: t('Video Tutorial', 'Tutorials'), desc: t('Kelola video aplikasi & alat', 'Manage app & equipment videos'), icon: Video, color: 'bg-pink-50 text-pink-600 dark:bg-pink-900/20', feature: 'video_tutorial' },
        { href: '/dashboard/admin/kerusakan', title: t('Kerusakan', 'Damage'), desc: t('Laporan & tindak lanjut kerusakan', 'Damage reports & follow-up'), icon: AlertTriangle, color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20' },
        { href: '/dashboard/admin/maintenance', title: 'Maintenance', desc: t('Jadwal & status perbaikan alat', 'Maintenance schedule & status'), icon: Wrench, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' },
        { href: '/dashboard/admin/pengaturan', title: t('Pengaturan', 'Settings'), desc: t('Konfigurasi sistem', 'System configuration'), icon: Settings, color: 'bg-slate-50 text-slate-600 dark:bg-slate-800', feature: 'pengaturan' },
    ].filter((c) => (c.feature ? isEnabled(c.feature) : true));

    const metricDefs = [
        { label: t('Total Pengguna', 'Total Users'), value: metrics.total_pengguna, icon: Users, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20', href: '/dashboard/admin/users' },
        { label: t('Peminjaman Aktif', 'Active Bookings'), value: metrics.peminjaman_aktif, icon: ClipboardList, color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20', href: '/dashboard/admin/peminjaman' },
        { label: t('Alat Tersedia', 'Available Tools'), value: metrics.alat_tersedia, icon: Wrench, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20', href: '/dashboard/admin/alat' },
        { label: t('Laboratorium Aktif', 'Active Labs'), value: metrics.laboratorium_aktif, icon: Building2, color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20', href: '/dashboard/admin/laboratorium' },
        { label: t('Pendaftaran Menunggu', 'Pending Registrations'), value: metrics.pendaftaran_menunggu, icon: UserCheck, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20', href: '/dashboard/admin/verifikasi-akun' },
        { label: t('Maintenance Berlangsung', 'Ongoing Maintenance'), value: metrics.maintenance_berlangsung, icon: Wrench, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20', href: '/dashboard/admin/maintenance' },
    ];

    function useCountUp(target: number, duration = 1000) {
        const [count, setCount] = useState(0);
        useEffect(() => {
            if (target === 0) { setCount(0); return; }
            const start = performance.now();
            let raf: number;
            const step = (now: number) => {
                const p = Math.min((now - start) / duration, 1);
                setCount(Math.floor(target * p));
                if (p < 1) raf = requestAnimationFrame(step);
                else setCount(target);
            };
            raf = requestAnimationFrame(step);
            return () => cancelAnimationFrame(raf);
        }, [target, duration]);
        return count;
    }

    const MetricCard = ({ item }: { item: typeof metricDefs[0] }) => {
        const count = useCountUp(Number(item.value ?? 0));
        const Icon = item.icon;
        const card = (
            <>
                <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{count}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
            </>
        );
        if (item.href) {
            return (
                <Link href={item.href} className="group rounded-2xl border border-slate-200/80 bg-white p-5 transition duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-slate-800/80 dark:bg-slate-900">
                    {card}
                </Link>
            );
        }
        return (
            <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 transition duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-slate-800/80 dark:bg-slate-900">
                {card}
            </div>
        );
    };

    return (
        <>
            <Head title={role === 'admin' ? 'Dashboard Admin' : 'Dashboard'} />
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
                <h1 className="text-2xl font-bold">{t('Selamat datang', 'Welcome')}, {auth?.user?.nama_lengkap ?? 'Pengguna'}!</h1>
                <p className="mt-2 text-slate-500 dark:text-slate-400">{role && <span className="mt-2 inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-900/20">{role}</span>}</p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {metricDefs.map((m) => <MetricCard key={m.label} item={m} />)}
            </div>

            {role === 'admin' && (
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {adminCards.map((card) => (
                        <Link key={card.href} href={card.href} className="group flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-slate-800/80 dark:bg-slate-900">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}><card.icon className="h-6 w-6" /></div>
                            <div><h2 className="font-semibold">{card.title}</h2><p className="text-sm text-slate-500 dark:text-slate-400">{card.desc}</p></div>
                        </Link>
                    ))}
                </div>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                    <h2 className="mb-4 font-semibold">{t('Tren Peminjaman 6 Bulan', '6-Month Booking Trend')}</h2>
                    <canvas ref={trenRef} height="120" />
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                    <h2 className="mb-4 font-semibold">{t('Distribusi Status Peminjaman', 'Booking Status Distribution')}</h2>
                    <canvas ref={statusRef} height="120" />
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                    <h2 className="mb-4 font-semibold">{t('Distribusi per Laboratorium', 'Bookings per Lab')}</h2>
                    <canvas ref={labRef} height="120" />
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                    <h2 className="mb-4 font-semibold">{t('Alat Paling Sering Dipinjam', 'Most Borrowed Equipment')}</h2>
                    <canvas ref={alatRef} height="120" />
                </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {pendingUsers?.length > 0 && (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                        <h2 className="mb-4 font-semibold">{t('Pendaftaran Menunggu', 'Pending Registrations')}</h2>
                        <div className="space-y-3">
                            {pendingUsers.map((u: any) => (
                                <div key={u.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                                    <div><p className="font-medium">{u.nama_lengkap}</p><p className="text-xs text-slate-500">{u.email}</p></div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="success" onClick={() => router.post(`/dashboard/admin/users/${u.id}/verify`, {}, { preserveScroll: true })}>{t('Setuju', 'Approve')}</Button>
                                        <Button size="sm" variant="danger" onClick={() => router.post(`/dashboard/admin/users/${u.id}/reject`, { rejection_reason: 'Ditolak dari dashboard' }, { preserveScroll: true })}>{t('Tolak', 'Reject')}</Button>
                                        <Button size="sm" variant="primary" onClick={() => router.get('/dashboard/admin/verifikasi-akun')}>{t('Lihat', 'View')}</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {recentPeminjaman?.length > 0 && (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                        <h2 className="mb-4 font-semibold">{t('Peminjaman Terbaru', 'Recent Bookings')}</h2>
                        <div className="space-y-3">
                            {recentPeminjaman.map((p: any) => (
                                <div key={p.kode} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                                    <div>
                                        <p className="font-medium">{p.kode}</p>
                                        <p className="text-xs text-slate-500">{p.peminjam} • {p.laboratorium}</p>
                                    </div>
                                    <Badge variant={statusPeminjamanMap[p.status]?.variant ?? 'neutral'}>{statusPeminjamanMap[p.status]?.label ?? p.status}</Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {recentActivities?.length > 0 && (
                <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                    <h2 className="mb-4 flex items-center gap-2 font-semibold"><Activity className="h-5 w-5 text-indigo-600" /> {t('Aktivitas Terbaru', 'Recent Activity')}</h2>
                    <div className="space-y-4">
                        {recentActivities.slice(0, 6).map((a: any, idx: number) => (
                            <div key={idx} className="relative flex gap-4">
                                {idx !== (recentActivities.length - 1) && <div className="absolute left-2 top-6 h-full w-0.5 bg-slate-100 dark:bg-slate-800" />}
                                <div className="relative z-10 h-4 w-4 shrink-0 rounded-full border-2 border-indigo-600 bg-white dark:bg-slate-900" />
                                <div>
                                    <p className="text-sm font-medium">{a.description}</p>
                                    <p className="text-xs text-slate-500">{formatDate(a.created_at, 'dd MMM yyyy HH:mm')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
