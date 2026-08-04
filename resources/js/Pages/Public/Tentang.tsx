import { Head, Link, usePage } from '@inertiajs/react';
import { ExternalLink, FlaskConical, GraduationCap, Home, Lightbulb, Target, University, Building2 } from 'lucide-react';

interface TentangProps {
    tentang?: {
        tagline?: string;
        visi?: string;
        misi?: string;
    };
}

export default function Tentang({ tentang }: TentangProps) {
    const { features } = usePage().props as any;
    const isEnabled = (key: string) => !!features?.[key];
    const tagline = tentang?.tagline ?? 'Sistem informasi peminjaman dan manajemen inventaris alat laboratorium terintegrasi.';
    const visi = tentang?.visi ?? 'Menjadikan peminjaman alat laboratorium lebih transparan, efisien, dan terukur.';
    const misi = tentang?.misi ?? 'Memudahkan civitas akademika mengakses alat laboratorium secara daring dengan pelacakan status real-time.';

    const tim = [
        { nama: 'Admin ChemLOS', peran: 'Pengembang & Maintainer' },
        { nama: 'Laboran FTUI', peran: 'Pengelola Laboratorium' },
        { nama: 'Kepala Lab', peran: 'Verifikator & Pengawas' },
    ];

    const milestones = [
        { tahun: '2026', title: 'Perencanaan & Desain', desc: 'Mendesain arsitektur ChemLOS, melakukan analisis kebutuhan peminjaman alat, merancang database, dan menetapkan alur persetujuan berbasis peran.' },
        { tahun: '2026', title: 'Pengembangan Inti', desc: 'Mengimplementasikan manajemen alat, laboratorium, peminjaman multi-peran, notifikasi real-time, pelacakan kerusakan, dan dashboard analytics.' },
        { tahun: '2026', title: 'Pilot & Launch', desc: 'Melakukan uji coba pilot di lingkungan Departemen Teknik Kimia FTUI, menyempurnakan UX, dan meluncurkan resmi untuk civitas akademika.' },
    ];

    return (
        <>
            <Head title="Tentang" />
            <section className="bg-linear-to-br from-indigo-600 to-violet-700 py-16 text-white">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mb-3 flex items-center gap-2 text-sm text-white/80">
                        <Link href="/" className="flex items-center gap-1 hover:text-white hover:underline"><Home className="h-4 w-4" /> Beranda</Link>
                        <span>/</span>
                        <span className="text-white">Tentang</span>
                    </div>
                    <h1 className="text-3xl font-bold md:text-4xl">Tentang ChemLOS</h1>
                    <p className="mx-auto mt-3 max-w-2xl text-white/90 md:mx-0">{tagline}</p>
                </div>
            </section>

            <section className="mx-auto max-w-5xl px-4 py-16">
                <div className="grid gap-8 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                        <Target className="mb-4 h-8 w-8 text-indigo-600" />
                        <h2 className="text-xl font-bold">Visi</h2>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">{visi}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                        <Lightbulb className="mb-4 h-8 w-8 text-indigo-600" />
                        <h2 className="text-xl font-bold">Misi</h2>
                        <ol className="mt-2 list-decimal space-y-2 pl-5 text-slate-500 dark:text-slate-400">
                            {misi.split(/\n+/).filter(Boolean).map((item, i) => (
                                <li key={i} className="pl-2 text-sm leading-relaxed">{item.replace(/^\d+\.\s*/, '').trim()}</li>
                            ))}
                        </ol>
                    </div>
                </div>

                <div className="mt-16">
                    <h2 className="mb-6 text-center text-2xl font-bold">Tim Pengembang</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {tim.map((t) => (
                            <div key={t.nama} className="group rounded-2xl border border-slate-200/80 bg-white p-6 text-center transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800/80 dark:bg-slate-900">
                                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-2xl font-bold text-white shadow-md transition group-hover:scale-105">
                                    {t.nama?.trim().split(/\s+/).filter(Boolean).map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() || 'NA'}
                                </div>
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t.nama}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{t.peran}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-16">
                    <h2 className="mb-8 text-center text-2xl font-bold">Perjalanan Kami</h2>
                    <div className="relative">
                        <div className="absolute top-8 left-0 hidden h-0.5 w-full bg-indigo-100 dark:bg-indigo-900/30 md:block" />
                        <div className="grid gap-6 sm:grid-cols-3">
                            {milestones.map((m, i) => (
                                <div key={i} className="relative text-center">
                                    <span className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-md">{m.tahun}</span>
                                    <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">{m.title}</h3>
                                    <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500 dark:text-slate-400">{m.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-16">
                    <h2 className="mb-6 text-center text-2xl font-bold">Didukung Oleh</h2>
                    <div className="grid gap-4 sm:grid-cols-3">
                        {[
                            { name: 'Departemen Teknik Kimia', sub: 'Fakultas Teknik UI', url: 'https://che.ui.ac.id/', icon: FlaskConical },
                            { name: 'Fakultas Teknik', sub: 'Universitas Indonesia', url: 'https://eng.ui.ac.id/', icon: Building2 },
                            { name: 'Universitas Indonesia', sub: 'Pendidikan & Riset', url: 'https://www.ui.ac.id/', icon: University },
                        ].map((m) => (
                            <a
                                key={m.url}
                                href={m.url}
                                target="_blank"
                                rel="noreferrer"
                                className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-6 text-center transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800/80 dark:bg-slate-900"
                            >
                                <m.icon className="h-10 w-10 text-indigo-600 transition group-hover:scale-110" />
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{m.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{m.sub}</p>
                                </div>
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600">
                                    Kunjungi Website <ExternalLink className="h-3 w-3" />
                                </span>
                            </a>
                        ))}
                    </div>
                </div>

                {isEnabled('kontak') && (
                    <div className="mt-16 text-center">
                        <Link href="/kontak" className="rounded-full bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-700">
                            Ada Pertanyaan? Hubungi Kami
                        </Link>
                    </div>
                )}
            </section>
        </>
    );
}
