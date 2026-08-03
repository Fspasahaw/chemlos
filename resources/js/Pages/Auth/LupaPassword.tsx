import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { AlertCircle, ArrowLeft, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/Components/Button';
import { Input } from '@/Components/Input';
import { useLang } from '@/Providers/LanguageProvider';
import { useRecaptcha } from '@/Hooks/useRecaptcha';

export default function LupaPassword() {
    const { recaptcha } = usePage().props as any;
    const { t } = useLang();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const { getToken } = useRecaptcha(recaptcha?.enabled ? recaptcha?.site_key : undefined);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setErrors({});
        setLoading(true);
        try {
            const recaptchaToken = await getToken('forgot_password');
            await axios.post('/api/v1/auth/forgot-password', { email, recaptcha_token: recaptchaToken });
            setMessage(t('Jika email terdaftar, link reset password telah dikirim.', 'If the email is registered, a reset link has been sent.'));
            setEmail('');
        } catch (err: any) {
            const response = err.response?.data;
            if (response?.errors) {
                const mapped: Record<string, string> = {};
                Object.entries(response.errors).forEach(([k, v]) => {
                    mapped[k] = Array.isArray(v) ? v[0] : (v as string);
                });
                setErrors(mapped);
                setError(response.message || t('Periksa kembali email Anda.', 'Please check your email.'));
            } else {
                setError(response?.message || t('Terjadi kesalahan.', 'Something went wrong.'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head title={t('Lupa Password', 'Forgot Password')} />
            <div className="mb-6 text-center">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
                    <Lock className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold">{t('Lupa Password', 'Forgot Password')}</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {t('Masukkan email Anda untuk menerima link reset password.', 'Enter your email to receive a reset link.')}
                </p>
            </div>

            {message && (
                <div className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-300">
                    {message}
                </div>
            )}
            {error && (
                <div className="mb-4 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <Input
                    type="email"
                    label="Email"
                    leftIcon={<Mail className="h-4 w-4" />}
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((err) => ({ ...err, email: '' }));
                    }}
                    error={errors.email}
                    required
                />
                <Button type="submit" variant="primary" isLoading={loading} className="w-full rounded-full py-3">
                    {t('Kirim Link Reset', 'Send Reset Link')}
                </Button>
            </form>

            <Link
                href="/login"
                className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400"
            >
                <ArrowLeft className="h-4 w-4" /> {t('Kembali ke Login', 'Back to Login')}
            </Link>
        </>
    );
}
