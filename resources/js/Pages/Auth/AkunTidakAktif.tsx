import { Head, Link, usePage } from '@inertiajs/react';
import { Lock } from 'lucide-react';
import { useLang } from '@/Providers/LanguageProvider';

export default function AkunTidakAktif() {
    const { settings } = usePage().props as any;
    const { t } = useLang();
    const wa = settings?.['umum.nomor_whatsapp_admin'] || '6281234567890';
    const whatsappText = encodeURIComponent(t('Halo, akun ChemLOS saya dinonaktifkan. Mohon bantuannya.', 'Hello, my ChemLOS account has been suspended. Please help.'));
    return (
        <>
            <Head title={t('Akun Tidak Aktif', 'Account Inactive')} />
            <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-900/20">
                    <Lock className="h-12 w-12" />
                </div>
                <h1 className="mb-2 text-2xl font-bold">{t('Akun Tidak Aktif', 'Account Inactive')}</h1>
                <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                    {t('Akun Anda dinonaktifkan. Hal ini bisa terkait pelanggaran atau Anda telah berstatus lulus.', 'Your account is suspended. This may be due to a violation or you have graduated.')}
                </p>
                <a
                    href={`https://wa.me/${wa}?text=${whatsappText}`}
                    className="w-full rounded-lg bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-700"
                >
                    {t('Kontak Admin', 'Contact Admin')}
                </a>
                <Link href="/" className="mt-4 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400">
                    {t('Kembali ke Beranda', 'Back to Home')}
                </Link>
            </div>
        </>
    );
}
