import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { AlertCircle, ArrowLeft, Check, Eye, EyeOff, Lock } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/Components/Button';
import { Input } from '@/Components/Input';
import PasswordIndicator from '@/Components/PasswordIndicator';
import { useLang } from '@/Providers/LanguageProvider';
import { useRecaptcha } from '@/Hooks/useRecaptcha';

export default function ResetPassword() {
    const { token, recaptcha } = usePage().props as any;
    const { t } = useLang();
    const { getToken } = useRecaptcha(recaptcha?.enabled ? recaptcha?.site_key : undefined);
    const [form, setForm] = useState({ token, email: '', password: '', password_confirmation: '' });
    const [show, setShow] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleChange = (field: string, value: string) => {
        setForm((f) => ({ ...f, [field]: value }));
        setErrors((e) => ({ ...e, [field]: '' }));
        setError('');
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setErrors({});
        if (form.password !== form.password_confirmation) {
            setErrors({ password_confirmation: t('Konfirmasi password tidak cocok.', 'Password confirmation does not match.') });
            return;
        }
        setLoading(true);
        try {
            const recaptchaToken = await getToken('reset_password');
            const { data } = await axios.post('/api/v1/auth/reset-password', { ...form, recaptcha_token: recaptchaToken });
            if (data.success) {
                setMessage(t('Password berhasil direset. Silakan masuk.', 'Password reset successful. Please sign in.'));
                setDone(true);
                setTimeout(() => router.visit('/login'), 2000);
            } else {
                setError(data.message || t('Gagal reset password.', 'Failed to reset password.'));
            }
        } catch (err: any) {
            const response = err.response?.data;
            if (response?.errors) {
                const mapped: Record<string, string> = {};
                Object.entries(response.errors).forEach(([k, v]) => {
                    mapped[k] = Array.isArray(v) ? v[0] : (v as string);
                });
                setErrors(mapped);
                setError(response.message || t('Periksa kembali data Anda.', 'Please check your input.'));
            } else {
                setError(response?.message || t('Terjadi kesalahan.', 'Something went wrong.'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head title={t('Reset Password', 'Reset Password')} />
            <div className="mb-6 text-center">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
                    <Lock className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold">{t('Reset Password', 'Reset Password')}</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {t('Buat password baru untuk akun Anda.', 'Create a new password for your account.')}
                </p>
            </div>

            {message && (
                <div className="mb-4 flex items-start gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" />
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
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    error={errors.email}
                    required
                />
                <div>
                    <Input
                        type={show ? 'text' : 'password'}
                        label={t('Password Baru', 'New Password')}
                        leftIcon={<Lock className="h-4 w-4" />}
                        value={form.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        error={errors.password}
                        rightIcon={
                            <button type="button" onClick={() => setShow(!show)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        }
                        required
                    />
                    {form.password && <PasswordIndicator password={form.password} />}
                </div>
                <Input
                    type={showConfirm ? 'text' : 'password'}
                    label={t('Konfirmasi Password Baru', 'Confirm New Password')}
                    leftIcon={<Lock className="h-4 w-4" />}
                    value={form.password_confirmation}
                    onChange={(e) => handleChange('password_confirmation', e.target.value)}
                    error={errors.password_confirmation}
                    rightIcon={
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    }
                    required
                />
                <Button type="submit" variant="primary" isLoading={loading} disabled={done} className="w-full rounded-full py-3">
                    {done ? (
                        <>
                            <Check className="h-4 w-4" /> {t('Selesai', 'Done')}
                        </>
                    ) : (
                        t('Reset Password', 'Reset Password')
                    )}
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
