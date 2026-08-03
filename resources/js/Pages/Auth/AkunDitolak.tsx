import { Head, Link, usePage } from '@inertiajs/react';
import { XCircle } from 'lucide-react';
import { useLang } from '@/Providers/LanguageProvider';

export default function AkunDitolak() {
    const { settings } = usePage().props as any;
    const { t } = useLang();
    const wa = settings?.['umum.nomor_whatsapp_admin'] || '6281234567890';
    const query = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const reason =
        query.get('reason') ||
        t('Akun Anda tidak memenuhi syarat pendaftaran ChemLOS.', 'Your account does not meet ChemLOS registration requirements.');
    const whatsappText = encodeURIComponent(t('Halo, akun ChemLOS saya ditolak. Mohon informasi lebih lanjut.', 'Hello, my ChemLOS account was rejected. Please provide more information.'));

    return (
        <>
            <Head title={t('Akun Ditolak', 'Account Rejected')} />
            <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-900/20">
                    <XCircle className="h-12 w-12" />
                </div>
                <h1 className="mb-2 text-2xl font-bold">{t('Akun Ditolak', 'Account Rejected')}</h1>
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{reason}</p>
                <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                    {t('Jika Anda merasa ini kesalahan, silakan hubungi admin dengan data pendukung.', 'If you believe this is a mistake, please contact admin with supporting data.')}
                </p>
                <a
                    href={`https://wa.me/${wa}?text=${whatsappText}`}
                    className="w-full rounded-lg bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-700"
                >
                    {t('Hubungi Admin', 'Contact Admin')}
                </a>
                <Link href="/" className="mt-4 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400">
                    {t('Kembali ke Beranda', 'Back to Home')}
                </Link>
            </div>
        </>
    );
}
