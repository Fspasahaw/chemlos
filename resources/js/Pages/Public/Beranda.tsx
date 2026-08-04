import { Head, Link, usePage } from '@inertiajs/react';
import { BarChart3, Bell, Calendar as CalendarIconLucide, CalendarDays, ChevronDown, FlaskConical, QrCode, Search, Users, Wrench, Building2, FileCheck, GraduationCap, Pin, RotateCcw } from 'lucide-react';
import { LabIllustration } from '../../Components/LabIllustration';
import { useEffect, useState } from 'react';
import { Calendar, CalendarEvent } from '../../Components/Calendar';
import { ImageWithFallback } from '../../Components/ImageWithFallback';
import { useLang } from '../../Providers/LanguageProvider';

interface FilterOption {
    value: string;
    label: string;
}

interface BerandaProps {
    appName: string;
    stats: {
        laboratorium: number;
        alat: number;
        peminjaman: number;
        pengguna: number;
    };
    labs: any[];
    events: CalendarEvent[];
    labOptions: FilterOption[];
    statusOptions: FilterOption[];
}

function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const end = Number(value) || 0;
        const startTime = performance.now();
        const step = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(step);
        };
        const raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [value, duration]);

    return <span>{count.toLocaleString('id-ID')}</span>;
}

export default function Beranda({ appName, stats, labs, events, labOptions, statusOptions }: BerandaProps) {
    const { t } = useLang();
    const { features } = usePage().props as any;
    const isEnabled = (key: string) => !!features?.[key];
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const featureCards = [
        { icon: Search, title: t('Peminjaman Online', 'Online Booking'), desc: t('Ajukan pinjam alat kapan saja tanpa antre.', 'Request equipment anytime without queuing.'), color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300' },
        { icon: CalendarIconLucide, title: t('Kalender Real-time', 'Real-time Calendar'), desc: t('Lihat jadwal peminjaman dan maintenance langsung.', 'View booking and maintenance schedules in real-time.'), color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300' },
        { icon: FlaskConical, title: t('Multi-Alat', 'Multi-Equipment'), desc: t('Pinjam banyak alat dari satu laboratorium sekaligus.', 'Borrow multiple tools from one lab at once.'), color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300' },
        { icon: Bell, title: t('Notifikasi', 'Notifications'), desc: t('Dapatkan update status peminjaman via email.', 'Get booking status updates via email.'), color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-300' },
        { icon: QrCode, title: 'QR Code', desc: t('Scan QR pada alat untuk cek detail dan status.', 'Scan QR on equipment to check details and status.'), color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/20 dark:text-violet-300', feature: 'qr_code' },
        { icon: BarChart3, title: t('Laporan', 'Reports'), desc: t('Laporan peminjaman, kerusakan, dan audit otomatis.', 'Automated booking, damage, and audit reports.'), color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-300' },
    ].filter((f) => (f.feature ? isEnabled(f.feature) : true));

    const steps = [
        { key: '1', label: t('Daftar', 'Register'), description: t('Buat akun dengan email institusi.', 'Create an account with your institutional email.'), icon: GraduationCap },
        { key: '2', label: t('Verifikasi', 'Verify'), description: t('Verifikasi email dan tunggu persetujuan.', 'Verify email and wait for approval.'), icon: FileCheck },
        { key: '3', label: t('Pilih Alat', 'Choose Equipment'), description: t('Cari laboratorium dan alat yang Anda butuhkan.', 'Find the lab and equipment you need.'), icon: Search },
        { key: '4', label: t('Ajukan', 'Submit'), description: t('Isi form peminjaman dan upload JSA.', 'Fill the booking form and upload JSA.'), icon: Pin },
        { key: '5', label: t('Gunakan', 'Use'), description: t('Serah terima alat sesuai jadwal.', 'Handover equipment according to schedule.'), icon: FlaskConical },
        { key: '6', label: t('Kembalikan', 'Return'), description: t('Kembalikan alat dan selesaikan peminjaman.', 'Return equipment and complete the booking.'), icon: RotateCcw },
    ];

    const faqs = [
        { q: t('Siapa yang boleh meminjam alat?', 'Who can borrow equipment?'), a: t('Mahasiswa dan dosen aktif Departemen Teknik Kimia FTUI.', 'Active students and lecturers of the Chemical Engineering Department, FTUI.') },
        { q: t('Berapa lama proses persetujuan?', 'How long is the approval process?'), a: t('Maksimal 24 jam pada hari kerja.', 'Maximum 24 hours on working days.') },
        { q: t('Apakah perlu pelatihan?', 'Is training required?'), a: t('Alat tertentu memerlukan pelatihan sebelum peminjaman.', 'Certain equipment requires training before borrowing.') },
        { q: t('Bagaimana cara menghubungi laboran?', 'How to contact the lab assistant?'), a: t('Gunakan halaman Kontak atau WhatsApp admin.', 'Use the Contact page or admin WhatsApp.') },
    ];

    const statItems = [
        { label: t('Laboratorium', 'Laboratories'), value: Number(stats.laboratorium), icon: Building2, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
        { label: t('Alat Tersedia', 'Available Equipment'), value: Number(stats.alat), icon: Wrench, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
        { label: t('Peminjaman Bulan Ini', 'This Month Bookings'), value: Number(stats.peminjaman), icon: CalendarDays, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
        { label: t('Pengguna Terdaftar', 'Registered Users'), value: Number(stats.pengguna), icon: Users, color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20' },
    ];

    return (
        <>
            <Head title={t('Beranda', 'Home')} />

            <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-20 text-white">
                <style>{`@keyframes float {0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}`}</style>
                <div className="pointer-events-none absolute inset-0 opacity-20">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <circle cx="20" cy="20" r="40" fill="url(#homeGrad1)" />
                        <circle cx="80" cy="80" r="30" fill="url(#homeGrad2)" />
                        <defs>
                            <radialGradient id="homeGrad1" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                            </radialGradient>
                            <radialGradient id="homeGrad2" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                            </radialGradient>
                        </defs>
                    </svg>
                </div>
                <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-10 lg:flex-row">
                    <div className="max-w-3xl text-center lg:text-left">
                        <h1 className="mb-4 text-5xl font-extrabold tracking-tight drop-shadow-lg md:text-7xl bg-linear-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                            {appName}
                        </h1>
                        <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90 md:text-2xl lg:mx-0">
                            {t('Chemical Laboratory Online System — Sistem Manajemen Inventaris dan Peminjaman Alat Laboratorium Terintegrasi', 'Chemical Laboratory Online System — Integrated Inventory and Laboratory Equipment Lending Management System')}
                        </p>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                            <Link
                                href="/daftar"
                                className="rounded-full bg-white px-8 py-3 font-semibold text-indigo-600 shadow-lg transition-transform hover:scale-105"
                            >
                                {t('Mulai Sekarang', 'Get Started')}
                            </Link>
                            <Link
                                href="/laboratorium"
                                className="rounded-full border-2 border-white px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10"
                            >
                                {t('Lihat Laboratorium', 'View Laboratories')}
                            </Link>
                        </div>
                    </div>
                    <div className="hidden animate-[float_6s_ease-in-out_infinite] lg:block">
                        <LabIllustration className="h-72 w-96 opacity-80" />
                    </div>
                </div>
            </section>

            <section className="border-b border-slate-200/80 bg-white py-10 dark:border-slate-800/80 dark:bg-slate-900">
                <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
                    {statItems.map((s) => (
                        <div key={s.label} className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800/80 dark:bg-slate-900">
                            <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${s.color}`}>
                                <s.icon className="h-6 w-6" />
                            </div>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white"><AnimatedCounter value={s.value} /></p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-16">
                <div className="mb-10 text-center">
                    <h2 className="text-2xl font-bold md:text-3xl">{t('Fitur Unggulan', 'Key Features')}</h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">{t('Kemudahan mengelola peminjaman alat laboratorium.', 'Easily manage laboratory equipment lending.')}</p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {featureCards.map((f) => (
                        <div
                            key={f.title}
                            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-slate-800/80 dark:bg-slate-900"
                        >
                            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${f.color}`}>
                                <f.icon className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold">{f.title}</h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-slate-50 py-16 dark:bg-slate-900/50">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mb-10 text-center">
                        <h2 className="text-2xl font-bold md:text-3xl">{t('Kalender Peminjaman', 'Booking Calendar')}</h2>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">{t('Lihat jadwal peminjaman laboratorium secara real-time.', 'View real-time lab booking schedules.')}</p>
                    </div>
                    <Calendar events={events} labOptions={labOptions} statusOptions={statusOptions} showFilters={(events ?? []).length > 0} />
                </div>
            </section>

            <section className="bg-slate-50 py-16 dark:bg-slate-900/50">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mb-10 flex items-end justify-between">
                        <div>
                            <h2 className="text-2xl font-bold md:text-3xl">{t('Laboratorium Kami', 'Our Laboratories')}</h2>
                            <p className="mt-2 text-slate-500 dark:text-slate-400">{t('Berbagai laboratorium yang tersedia untuk peminjaman alat.', 'Various laboratories available for equipment lending.')}</p>
                        </div>
                        <Link href="/laboratorium" className="hidden rounded-lg text-sm font-medium text-indigo-600 hover:underline md:block">
                            {t('Lihat Semua', 'View All')}
                        </Link>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {labs.map((lab: any) => (
                            <Link
                                key={lab.id}
                                href={`/laboratorium/${lab.slug}`}
                                className="group relative overflow-hidden rounded-2xl bg-slate-200 p-6 transition duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:bg-slate-800"
                            >
                                {lab.foto_utama && (
                                    <ImageWithFallback
                                        src={`/storage/${lab.foto_utama}`}
                                        alt={lab.nama}
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                )}
                                <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 to-slate-900/20" />
                                <div className="relative z-10 min-h-[180px] text-white">
                                    <h3 className="text-lg font-semibold">{lab.nama}</h3>
                                    <p className="mt-1 text-sm text-white/80">{lab.kode}</p>
                                    <p className="mt-4 text-xs text-white/70">{lab.alats_count} {t('alat', 'equipment')}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-slate-50 py-16 dark:bg-slate-900/50">
                <div className="mx-auto max-w-3xl px-4">
                    <div className="mb-12 text-center">
                        <h2 className="text-2xl font-bold md:text-3xl">{t('Cara Penggunaan', 'How It Works')}</h2>
                        <p className="mx-auto mt-2 max-w-xl text-slate-500 dark:text-slate-400">
                            {t('Alur peminjaman alat yang mudah dan transparan.', 'Easy and transparent equipment lending flow.')}
                        </p>
                    </div>
                    <div className="relative">
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-indigo-200 dark:bg-indigo-800" />
                        {steps.map((step) => {
                            const Icon = step.icon;
                            return (
                                <div key={step.key} className="relative mb-10 flex gap-6 last:mb-0">
                                    <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg ring-4 ring-slate-50 dark:ring-slate-900">
                                        <Icon className="h-6 w-6" />
                                        <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300">
                                            {step.key}
                                        </span>
                                    </div>
                                    <div className="flex-1 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{step.label}</h3>
                                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{step.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {isEnabled('faq') && (
                <section className="bg-slate-50 py-16 dark:bg-slate-900/50">
                    <div className="mx-auto max-w-3xl px-4">
                        <div className="mb-10 text-center">
                            <h2 className="text-2xl font-bold md:text-3xl">{t('Pertanyaan Umum', 'Common Questions')}</h2>
                        </div>
                        <div className="space-y-4">
                            {faqs.map((faq, idx) => (
                                <div
                                    key={idx}
                                    className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-shadow hover:shadow-sm dark:border-slate-800/80 dark:bg-slate-900"
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                        className="flex w-full items-center justify-between px-5 py-4 text-left font-medium"
                                    >
                                        {faq.q}
                                        <ChevronDown className={`h-5 w-5 text-indigo-600 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                                    </button>
                                    <div className={`grid transition-all duration-300 ${openFaq === idx ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                        <div className="overflow-hidden">
                                            <p className="border-t border-slate-200/80 px-5 py-4 text-sm text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
                                                {faq.a}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 text-center">
                            <Link href="/faq" className="text-sm font-medium text-indigo-600 hover:underline">
                                {t('Lihat Semua FAQ', 'View All FAQ')}
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            <section className="mx-auto max-w-7xl px-4 py-16">
                <div className="rounded-3xl bg-linear-to-br from-indigo-600 to-violet-600 px-6 py-12 text-center text-white shadow-2xl md:px-12">
                    <h2 className="text-2xl font-bold md:text-3xl">{t('Siap Memulai?', 'Ready to Start?')}</h2>
                    <p className="mx-auto mt-2 max-w-xl text-white/90">{t('Daftar sekarang dan kelola peminjaman alat laboratorium lebih mudah.', 'Register now and manage lab equipment lending more easily.')}</p>
                    <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
                        <Link href="/daftar" className="rounded-full bg-white px-6 py-2.5 font-semibold text-indigo-600 transition-transform hover:scale-105">
                            {t('Daftar', 'Register')}
                        </Link>
                        {isEnabled('kontak') && (
                            <Link href="/kontak" className="rounded-full border-2 border-white px-6 py-2.5 font-semibold text-white hover:bg-white/10">
                                {t('Hubungi Kami', 'Contact Us')}
                            </Link>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}
