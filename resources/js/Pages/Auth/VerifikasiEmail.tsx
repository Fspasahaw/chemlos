import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { AlertCircle, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/Components/Button';
import { useLang } from '@/Providers/LanguageProvider';

export default function VerifikasiEmail() {
    const { email } = usePage().props as any;
    const { t } = useLang();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const resend = async () => {
        if (countdown > 0) return;
        setMessage('');
        setError('');
        setLoading(true);
        try {
            await axios.post('/api/v1/auth/resend-verification', { email });
            setMessage(t('Email verifikasi telah dikirim ulang.', 'Verification email has been resent.'));
            setCountdown(60);
        } catch (err: any) {
            setError(err.response?.data?.message || t('Terjadi kesalahan. Silakan login ulang jika belum masuk.', 'An error occurred.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head title={t('Verifikasi Email', 'Verify Email')} />
            <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
                    <Mail className="h-10 w-10" />
                </div>
                <h1 className="mb-2 text-2xl font-bold">{t('Verifikasi Email Anda', 'Verify Your Email')}</h1>
                <p className="mb-1 max-w-xs text-sm text-slate-500 dark:text-slate-400">
                    {t('Link verifikasi telah dikirim ke email Anda.', 'A verification link has been sent to your email.')}
                </p>
                {email && <p className="mb-4 text-sm font-medium text-indigo-600">{email}</p>}

                <div className="mb-6 rounded-xl bg-slate-50 p-4 text-left text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
                    <p>{t('Tips:', 'Tips:')}</p>
                    <ul className="ml-4 mt-1 list-disc space-y-1">
                        <li>{t('Cek folder inbox dan spam.', 'Check your inbox and spam folder.')}</li>
                        <li>{t('Pastikan email yang Anda masukkan benar.', 'Make sure the email address is correct.')}</li>
                        <li>{t('Setelah verifikasi, akun akan ditinjau admin.', 'After verification, your account will be reviewed.')}</li>
                    </ul>
                </div>

                {message && (
                    <div className="mb-4 w-full rounded-xl bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-300">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mb-4 flex w-full items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-300">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                <Button
                    onClick={resend}
                    disabled={loading || countdown > 0}
                    isLoading={loading}
                    className="w-full rounded-full py-3"
                >
                    {countdown > 0 ? `${t('Kirim ulang dalam', 'Resend in')} ${countdown}s` : t('Kirim Ulang Email Verifikasi', 'Resend Verification Email')}
                </Button>

                <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                    {t('Sudah memverifikasi?', 'Already verified?')}{' '}
                    <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
                        {t('Masuk', 'Sign in')}
                    </Link>
                </p>
            </div>
        </>
    );
}
