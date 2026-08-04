import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { AlertCircle, Eye, EyeOff, FlaskConical, GraduationCap, Lock, Mail, Phone, User, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/Components/Button';
import { Checkbox } from '@/Components/Checkbox';
import { Input } from '@/Components/Input';
import { LegalText } from '@/Components/LegalText';
import Modal from '@/Components/Modal';
import PasswordIndicator from '@/Components/PasswordIndicator';
import { Select } from '@/Components/Select';
import { useLang } from '@/Providers/LanguageProvider';
import { useRecaptcha } from '@/Hooks/useRecaptcha';

export default function Daftar() {
    const { programStudi, settings, recaptcha } = usePage().props as any;
    const { t } = useLang();
    const [form, setForm] = useState({
        nama_lengkap: '',
        email: '',
        npm_nip: '',
        no_hp: '',
        password: '',
        password_confirmation: '',
        peran: 'mahasiswa',
        program_studi_id: programStudi?.[0]?.id ?? '',
        legal_consent: false,
    });
    const [consent, setConsent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [topError, setTopError] = useState('');
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState<'terms' | 'privacy' | null>(null);
    const { getToken } = useRecaptcha(recaptcha?.enabled ? recaptcha?.site_key : undefined);

    const isMahasiswa = form.peran === 'mahasiswa';

    const handleChange = (field: string, value: any) => {
        setForm((f) => ({ ...f, [field]: value }));
        setErrors((e) => ({ ...e, [field]: '' }));
        setTopError('');
    };

    const validateClient = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!form.nama_lengkap.trim()) newErrors.nama_lengkap = t('Nama lengkap wajib diisi.', 'Full name is required.');
        if (!form.email.trim()) {
            newErrors.email = t('Email wajib diisi.', 'Email is required.');
        } else if (isMahasiswa && !/@ui\.ac\.id$/.test(form.email)) {
            newErrors.email = t('Mahasiswa wajib menggunakan email @ui.ac.id.', 'Students must use @ui.ac.id email.');
        } else if (!isMahasiswa && !/@che\.ui\.ac\.id$/.test(form.email)) {
            newErrors.email = t('Dosen wajib menggunakan email @che.ui.ac.id.', 'Lecturers must use @che.ui.ac.id email.');
        }
        if (!form.npm_nip.trim()) newErrors.npm_nip = isMahasiswa ? t('NPM wajib diisi.', 'NPM is required.') : t('NIP wajib diisi.', 'NIP is required.');
        if (isMahasiswa && !form.program_studi_id) newErrors.program_studi_id = t('Program studi wajib dipilih.', 'Program is required.');
        if (!form.no_hp.trim()) newErrors.no_hp = t('Nomor HP wajib diisi.', 'Phone number is required.');
        if (!form.password) newErrors.password = t('Password wajib diisi.', 'Password is required.');
        if (form.password !== form.password_confirmation) newErrors.password_confirmation = t('Konfirmasi password tidak cocok.', 'Password confirmation does not match.');
        if (!consent) newErrors.legal_consent = t('Anda harus menyetujui Syarat dan Ketentuan serta Kebijakan Privasi.', 'You must agree to the Terms and Privacy Policy.');
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            setTopError(t('Periksa kembali data Anda.', 'Please check your input.'));
            return false;
        }
        return true;
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTopError('');
        if (!validateClient()) return;
        setLoading(true);
        try {
            const recaptchaToken = await getToken('register');
            await axios.post('/api/v1/auth/register', { ...form, recaptcha_token: recaptchaToken });
            router.visit(`/verifikasi-email?email=${encodeURIComponent(form.email)}`);
        } catch (err: any) {
            const response = err.response?.data;
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

    const programStudiOptions = (programStudi || []).map((ps: any) => ({ value: String(ps.id), label: `${ps.jenjang ? `${ps.jenjang} ` : ''}${ps.nama}`.trim() }));

    return (
        <>
            <Head title={t('Daftar', 'Register')} />
            <div className="mb-6 text-center">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-lg">
                    <FlaskConical className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold">{t('Buat Akun ChemLOS', 'Create ChemLOS Account')}</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {t('Daftar sebagai mahasiswa atau dosen', 'Register as student or lecturer')}
                </p>
            </div>

            {topError && (
                <div className="mb-4 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {topError}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <Input
                    label={t('Nama Lengkap', 'Full Name')}
                    leftIcon={<User className="h-4 w-4" />}
                    value={form.nama_lengkap}
                    onChange={(e) => handleChange('nama_lengkap', e.target.value)}
                    error={errors.nama_lengkap}
                    required
                />

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{t('Pilih Peran', 'Choose Role')}</label>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {[
                            { value: 'mahasiswa', label: t('Mahasiswa', 'Student'), desc: t('Untuk mahasiswa FTUI', 'For FTUI students'), icon: GraduationCap },
                            { value: 'dosen', label: t('Dosen', 'Lecturer'), desc: t('Untuk dosen & staf akademik', 'For lecturers & academic staff'), icon: Users },
                        ].map((r) => {
                            const active = form.peran === r.value;
                            return (
                                <button
                                    key={r.value}
                                    type="button"
                                    onClick={() => {
                                        handleChange('peran', r.value);
                                        if (r.value === 'mahasiswa' && programStudi?.[0]) {
                                            handleChange('program_studi_id', String(programStudi[0].id));
                                        } else {
                                            handleChange('program_studi_id', '');
                                        }
                                    }}
                                    className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                                        active
                                            ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-900/20'
                                            : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <r.icon className={`mt-0.5 h-5 w-5 ${active ? 'text-indigo-600' : 'text-slate-500 dark:text-slate-400'}`} />
                                    <div>
                                        <p className={`font-semibold ${active ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-slate-100'}`}>{r.label}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{r.desc}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    {errors.peran && <p className="mt-2 text-xs text-rose-500">{errors.peran}</p>}
                </div>

                <Input
                    type="email"
                    label={t('Email Institusi', 'Institutional Email')}
                    leftIcon={<Mail className="h-4 w-4" />}
                    placeholder={isMahasiswa ? 'nama@ui.ac.id' : 'nama@che.ui.ac.id'}
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    error={errors.email}
                    hint={isMahasiswa ? t('Gunakan email @ui.ac.id', 'Use @ui.ac.id email') : t('Gunakan email @che.ui.ac.id', 'Use @che.ui.ac.id email')}
                    required
                />

                <Input
                    label={isMahasiswa ? 'NPM' : 'NIP'}
                    value={form.npm_nip}
                    onChange={(e) => handleChange('npm_nip', e.target.value)}
                    error={errors.npm_nip}
                    required
                />

                {isMahasiswa && (
                    <Select
                        label={t('Program Studi', 'Study Program')}
                        options={programStudiOptions}
                        value={String(form.program_studi_id)}
                        onChange={(e) => handleChange('program_studi_id', Number(e.target.value))}
                        error={errors.program_studi_id}
                        required
                    />
                )}

                <Input
                    label={t('Nomor HP (WhatsApp)', 'Phone Number')}
                    leftIcon={<Phone className="h-4 w-4" />}
                    placeholder="081234567890"
                    value={form.no_hp}
                    onChange={(e) => handleChange('no_hp', e.target.value)}
                    error={errors.no_hp}
                    required
                />

                <div>
                    <Input
                        type={showPassword ? 'text' : 'password'}
                        label={t('Password', 'Password')}
                        leftIcon={<Lock className="h-4 w-4" />}
                        value={form.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        error={errors.password}
                        rightIcon={
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        }
                        required
                    />
                    {form.password && <PasswordIndicator password={form.password} />}
                </div>

                <Input
                    type={showConfirm ? 'text' : 'password'}
                    label={t('Konfirmasi Password', 'Confirm Password')}
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

                <Checkbox
                    id="consent"
                    checked={consent}
                    onChange={(checked) => {
                        setConsent(checked);
                        handleChange('legal_consent', checked);
                    }}
                    label={
                        <span className="text-slate-600 dark:text-slate-300">
                            {t('Saya menyetujui', 'I agree to the')}{' '}
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModal('terms'); }}
                                className="font-medium text-indigo-600 hover:underline"
                            >
                                {t('Syarat dan Ketentuan', 'Terms and Conditions')}
                            </a>{' '}
                            {t('serta', 'and')}{' '}
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModal('privacy'); }}
                                className="font-medium text-indigo-600 hover:underline"
                            >
                                {t('Kebijakan Privasi', 'Privacy Policy')}
                            </a>{' '}
                            ChemLOS.
                        </span>
                    }
                />
                {errors.legal_consent && <p className="-mt-2 text-xs text-rose-500">{errors.legal_consent}</p>}

                <Button type="submit" variant="primary" isLoading={loading} className="w-full rounded-full py-3">
                    {t('Daftar', 'Register')}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                {t('Sudah punya akun?', 'Already have an account?')}{' '}
                <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
                    {t('Masuk', 'Sign in')}
                </Link>
            </p>

            <Modal
                open={modal !== null}
                onClose={() => setModal(null)}
                title={modal === 'terms' ? t('Syarat dan Ketentuan', 'Terms and Conditions') : t('Kebijakan Privasi', 'Privacy Policy')}
                footer={
                    <Button type="button" variant="outline" onClick={() => setModal(null)}>
                        {t('Tutup', 'Close')}
                    </Button>
                }
            >
                <LegalText
                    content={modal === 'terms'
                        ? settings?.['legal.syarat_ketentuan'] || ''
                        : settings?.['legal.kebijakan_privasi'] || ''
                    }
                />
            </Modal>
        </>
    );
}
