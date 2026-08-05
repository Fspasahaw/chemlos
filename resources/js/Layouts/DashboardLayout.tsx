import { Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Beaker,
    Bell,
    ClipboardCheck,
    ClipboardList,
    FileText,
    FlaskConical,
    Globe,
    GraduationCap,
    HardDriveDownload,
    Home,
    LogOut,
    Mail,
    Menu,
    Moon,
    MoreHorizontal,
    Package,
    Settings,
    Shield,
    Sun,
    User,
    UserCheck,
    Users,
    Video,
    Wrench,
} from 'lucide-react';
import { Avatar } from '../Components/Avatar';
import { DropdownMenu } from '../Components/DropdownMenu';
import { FlashToast } from '../Components/FlashToast';
import { DashboardBreadcrumb } from '../Components/DashboardBreadcrumb';
import { NotificationBell } from '../Components/NotificationBell';
import { Tooltip } from '../Components/Tooltip';
import { useReducedMotion } from '../Hooks/useReducedMotion';
import { useLang } from '../Providers/LanguageProvider';
import { useTheme } from '../Providers/ThemeProvider';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { auth, settings } = usePage().props as any;
    const { resolvedTheme, setTheme } = useTheme();
    const { lang, setLang, t } = useLang();
    const reducedMotion = useReducedMotion();
    const [open, setOpen] = useState(false);
    const { features } = usePage().props as any;
    const isEnabled = (key: string) => !!features?.[key];

    const allRoles = auth?.user?.roles ?? [];
    const role = auth?.user?.active_role ?? allRoles[0]?.name ?? 'guest';

    const settingsUrlByRole: Record<string, string | null> = {
        admin: '/dashboard/admin/pengaturan',
        pimpinan: '/dashboard/pimpinan/pengaturan',
        kepala_lab: null,
        laboran: null,
        dosen: null,
        mahasiswa: null,
    };
    const settingsUrl = isEnabled('pengaturan') ? (settingsUrlByRole[role] ?? null) : null;

    const roleIcons: Record<string, any> = {
        admin: Users,
        pimpinan: Shield,
        kepala_lab: FlaskConical,
        laboran: Wrench,
        dosen: GraduationCap,
        mahasiswa: User,
    };

    const roleLabels: Record<string, string> = {
        admin: 'Admin',
        pimpinan: t('Pimpinan', 'Leader'),
        kepala_lab: t('Kepala Lab', 'Lab Head'),
        laboran: t('Laboran', 'Lab Assistant'),
        dosen: t('Dosen', 'Lecturer'),
        mahasiswa: t('Mahasiswa', 'Student'),
    };

    const base = [
        { href: '/dashboard', icon: Home, label: t('Dashboard', 'Dashboard') },
        { href: '/notifikasi', icon: Bell, label: t('Notifikasi', 'Notifications') },
        { href: '/profil', icon: User, label: t('Profil', 'Profile') },
    ];

    const admin = [
        { href: '/dashboard/admin/program-studi', icon: GraduationCap, label: t('Program Studi', 'Programs') },
        { href: '/dashboard/admin/laboratorium', icon: FlaskConical, label: t('Laboratorium', 'Laboratories') },
        { href: '/dashboard/admin/kategori-alat', icon: Beaker, label: t('Kategori Alat', 'Categories') },
        { href: '/dashboard/admin/alat', icon: Package, label: t('Alat', 'Equipment') },
        { href: '/dashboard/admin/users', icon: Users, label: t('Pengguna', 'Users') },
        { href: '/dashboard/admin/verifikasi-akun', icon: UserCheck, label: t('Verifikasi Akun', 'Verifications') },
        { href: '/dashboard/admin/peminjaman', icon: ClipboardList, label: t('Peminjaman', 'Bookings') },
        { href: '/dashboard/admin/serah-terima', icon: ClipboardCheck, label: t('Serah Terima', 'Handover') },
        { href: '/dashboard/admin/pengembalian', icon: ClipboardList, label: t('Pengembalian', 'Returns') },
        { href: '/dashboard/admin/video-tutorial', icon: Video, label: t('Video Tutorial', 'Tutorials') },
        { href: '/dashboard/admin/kerusakan', icon: AlertTriangle, label: t('Kerusakan', 'Damage') },
        { href: '/dashboard/admin/maintenance', icon: Wrench, label: t('Perbaikan', 'Maintenance') },
        { href: '/dashboard/admin/laporan', icon: FileText, label: t('Laporan', 'Reports') },
        { href: '/dashboard/admin/audit-log', icon: Shield, label: t('Log Audit', 'Audit Log') },
        { href: '/dashboard/admin/pesan-kontak', icon: Mail, label: t('Pesan Kontak', 'Contact Messages') },
        { href: '/dashboard/admin/backup', icon: HardDriveDownload, label: t('Cadangan', 'Backup') },
        { href: '/dashboard/admin/pengaturan', icon: Settings, label: t('Pengaturan', 'Settings') },
    ].filter((item) => {
        if (item.href === '/dashboard/admin/video-tutorial') return isEnabled('video_tutorial');
        if (item.href === '/dashboard/admin/pesan-kontak') return isEnabled('pesan_kontak');
        if (item.href === '/dashboard/admin/backup') return isEnabled('cadangan');
        if (item.href === '/dashboard/admin/pengaturan') return isEnabled('pengaturan');
        return true;
    });

    const pimpinan = [
        { href: '/dashboard/pimpinan', icon: Home, label: t('Dashboard Pimpinan', 'Leader Dashboard') },
        { href: '/dashboard/pimpinan/pengguna', icon: Users, label: t('Pengguna', 'Users') },
        { href: '/dashboard/pimpinan/program-studi', icon: GraduationCap, label: t('Program Studi', 'Programs') },
        { href: '/dashboard/pimpinan/laboratorium', icon: FlaskConical, label: t('Laboratorium', 'Laboratories') },
        { href: '/dashboard/pimpinan/alat', icon: Package, label: t('Alat', 'Equipment') },
        { href: '/dashboard/pimpinan/kerusakan', icon: AlertTriangle, label: t('Kerusakan', 'Damage') },
        { href: '/dashboard/pimpinan/maintenance', icon: Wrench, label: t('Perbaikan', 'Maintenance') },
        { href: '/dashboard/pimpinan/peminjaman', icon: ClipboardList, label: t('Peminjaman', 'Bookings') },
        { href: '/dashboard/pimpinan/pengembalian', icon: ClipboardCheck, label: t('Pengembalian', 'Returns') },
        { href: '/dashboard/pimpinan/laporan', icon: FileText, label: t('Laporan', 'Reports') },
        { href: '/dashboard/pimpinan/audit-log', icon: Shield, label: t('Log Audit', 'Audit Log') },
        { href: '/dashboard/pimpinan/pengaturan', icon: Settings, label: t('Pengaturan', 'Settings') },
        { href: '/notifikasi', icon: Bell, label: t('Notifikasi', 'Notifications') },
        { href: '/profil', icon: User, label: t('Profil', 'Profile') },
    ].filter((item) => {
        if (item.href === '/dashboard/pimpinan/pengaturan') return isEnabled('pengaturan');
        return true;
    });

    const kepala_lab = [
        { href: '/dashboard/kepala-lab', icon: Home, label: t('Dashboard Kepala Lab', 'Lab Head Dashboard') },
        { href: '/dashboard/kepala-lab/laboratorium', icon: FlaskConical, label: t('Laboratorium', 'Laboratories') },
        { href: '/dashboard/kepala-lab/alat', icon: Package, label: t('Alat', 'Equipment') },
        { href: '/dashboard/kepala-lab/kerusakan', icon: AlertTriangle, label: t('Kerusakan', 'Damage') },
        { href: '/dashboard/kepala-lab/maintenance', icon: Wrench, label: t('Perbaikan', 'Maintenance') },
        { href: '/dashboard/kepala-lab/peminjaman', icon: ClipboardCheck, label: t('Peminjaman', 'Bookings') },
        { href: '/dashboard/kepala-lab/pengembalian', icon: ClipboardList, label: t('Pengembalian', 'Returns') },
        { href: '/dashboard/kepala-lab/laporan', icon: FileText, label: t('Laporan', 'Reports') },
        { href: '/notifikasi', icon: Bell, label: t('Notifikasi', 'Notifications') },
        { href: '/profil', icon: User, label: t('Profil', 'Profile') },
    ];

    const laboran = [
        { href: '/dashboard/laboran', icon: Home, label: t('Dashboard Laboran', 'Lab Assistant Dashboard') },
        { href: '/dashboard/laboran/verifikasi-akun', icon: UserCheck, label: t('Verifikasi Akun', 'Account Verification') },
        { href: '/dashboard/laboran/pengguna', icon: Users, label: t('Pengguna', 'Users') },
        { href: '/dashboard/laboran/laboratorium', icon: FlaskConical, label: t('Laboratorium', 'Laboratories') },
        { href: '/dashboard/laboran/alat', icon: Package, label: t('Alat', 'Equipment') },
        { href: '/dashboard/laboran/peminjaman', icon: ClipboardCheck, label: t('Peminjaman', 'Bookings') },
        { href: '/dashboard/laboran/serah-terima', icon: Package, label: t('Serah Terima', 'Handover') },
        { href: '/dashboard/laboran/pengembalian', icon: ClipboardList, label: t('Pengembalian', 'Returns') },
        { href: '/dashboard/laboran/kerusakan', icon: AlertTriangle, label: t('Kerusakan', 'Damage') },
        { href: '/dashboard/laboran/maintenance', icon: Wrench, label: t('Perbaikan', 'Maintenance') },
        { href: '/dashboard/laboran/laporan', icon: FileText, label: t('Laporan', 'Reports') },
        { href: '/notifikasi', icon: Bell, label: t('Notifikasi', 'Notifications') },
        { href: '/profil', icon: User, label: t('Profil', 'Profile') },
    ];

    const dosen = [
        { href: '/dashboard/dosen', icon: Home, label: t('Dashboard Dosen', 'Lecturer Dashboard') },
        { href: '/dashboard/dosen/peminjaman', icon: ClipboardCheck, label: t('Peminjaman', 'Bookings') },
        { href: '/dashboard/dosen/kerusakan', icon: AlertTriangle, label: t('Kerusakan', 'Damage') },
        { href: '/dashboard/dosen/pengembalian', icon: ClipboardList, label: t('Pengembalian', 'Returns') },
        { href: '/dashboard/dosen/laporan', icon: FileText, label: t('Laporan', 'Reports') },
        { href: '/notifikasi', icon: Bell, label: t('Notifikasi', 'Notifications') },
        { href: '/profil', icon: User, label: t('Profil', 'Profile') },
    ];

    const mahasiswa = [
        { href: '/dashboard/mahasiswa', icon: Home, label: t('Dashboard Mahasiswa', 'Student Dashboard') },
        { href: '/dashboard/mahasiswa/peminjaman', icon: ClipboardList, label: t('Peminjaman', 'Bookings') },
        { href: '/dashboard/mahasiswa/kerusakan', icon: AlertTriangle, label: t('Kerusakan', 'Damage') },
        { href: '/dashboard/mahasiswa/pengembalian', icon: ClipboardList, label: t('Pengembalian', 'Returns') },
        { href: '/dashboard/mahasiswa/laporan', icon: FileText, label: t('Laporan', 'Reports') },
        { href: '/notifikasi', icon: Bell, label: t('Notifikasi', 'Notifications') },
        { href: '/profil', icon: User, label: t('Profil', 'Profile') },
    ];

    const menuByRole: Record<string, any[]> = {
        admin: [...base, ...admin],
        pimpinan,
        kepala_lab,
        laboran,
        dosen,
        mahasiswa,
    };

    const menuItems = menuByRole[role] ?? base;

    const { url } = usePage();
    const isActive = (href: string) => url.startsWith(href);

    const userDropdownItems: any[] = [
        { label: t('Profil', 'Profile'), href: '/profil', icon: <User className="h-4 w-4" /> },
        { label: t('Dashboard', 'Dashboard'), href: '/dashboard', icon: <Home className="h-4 w-4" /> },
    ];

    if (allRoles.length > 1) {
        userDropdownItems.push({ variant: 'divider' });
        allRoles.forEach((r: any) => {
            if (r.name === role) return;
            const Icon = roleIcons[r.name] ?? User;
            userDropdownItems.push({
                label: t(`Beralih ke ${roleLabels[r.name]}`, `Switch to ${roleLabels[r.name]}`),
                href: '/switch-role',
                method: 'post',
                data: { role: r.name },
                icon: <Icon className="h-4 w-4" />,
            });
        });
    }

    if (settingsUrl) {
        userDropdownItems.push({ label: t('Pengaturan', 'Settings'), href: settingsUrl, icon: <Settings className="h-4 w-4" /> });
    }

    userDropdownItems.push(
        { label: t('Logout', 'Logout'), href: '/logout', method: 'post', icon: <LogOut className="h-4 w-4" />, variant: 'danger' }
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 transition-colors md:flex">
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200/80 bg-white transition-transform dark:border-slate-800/80 dark:bg-slate-900 md:static md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex h-16 items-center gap-2 border-b border-slate-200/80 px-6 dark:border-slate-800/80">
                    <FlaskConical className="h-6 w-6 text-indigo-600" />
                    <span className="font-bold">ChemLOS</span>
                </div>
                <nav className="space-y-1 p-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            aria-label={item.label}
                            className={`flex items-center gap-3 rounded-lg px-4 py-2 transition-colors ${
                                isActive(item.href)
                                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            <item.icon className="h-5 w-5" aria-hidden="true" /> {item.label}
                        </Link>
                    ))}
                    <Link href="/logout" method="post" as="button" aria-label={t('Logout', 'Logout')} className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800">
                        <LogOut className="h-5 w-5" aria-hidden="true" /> {t('Logout', 'Logout')}
                    </Link>
                </nav>
            </aside>

            <div className="flex flex-1 flex-col pb-20 md:pb-0">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/80 md:px-6">
                    <button onClick={() => setOpen(!open)} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden" aria-label="Menu">
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="ml-auto flex items-center gap-2 md:gap-3">
                        <NotificationBell />
                        <Tooltip content={t('Ganti Bahasa', 'Change Language')}>
                            <button onClick={() => setLang(lang === 'id' ? 'en' : 'id')} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label={t('Ganti Bahasa', 'Change Language')}>
                                <Globe className="h-5 w-5" />
                            </button>
                        </Tooltip>
                        <Tooltip content={resolvedTheme === 'dark' ? t('Mode Terang', 'Light Mode') : t('Mode Gelap', 'Dark Mode')}>
                            <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label={t('Ganti Tema', 'Toggle Theme')}>
                                {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>
                        </Tooltip>
                        <DropdownMenu
                            align="right"
                            trigger={
                                <div className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50 pl-1 pr-3 py-1 transition hover:bg-slate-100 dark:border-slate-700/80 dark:bg-slate-800 dark:hover:bg-slate-700">
                                    <Avatar src={auth?.user?.avatar} name={auth?.user?.nama_lengkap ?? 'Guest'} size="sm" />
                                    <span className="hidden text-sm font-medium md:inline">{auth?.user?.nama_lengkap ?? 'Guest'}</span>
                                </div>
                            }
                            items={userDropdownItems}
                        />
                    </div>
                </header>
                <FlashToast />
                <main key={url} className={`flex flex-1 flex-col p-4 md:p-6 ${reducedMotion ? '' : 'animate-fade-in-up'}`}>
                    <DashboardBreadcrumb />
                    <div className="flex-1 min-h-0">{children}</div>
                    <footer className="mt-6 border-t border-slate-200/80 pt-6 text-center text-xs text-slate-400 dark:border-slate-800/80 dark:text-slate-500">
                        &copy; {new Date().getFullYear()} {settings?.['umum.nama_institusi'] || 'Departemen Teknik Kimia, Fakultas Teknik, Universitas Indonesia'}. {t('Chemical Laboratory Online System.', 'Chemical Laboratory Online System.')}
                    </footer>
                </main>

                <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200/80 bg-white/95 px-2 pb-safe pt-1 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/95 md:hidden">
                    <div className="mx-auto flex max-w-md justify-around">
                        {menuItems.slice(0, 4).map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-label={item.label}
                                className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-medium transition-colors ${
                                    isActive(item.href) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                                }`}
                            >
                                <item.icon className="h-5 w-5" aria-hidden="true" />
                                <span className="truncate max-w-[4rem]">{item.label.split(' ')[0]}</span>
                            </Link>
                        ))}
                        <Link
                            href="/dashboard"
                            aria-label={t('Menu Lengkap', 'Full Menu')}
                            className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-medium transition-colors ${
                                isActive('/dashboard') ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                            }`}
                        >
                            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                            Menu
                        </Link>
                    </div>
                </nav>
            </div>
        </div>
    );
}
