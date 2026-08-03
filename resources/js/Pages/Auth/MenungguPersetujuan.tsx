import { Head, Link, usePage } from '@inertiajs/react';
import { Clock } from 'lucide-react';
import { useLang } from '@/Providers/LanguageProvider';

export default function MenungguPersetujuan() {
    const { settings } = usePage().props as any;
    const { t } = useLang();
    const wa = settings?.['umum.nomor_whatsapp_admin'] || '6281234567890';
    const whatsappText = encodeURIComponent(t('Halo, saya menunggu persetujuan akun ChemLOS. Mohon informasi statusnya.', 'Hello, I am waiting for my ChemLOS account approval. Please update me on the status.'));
    return (
        <>
            <Head title={t('Menunggu Persetujuan', 'Awaiting Approval')} />
            <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20">
                    <Clock className="h-12 w-12" />
                </div>
                <h1 className="mb-2 text-2xl font-bold">{t('Menunggu Persetujuan', 'Awaiting Approval')}</h1>
                <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                    {t('Akun Anda sedang ditinjau oleh admin. Anda akan menerima notifikasi setelah disetujui.', 'Your account is being reviewed by admin. You will receive a notification once approved.')}
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
