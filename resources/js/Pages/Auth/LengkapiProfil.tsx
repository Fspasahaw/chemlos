import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { AlertCircle, MapPin, Phone, Save } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/Components/Button';
import { DatePicker } from '@/Components/DatePicker';
import { FileUpload } from '@/Components/FileUpload';
import { Input } from '@/Components/Input';
import { NumberStepper } from '@/Components/NumberStepper';
import { Select } from '@/Components/Select';
import { Textarea } from '@/Components/Textarea';
import { useLang } from '@/Providers/LanguageProvider';
import { toDateInput } from '@/lib/date';
import { useRecaptcha } from '@/Hooks/useRecaptcha';

export default function LengkapiProfil() {
    const { auth, recaptcha } = usePage().props as any;
    const { t } = useLang();
    const { getToken } = useRecaptcha(recaptcha?.enabled ? recaptcha?.site_key : undefined);
    const user = auth?.user;
    const isMahasiswa = user?.roles?.some((r: any) => r.name === 'mahasiswa');


    const [form, setForm] = useState({
        no_hp: user?.no_hp ?? '',
        tanggal_lahir: toDateInput(user?.tanggal_lahir),
        jenis_kelamin: user?.jenis_kelamin ?? '',
        alamat: user?.alamat ?? '',
        angkatan: user?.angkatan ? String(user.angkatan) : '',
        semester: user?.semester ? String(user.semester) : '',
    });
    const [avatar, setAvatar] = useState<File | string | null>(user?.avatar ?? null);
    const [fotoKtm, setFotoKtm] = useState<File | string | null>(user?.foto_ktm ?? null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

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
        setLoading(true);

        const data = new FormData();
        data.append('no_hp', form.no_hp);
        data.append('tanggal_lahir', form.tanggal_lahir);
        data.append('jenis_kelamin', form.jenis_kelamin);
        data.append('alamat', form.alamat);
        if (isMahasiswa) {
            data.append('angkatan', form.angkatan);
            data.append('semester', form.semester);
            if (fotoKtm instanceof File) data.append('foto_ktm', fotoKtm);
        }
        if (avatar instanceof File) data.append('avatar', avatar);

        const recaptchaToken = await getToken('complete_profile');
        if (recaptchaToken) {
            data.append('recaptcha_token', recaptchaToken);
        }

        try {
            const { data: response } = await axios.post('/api/v1/auth/complete-profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage(response.message || t('Profil berhasil dilengkapi.', 'Profile completed successfully.'));
            router.visit(response.data?.redirect || '/dashboard');
        } catch (err: any) {
            const res = err.response?.data;
            if (res?.errors) {
                const mapped: Record<string, string> = {};
                Object.entries(res.errors).forEach(([k, v]) => {
                    mapped[k] = Array.isArray(v) ? v[0] : (v as string);
                });
                setErrors(mapped);
                setError(res.message || t('Periksa kembali data Anda.', 'Please check your input.'));
            } else {
                setError(res?.message || t('Terjadi kesalahan.', 'Something went wrong.'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = async () => {
        setMessage('');
        setError('');
        setErrors({});
        setLoading(true);
        try {
            const data = new FormData();
            data.append('no_hp', form.no_hp);
            data.append('tanggal_lahir', form.tanggal_lahir);
            data.append('jenis_kelamin', form.jenis_kelamin);
            data.append('alamat', form.alamat);
            data.append('angkatan', '');
            data.append('semester', '');
            if (avatar instanceof File) data.append('avatar', avatar);

            const recaptchaToken = await getToken('complete_profile');
            if (recaptchaToken) {
                data.append('recaptcha_token', recaptchaToken);
            }

            const { data: response } = await axios.post('/api/v1/auth/complete-profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage(response.message || t('Profil berhasil dilengkapi.', 'Profile completed successfully.'));
            router.visit(response.data?.redirect || '/dashboard');
        } catch (err: any) {
            const res = err.response?.data;
            if (res?.errors) {
                const mapped: Record<string, string> = {};
                Object.entries(res.errors).forEach(([k, v]) => {
                    mapped[k] = Array.isArray(v) ? v[0] : (v as string);
                });
                setErrors(mapped);
                setError(res.message || t('Periksa kembali data Anda.', 'Please check your input.'));
            } else {
                setError(res?.message || t('Terjadi kesalahan.', 'Something went wrong.'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head title={t('Lengkapi Profil', 'Complete Profile')} />
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold">{t('Lengkapi Profil', 'Complete Profile')}</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {t('Lengkapi data Anda sebelum menggunakan ChemLOS.', 'Complete your data before using ChemLOS.')}
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
                    label={t('Nama Lengkap', 'Full Name')}
                    value={user?.nama_lengkap ?? ''}
                    disabled
                    className="bg-slate-100 dark:bg-slate-800"
                />
                <Input
                    type="email"
                    label={t('Email Institusi', 'Institutional Email')}
                    value={user?.email ?? ''}
                    disabled
                    className="bg-slate-100 dark:bg-slate-800"
                />
                <Input
                    label="NPM/NIP"
                    value={user?.npm_nip ?? ''}
                    disabled
                    className="bg-slate-100 dark:bg-slate-800"
                />

                <Input
                    type="tel"
                    label={t('No HP (WhatsApp)', 'Phone Number')}
                    leftIcon={<Phone className="h-4 w-4" />}
                    value={form.no_hp}
                    onChange={(e) => handleChange('no_hp', e.target.value)}
                    error={errors.no_hp}
                    required={isMahasiswa}
                />
                <DatePicker
                    label={t('Tanggal Lahir', 'Date of Birth')}
                    value={form.tanggal_lahir}
                    onChange={(e) => handleChange('tanggal_lahir', e.target.value)}
                    error={errors.tanggal_lahir}
                    required={isMahasiswa}
                />
                <Select
                    label={t('Jenis Kelamin', 'Gender')}
                    options={[
                        { value: '', label: t('Pilih', 'Choose') },
                        { value: 'L', label: t('Laki-laki', 'Male') },
                        { value: 'P', label: t('Perempuan', 'Female') },
                    ]}
                    value={form.jenis_kelamin}
                    onChange={(e) => handleChange('jenis_kelamin', e.target.value)}
                    error={errors.jenis_kelamin}
                    required={isMahasiswa}
                />
                <Textarea
                    label={t('Alamat', 'Address')}
                    leftIcon={<MapPin className="h-4 w-4" />}
                    value={form.alamat}
                    onChange={(e) => handleChange('alamat', e.target.value)}
                    error={errors.alamat}
                    required={isMahasiswa}
                    rows={3}
                />

                <FileUpload
                    label={t('Foto Profil', 'Profile Photo')}
                    accept="image/*"
                    maxSizeMB={2}
                    value={avatar}
                    onChange={setAvatar}
                    error={errors.avatar}
                    hint={t('Maks 2 MB, format JPG/PNG/WEBP', 'Max 2 MB, JPG/PNG/WEBP')}
                />

                {isMahasiswa && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <NumberStepper
                                label={t('Angkatan', 'Entry Year')}
                                value={Number(form.angkatan) || 1}
                                onChange={(v) => handleChange('angkatan', String(v))}
                                error={errors.angkatan}
                                required
                            />
                            <NumberStepper
                                label={t('Semester', 'Semester')}
                                value={Number(form.semester) || 1}
                                onChange={(v) => handleChange('semester', String(v))}
                                error={errors.semester}
                                required
                            />
                        </div>
                        <FileUpload
                            label={t('Foto KTM', 'Student ID Photo')}
                            accept="image/*"
                            maxSizeMB={2}
                            value={fotoKtm}
                            onChange={setFotoKtm}
                            error={errors.foto_ktm}
                            hint={t('Maks 2 MB, format JPG/PNG/WEBP', 'Max 2 MB, JPG/PNG/WEBP')}
                        />
                    </>
                )}

                <div className="flex flex-col gap-3">
                    <Button type="submit" variant="primary" isLoading={loading} className="w-full rounded-full py-3">
                        <Save className="h-4 w-4" /> {t('Simpan dan Lanjutkan', 'Save and Continue')}
                    </Button>
                    {!isMahasiswa && (
                        <Button
                            type="button"
                            variant="outline"
                            isLoading={loading}
                            onClick={handleSkip}
                            className="w-full rounded-full py-3"
                        >
                            {t('Lewati Profil Lengkap', 'Skip Complete Profile')}
                        </Button>
                    )}
                </div>
            </form>
        </>
    );
}
