import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, FlaskConical, Globe, HelpCircle, Home, LayoutDashboard, LogOut, Menu, Moon, Settings, Sun, User, Wrench, X } from 'lucide-react';
import { Avatar } from '../Components/Avatar';
import { FlashToast } from '../Components/FlashToast';
import { ImageWithFallback } from '../Components/ImageWithFallback';
import { PublicBreadcrumb } from '../Components/PublicBreadcrumb';
import { Tooltip } from '../Components/Tooltip';
import { DropdownMenu } from '../Components/DropdownMenu';
import { NotificationBell } from '../Components/NotificationBell';
import { useReducedMotion } from '../Hooks/useReducedMotion';
import { useLang } from '../Providers/LanguageProvider';
import { useTheme } from '../Providers/ThemeProvider';
import { useEffect, useState } from 'react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const page = usePage();
    const { auth, settings, features } = page.props as any;
    const { resolvedTheme, setTheme } = useTheme();
    const { lang, setLang, t } = useLang();
    const reducedMotion = useReducedMotion();
    const isEnabled = (key: string) => !!features?.[key];
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const navLinks = [
        { href: '/', label: t('Beranda', 'Home') },
        { href: '/laboratorium', label: t('Laboratorium', 'Laboratories') },
        { href: '/alat', label: t('Alat', 'Equipment') },
        { href: '/tutorial', label: t('Tutorial', 'Tutorials'), feature: 'video_tutorial' },
        { href: '/tentang', label: t('Tentang', 'About') },
        { href: '/faq', label: 'FAQ', feature: 'faq' },
        { href: '/kontak', label: t('Kontak', 'Contact'), feature: 'kontak' },
    ].filter((item) => (item.feature ? isEnabled(item.feature) : true));

    const socials = [
        { key: 'umum.social_facebook', icon: Globe, label: 'Facebook' },
        { key: 'umum.social_instagram', icon: Globe, label: 'Instagram' },
        { key: 'umum.social_youtube', icon: Globe, label: 'YouTube' },
        { key: 'umum.social_twitter', icon: Globe, label: 'X' },
    ].map((s) => ({ ...s, url: settings?.[s.key] }));

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 transition-colors">
            <header className={`sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur transition-shadow dark:border-slate-800/80 dark:bg-slate-900/80 ${scrolled ? 'shadow-lg' : ''}`}>
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <FlaskConical className="h-7 w-7 text-indigo-600" />
                        <span className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">ChemLOS</span>
                    </Link>
                    <nav className="hidden items-center gap-5 text-sm font-medium lg:flex">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="hover:text-indigo-600 transition-colors">
                                {link.label}
                            </Link>
                        ))}
                        {auth?.user ? (
                            <Link href="/dashboard" className="rounded-full bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 transition-colors">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="hover:text-indigo-600 transition-colors">{t('Login', 'Login')}</Link>
                                <Link href="/daftar" className="rounded-full bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 transition-colors">{t('Daftar', 'Register')}</Link>
                            </>
                        )}
                    </nav>
                    <div className="flex items-center gap-2">
                        {auth?.user && (
                            <>
                                <NotificationBell />
                                <DropdownMenu
                                    align="right"
                                    trigger={
                                        <Tooltip content={auth.user.nama_lengkap}>
                                            <Avatar src={auth.user.avatar} name={auth.user.nama_lengkap} alt={auth.user.nama_lengkap} size="sm" className="cursor-pointer" />
                                        </Tooltip>
                                    }
                                    items={[
                                        { label: t('Profil', 'Profile'), href: '/profil', icon: <User className="h-4 w-4" /> },
                                        { label: t('Dashboard', 'Dashboard'), href: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
                                        { label: t('Logout', 'Logout'), href: '/logout', method: 'post', icon: <LogOut className="h-4 w-4" />, variant: 'danger' },
                                    ]}
                                />
                            </>
                        )}
                        <Tooltip content={t('Ganti Bahasa', 'Change Language')}>
                            <button
                                onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
                                className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                                aria-label={t('Ganti Bahasa', 'Change Language')}
                            >
                                <Globe className="h-5 w-5" />
                                <span className="sr-only">{lang.toUpperCase()}</span>
                            </button>
                        </Tooltip>
                        <Tooltip content={resolvedTheme === 'dark' ? t('Mode Terang', 'Light Mode') : t('Mode Gelap', 'Dark Mode')}>
                            <button onClick={toggleTheme} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label={t('Ganti Tema', 'Toggle Theme')}>
                                {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>
                        </Tooltip>
                        <Tooltip content={t('Menu', 'Menu')}>
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="relative h-9 w-9 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
                                aria-label="Menu"
                                aria-expanded={mobileOpen}
                            >
                                <AnimatePresence mode="wait">
                                    {mobileOpen ? (
                                        <motion.div
                                            key="close"
                                            initial={{ rotate: -90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: 90, opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            <X className="h-5 w-5" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="menu"
                                            initial={{ rotate: 90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: -90, opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            <Menu className="h-5 w-5" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>
                        </Tooltip>
                    </div>
                </div>

                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: '100%' }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: '100%' }}
                            transition={{ type: 'tween', duration: 0.25 }}
                            className="fixed inset-y-0 right-0 z-[55] w-72 border-l border-slate-200/80 bg-white/95 px-4 py-20 shadow-2xl backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/95 lg:hidden"
                        >
                            <nav className="flex flex-col gap-3 text-sm font-medium">
                                {navLinks.map((link) => (
                                    <Link key={link.href} href={link.href} className="rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>
                                        {link.label}
                                    </Link>
                                ))}
                                {auth?.user ? (
                                    <>
                                        <Link href="/notifikasi" className="rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>{t('Notifikasi', 'Notifications')}</Link>
                                        <Link href="/profil" className="rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>{t('Profil', 'Profile')}</Link>
                                        <Link href="/dashboard" className="rounded-lg bg-indigo-600 px-3 py-2 text-center text-white hover:bg-indigo-700" onClick={() => setMobileOpen(false)}>
                                            Dashboard
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login" className="rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>{t('Login', 'Login')}</Link>
                                        <Link href="/daftar" className="rounded-lg bg-indigo-600 px-3 py-2 text-center text-white hover:bg-indigo-700" onClick={() => setMobileOpen(false)}>{t('Daftar', 'Register')}</Link>
                                    </>
                                )}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <FlashToast />
            <PublicBreadcrumb />
            <main key={page.url} className={`flex-1 pb-16 lg:pb-0 ${reducedMotion ? '' : 'animate-fade-in-up'}`}>{children}</main>

            <footer className="border-t border-slate-200/80 bg-white py-12 dark:border-slate-800/80 dark:bg-slate-900">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <div className="flex items-center gap-2 font-bold text-lg">
                                <FlaskConical className="h-6 w-6 text-indigo-600" />
                                <span className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">ChemLOS</span>
                            </div>
                            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{settings?.['umum.deskripsi_aplikasi'] || t('Sistem manajemen laboratorium terintegrasi.', 'Integrated laboratory management system.')}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">{t('Menu Cepat', 'Quick Menu')}</h3>
                            <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
                                {navLinks.map((link) => (
                                    <li key={link.href}><Link href={link.href} className="hover:text-indigo-600">{link.label}</Link></li>
                                ))}
                            </ul>
                        </div>
                        {isEnabled('kontak') && (
                            <div>
                                <h3 className="font-semibold">{t('Kontak', 'Contact')}</h3>
                                <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
                                    <li>{settings?.['umum.email_kontak'] || '—'}</li>
                                    <li>+{settings?.['umum.nomor_whatsapp_admin'] || '—'}</li>
                                    <li>{settings?.['umum.alamat_institusi'] ? (settings['umum.alamat_institusi'] as string).split(',')[0] : '—'}</li>
                                </ul>
                            </div>
                        )}
                        <div>
                            <h3 className="font-semibold">{t('Legal', 'Legal')}</h3>
                            <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
                                <li><Link href="/syarat-ketentuan" className="hover:text-indigo-600">{t('Syarat & Ketentuan', 'Terms')}</Link></li>
                                <li><Link href="/kebijakan-privasi" className="hover:text-indigo-600">{t('Kebijakan Privasi', 'Privacy')}</Link></li>
                            </ul>
                            <h3 className="mt-6 font-semibold">{t('Ikuti Kami', 'Follow Us')}</h3>
                            {socials.some((s) => s.url) ? (
                                <div className="mt-3 flex gap-3">
                                    {socials.filter((s) => s.url).map((s) => (
                                        <a key={s.key} href={s.url} target="_blank" rel="noreferrer" aria-label={s.label} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-indigo-100 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300">
                                            <s.icon className="h-4 w-4" />
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{t('Belum tersedia.', 'Not available.')}</p>
                            )}
                        </div>
                    </div>
                    <div className="mt-10 border-t border-slate-200/80 pt-6 text-center text-xs text-slate-400 dark:border-slate-800/80 dark:text-slate-500">
                        &copy; {new Date().getFullYear()} {settings?.['umum.nama_institusi'] || 'ChemLOS'}. {t('Chemical Laboratory Online System.', 'Chemical Laboratory Online System.')}
                    </div>
                </div>
            </footer>

            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/95 pb-safe backdrop-blur lg:hidden dark:border-slate-800/80 dark:bg-slate-900/95">
                <div className="flex items-center justify-around">
                    {[
                        { href: '/', label: 'Beranda', icon: Home },
                        { href: '/laboratorium', label: t('Laboratorium', 'Labs'), icon: FlaskConical },
                        { href: '/alat', label: t('Alat', 'Tools'), icon: Wrench },
                        { href: '/tutorial', label: 'Tutorial', icon: BookOpen, feature: 'video_tutorial' },
                        { href: '/faq', label: 'FAQ', icon: HelpCircle, feature: 'faq' },
                    ].filter((item) => (item.feature ? isEnabled(item.feature) : true)).map((item) => {
                        const current = page.url || '/';
                        const active = item.href === '/' ? current === '/' : current.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-label={item.label}
                                className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition ${
                                    active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                                }`}
                                preserveScroll
                            >
                                <item.icon className="h-5 w-5" aria-hidden="true" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                    {auth?.user && (
                        <Link href="/dashboard" aria-label={t('Dashboard', 'Dashboard')} className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-slate-500 transition dark:text-slate-400" preserveScroll>
                            <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
                            <span>Dashboard</span>
                        </Link>
                    )}
                </div>
            </nav>
        </div>
    );
}
