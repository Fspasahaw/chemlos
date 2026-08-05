import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { FlaskConical, Globe, Moon, Sun } from 'lucide-react';
import { useEffect } from 'react';
import { FlashToast } from '../Components/FlashToast';
import { useReducedMotion } from '../Hooks/useReducedMotion';
import { useLang } from '../Providers/LanguageProvider';
import { useTheme } from '../Providers/ThemeProvider';

export default function GuestLayout({ children }: { children: React.ReactNode }) {
    const { resolvedTheme, setTheme } = useTheme();
    const { lang, setLang, t } = useLang();
    const reducedMotion = useReducedMotion();
    const { auth, settings } = usePage().props as any;

    useEffect(() => {
        if (!auth?.user && typeof window !== 'undefined') {
            const stale = localStorage.getItem('token');
            if (stale) {
                localStorage.removeItem('token');
                delete axios.defaults.headers.common.Authorization;
            }
        }
    }, [auth?.user]);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors md:flex-row dark:bg-slate-900 dark:text-slate-100">
            <div className="relative flex flex-1 flex-col items-center justify-center bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-12 text-white md:px-12">
                <div className="absolute inset-0 opacity-20">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <circle cx="20" cy="20" r="40" fill="url(#guestGrad1)" />
                        <circle cx="80" cy="80" r="30" fill="url(#guestGrad2)" />
                        <defs>
                            <radialGradient id="guestGrad1" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                            </radialGradient>
                            <radialGradient id="guestGrad2" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                            </radialGradient>
                        </defs>
                    </svg>
                </div>

                <Link
                    href="/"
                    className={`relative z-10 mb-12 flex h-32 w-32 items-center justify-center rounded-full bg-white/10 p-6 shadow-2xl ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/20 hover:scale-105 md:h-40 md:w-40 ${reducedMotion ? '' : 'animate-[float_4s_ease-in-out_infinite]'}`}
                    aria-label="Ke Beranda"
                >
                    <FlaskConical className="h-16 w-16 md:h-24 md:w-24" strokeWidth={1.2} />
                </Link>

                <div className="absolute right-4 top-4 flex gap-2">
                    <button
                        onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
                        className="rounded-full bg-white/10 p-2.5 backdrop-blur transition hover:bg-white/20"
                        aria-label={t('Ganti Bahasa', 'Change Language')}
                    >
                        <Globe className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                        className="rounded-full bg-white/10 p-2.5 backdrop-blur transition hover:bg-white/20"
                        aria-label={t('Ganti Tema', 'Toggle Theme')}
                    >
                        {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                </div>

                <div className="relative z-10 max-w-md text-center md:text-left">
                    <div className="mb-6 flex items-center justify-center gap-3 md:justify-start">
                        <FlaskConical className="h-10 w-10 md:h-12 md:w-12" />
                        <span className="text-2xl font-bold md:text-3xl">ChemLOS</span>
                    </div>
                    <h1 className="mb-4 text-3xl font-bold leading-tight md:text-4xl">Chemical Laboratory Online System</h1>
                    <p className="text-white/80">{t('Sistem manajemen inventaris dan peminjaman alat laboratorium terintegrasi.', 'Integrated inventory and laboratory equipment lending management system.')}</p>
                </div>
            </div>

            <div className="flex flex-1 flex-col">
                <div className="flex flex-1 items-center justify-center px-4 py-8 md:px-8">
                    <FlashToast />
                    <div className={`w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-2xl backdrop-blur dark:border-slate-700/50 dark:bg-slate-900/90 ${reducedMotion ? '' : 'animate-fade-in-up'}`}>
                        {children}
                    </div>
                </div>
                <footer className="border-t border-slate-200/80 bg-white/95 py-4 text-center text-xs text-slate-400 dark:border-slate-800/80 dark:bg-slate-900/95 dark:text-slate-500">
                    &copy; {new Date().getFullYear()} {settings?.['umum.nama_institusi'] || 'Departemen Teknik Kimia, Fakultas Teknik, Universitas Indonesia'}. {t('Chemical Laboratory Online System.', 'Chemical Laboratory Online System.')}
                </footer>
            </div>
        </div>
    );
}
