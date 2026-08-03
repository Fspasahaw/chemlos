import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { AlertCircle, Eye, EyeOff, FlaskConical, Lock, Mail, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/Components/Button';
import { Checkbox } from '@/Components/Checkbox';
import { Input } from '@/Components/Input';
import Modal from '@/Components/Modal';
import { useLang } from '@/Providers/LanguageProvider';
import { useRecaptcha } from '@/Hooks/useRecaptcha';

export default function Login() {
    const { flash, settings, recaptcha } = usePage().props as any;
    const success = flash?.success ?? '';
    const { t } = useLang();
    const [form, setForm] = useState({ email: '', password: '', remember: false });
    const [show, setShow] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [topError, setTopError] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusModal, setStatusModal] = useState<'pending' | 'rejected' | null>(null);
    const [modalReason, setModalReason] = useState('');
    const { getToken } = useRecaptcha(recaptcha?.enabled ? recaptcha?.site_key : undefined);

    const handleChange = (field: string, value: any) => {
        setForm((f) => ({ ...f, [field]: value }));
        setErrors((e) => ({ ...e, [field]: '' }));
        setTopError('');
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setTopError('');
        setStatusModal(null);
        setLoading(true);
        try {
            const recaptchaToken = await getToken('login');
            const { data } = await axios.post('/login', { ...form, recaptcha_token: recaptchaToken });
            if (data.success) {
                localStorage.setItem('token', data.data.token);
                axios.defaults.headers.common.Authorization = `Bearer ${data.data.token}`;
                router.visit(data.data.redirect || '/dashboard');
            } else {
                setTopError(data.message || t('Terjadi kesalahan.', 'Something went wrong.'));
            }
        } catch (err: any) {
            const response = err.response?.data;
            const redirect = response?.redirect;
            if (redirect === '/menunggu-persetujuan') {
                setStatusModal('pending');
                setLoading(false);
                return;
            }
            if (redirect === '/akun-ditolak') {
                setStatusModal('rejected');
                setModalReason(response?.data?.rejection_reason || '');
                setLoading(false);
                return;
            }
            if (redirect === '/akun-tidak-aktif') {
                router.visit('/akun-tidak-aktif');
                return;
            }
            if (redirect) {
                let url = redirect;
                const email = response?.data?.email;
                if (email) url += `?email=${encodeURIComponent(email)}`;
                router.visit(url);
                return;
            }
            if (response?.errors) {
                const mapped: Record<string, string> = {};
                Object.entries(response.errors).forEach(([k, v]) => {
                    mapped[k] = Array.isArray(v) ? v[0] : (v as string);
                });
                setErrors(mapped);
                setTopError(response.message || t('Periksa kembali data Anda.', 'Please check your input.'));
            } else {
                setTopError(response?.message || err.message || t('Terjadi kesalahan.', 'Something went wrong.'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head title={t('Masuk', 'Login')} />
            <div className="mb-6 text-center">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-lg">
                    <FlaskConical className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold">{t('Masuk ke ChemLOS', 'Sign in to ChemLOS')}</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {t('Masuk ke akun ChemLOS Anda', 'Sign in to your ChemLOS account')}
                </p>
            </div>

            {success && (
                <div className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-300">
                    {success}
                </div>
            )}
            {topError && (
                <div className="mb-4 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {topError}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <Input
                    type="email"
                    label={t('Email', 'Email')}
                    leftIcon={<Mail className="h-4 w-4" />}
                    placeholder="email@domain.ac.id"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    error={errors.email}
                    required
                />
                <Input
                    type={show ? 'text' : 'password'}
                    label={t('Password', 'Password')}
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

                <div className="flex items-center justify-between">
                    <Checkbox
                        id="remember"
                        label={t('Ingatkan Saya', 'Remember me')}
                        checked={form.remember}
                        onChange={(checked) => handleChange('remember', checked)}
                    />
                    <Link href="/lupa-password" className="text-sm font-medium text-indigo-600 hover:underline">
                        {t('Lupa Password?', 'Forgot password?')}
                    </Link>
                </div>

                <Button type="submit" variant="primary" isLoading={loading} className="w-full rounded-full py-3">
                    {t('Masuk', 'Sign in')}
                </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs text-slate-400">{t('atau', 'or')}</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                {t('Belum punya akun?', "Don't have an account?")}{' '}
                <Link href="/daftar" className="font-semibold text-indigo-600 hover:underline">
                    {t('Daftar', 'Register')}
                </Link>
            </p>

            <Modal
                open={statusModal !== null}
                onClose={() => setStatusModal(null)}
                title={statusModal === 'pending' ? t('Menunggu Persetujuan', 'Pending Approval') : t('Akun Ditolak', 'Account Rejected')}
                footer={
                    <div className="flex flex-wrap gap-2">
                        <a
                            href={`https://wa.me/${settings?.['umum.nomor_whatsapp_admin'] || '6281234567890'}?text=${encodeURIComponent('Halo, saya butuh bantuan terkait akun ChemLOS.')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                        >
                            <MessageCircle className="h-4 w-4" /> WhatsApp
                        </a>
                        <a
                            href={`mailto:${settings?.['umum.email_kontak'] || 'chemlos@che.ui.ac.id'}?subject=${encodeURIComponent('Bantuan Akun ChemLOS')}`}
                            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                            <Mail className="h-4 w-4" /> Email
                        </a>
                    </div>
                }
            >
                {statusModal === 'pending' ? (
                    <p>{t('Akun Anda masih menunggu persetujuan admin/laboran. Silakan hubungi admin untuk informasi lebih lanjut.', 'Your account is pending approval. Please contact admin for more information.')}</p>
                ) : (
                    <div className="space-y-2">
                        <p>{t('Akun Anda ditolak. Berikut alasan penolakannya:', 'Your account was rejected. Reason:')}</p>
                        <p className="rounded-lg bg-rose-50 p-3 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
                            {modalReason || t('Tidak ada alasan yang diberikan.', 'No reason provided.')}
                        </p>
                    </div>
                )}
            </Modal>
        </>
    );
}
