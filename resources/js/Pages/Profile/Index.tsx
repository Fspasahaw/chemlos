import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { AlertCircle, Bell, Check, Eye, EyeOff, GraduationCap, Lock, Moon, Save, Sun, User } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '@/Components/Avatar';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { Checkbox } from '@/Components/Checkbox';
import { DatePicker } from '@/Components/DatePicker';
import { FileUpload } from '@/Components/FileUpload';
import { Input } from '@/Components/Input';
import { Select } from '@/Components/Select';
import { Switch } from '@/Components/Switch';
import { Textarea } from '@/Components/Textarea';
import { useLang } from '@/Providers/LanguageProvider';
import { statusVerifikasiMap } from '@/lib/status';
import { useTheme } from '@/Providers/ThemeProvider';
import { toDateInput } from '@/lib/date';
import PasswordIndicator from '@/Components/PasswordIndicator';

export default function ProfileIndex() {
    const { auth } = usePage().props as any;
    const { t, setLang } = useLang();
    const { setTheme } = useTheme();
    const user = auth?.user;
    const isMahasiswa = user?.roles?.some((r: any) => r.name === 'mahasiswa');


    const [tab, setTab] = useState<'pribadi' | 'keamanan' | 'preferensi'>('pribadi');

    const [pribadi, setPribadi] = useState({
        nama_lengkap: user?.nama_lengkap ?? '',
        no_hp: user?.no_hp ?? '',
        tanggal_lahir: toDateInput(user?.tanggal_lahir),
        jenis_kelamin: user?.jenis_kelamin ?? '',
        alamat: user?.alamat ?? '',
    });
    const [avatar, setAvatar] = useState<File | string | null>(user?.avatar ?? null);

    const [pw, setPw] = useState({ current_password: '', password: '', password_confirmation: '' });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const [pref, setPref] = useState({
        tema_preferensi: user?.tema_preferensi ?? 'system',
        bahasa_preferensi: user?.bahasa_preferensi ?? 'id',
        reduce_motion: user?.reduce_motion ?? false,
        notifikasi_email: user?.notifikasi_email ?? true,
        notifikasi_whatsapp: user?.notifikasi_whatsapp ?? true,
        notifikasi_in_app: user?.notifikasi_in_app ?? true,
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const userStatus = statusVerifikasiMap[user?.status] ?? { label: user?.status_label ?? user?.status, variant: 'neutral' };

    const handlePribadiChange = (field: string, value: string) => {
        setPribadi((p) => ({ ...p, [field]: value }));
        setErrors((e) => ({ ...e, [field]: '' }));
        setError('');
    };

    const savePribadi = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setErrors({});
        setLoading(true);
        const data = new FormData();
        Object.entries(pribadi).forEach(([k, v]) => data.append(k, String(v)));
        if (avatar instanceof File) data.append('avatar', avatar);
        try {
            const { data: response } = await axios.put('/api/v1/auth/me', data);
            setMessage(response.message || t('Profil berhasil diperbarui.', 'Profile updated successfully.'));
            const updated = response.data?.data ?? response.data;
            if (updated) {
                setPribadi({
                    nama_lengkap: updated.nama_lengkap ?? '',
                    no_hp: updated.no_hp ?? '',
                    tanggal_lahir: toDateInput(updated.tanggal_lahir),
                    jenis_kelamin: updated.jenis_kelamin ?? '',
                    alamat: updated.alamat ?? '',
                });
                setAvatar(updated.avatar ?? null);
            }
            router.reload();
        } catch (err: any) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    const savePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setErrors({});
        setLoading(true);
        try {
            const { data: response } = await axios.post('/api/v1/auth/change-password', pw);
            setMessage(response.message || t('Password berhasil diubah.', 'Password changed successfully.'));
            setPw({ current_password: '', password: '', password_confirmation: '' });
        } catch (err: any) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    const savePref = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setErrors({});
        setLoading(true);
        try {
            const { data: response } = await axios.put('/api/v1/auth/me', pref);
            setMessage(response.message || t('Preferensi berhasil disimpan.', 'Preferences saved successfully.'));
            setTheme(pref.tema_preferensi as 'light' | 'dark' | 'system');
            setLang(pref.bahasa_preferensi as 'id' | 'en');
        } catch (err: any) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleError = (err: any) => {
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
    };

    const ktmUrl = user?.foto_ktm ? (user.foto_ktm.startsWith('http') ? user.foto_ktm : `/storage/${user.foto_ktm}`) : null;

    return (
        <>
            <Head title={t('Profil Saya', 'My Profile')} />
            <div className="mx-auto max-w-3xl">
                <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                        <Avatar src={user?.avatar} name={user?.nama_lengkap ?? user?.name} size="xl" />
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl font-bold">{user?.nama_lengkap ?? user?.name}</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                <Badge variant="info">{user?.roles?.[0]?.name ?? 'User'}</Badge>
                                <Badge variant={userStatus.variant}>{userStatus.label}</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
                    <div className="flex border-b border-slate-200/80 dark:border-slate-800/80">
                        {[
                            { id: 'pribadi', label: t('Informasi Pribadi', 'Personal Info') },
                            { id: 'keamanan', label: t('Keamanan', 'Security') },
                            { id: 'preferensi', label: t('Preferensi', 'Preferences') },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setTab(t.id as any);
                                    setMessage('');
                                    setError('');
                                }}
                                className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                                    tab === t.id
                                        ? 'border-b-2 border-indigo-600 text-indigo-600'
                                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
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

                        {tab === 'pribadi' && (
                            <form onSubmit={savePribadi} className="space-y-4">
                                <FileUpload
                                    label={t('Foto Profil', 'Profile Photo')}
                                    accept="image/*"
                                    maxSizeMB={2}
                                    value={avatar}
                                    onChange={setAvatar}
                                    error={errors.avatar}
                                    hint={t('Maks 2 MB, format JPG/PNG/WEBP', 'Max 2 MB, JPG/PNG/WEBP')}
                                />
                                <Input
                                    label={t('Nama Lengkap', 'Full Name')}
                                    value={pribadi.nama_lengkap}
                                    onChange={(e) => handlePribadiChange('nama_lengkap', e.target.value)}
                                    error={errors.nama_lengkap}
                                />
                                <Input
                                    label={t('No HP', 'Phone Number')}
                                    value={pribadi.no_hp}
                                    onChange={(e) => handlePribadiChange('no_hp', e.target.value)}
                                    error={errors.no_hp}
                                />
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <DatePicker
                                        label={t('Tanggal Lahir', 'Date of Birth')}
                                        value={pribadi.tanggal_lahir}
                                        onChange={(e) => handlePribadiChange('tanggal_lahir', e.target.value)}
                                        error={errors.tanggal_lahir}
                                    />
                                    <Select
                                        label={t('Jenis Kelamin', 'Gender')}
                                        options={[
                                            { value: '', label: t('Pilih', 'Choose') },
                                            { value: 'L', label: t('Laki-laki', 'Male') },
                                            { value: 'P', label: t('Perempuan', 'Female') },
                                        ]}
                                        value={pribadi.jenis_kelamin}
                                        onChange={(e) => handlePribadiChange('jenis_kelamin', e.target.value)}
                                        error={errors.jenis_kelamin}
                                    />
                                </div>
                                <Textarea
                                    label={t('Alamat', 'Address')}
                                    value={pribadi.alamat}
                                    onChange={(e) => handlePribadiChange('alamat', e.target.value)}
                                    error={errors.alamat}
                                    rows={3}
                                />
                                <Button type="submit" variant="primary" isLoading={loading} leftIcon={<Save className="h-4 w-4" />}>
                                    {t('Simpan Perubahan', 'Save Changes')}
                                </Button>

                                {isMahasiswa && (
                                    <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
                                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            <GraduationCap className="h-4 w-4 text-indigo-600" />
                                            {t('Informasi Mahasiswa', 'Student Information')}
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <Input
                                                label={t('Angkatan', 'Entry Year')}
                                                value={user?.angkatan ?? ''}
                                                disabled
                                                className="bg-white dark:bg-slate-900"
                                            />
                                            <Input
                                                label={t('Semester', 'Semester')}
                                                value={user?.semester ?? ''}
                                                disabled
                                                className="bg-white dark:bg-slate-900"
                                            />
                                        </div>
                                        {ktmUrl && (
                                            <div className="mt-4">
                                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                                                    {t('Foto KTM', 'Student ID Photo')}
                                                </label>
                                                <img
                                                    src={ktmUrl}
                                                    alt="KTM"
                                                    className="h-40 w-auto rounded-xl border border-slate-200 object-cover dark:border-slate-700"
                                                    onError={(e) => {
                                                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </form>
                        )}

                        {tab === 'keamanan' && (
                            <form onSubmit={savePassword} className="space-y-4">
                                <Input
                                    type={showCurrent ? 'text' : 'password'}
                                    label={t('Password Saat Ini', 'Current Password')}
                                    leftIcon={<Lock className="h-4 w-4" />}
                                    value={pw.current_password}
                                    onChange={(e) => setPw({ ...pw, current_password: e.target.value })}
                                    error={errors.current_password}
                                    rightIcon={
                                        <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    }
                                    required
                                />
                                <div>
                                    <Input
                                        type={showNew ? 'text' : 'password'}
                                        label={t('Password Baru', 'New Password')}
                                        leftIcon={<Lock className="h-4 w-4" />}
                                        value={pw.password}
                                        onChange={(e) => setPw({ ...pw, password: e.target.value })}
                                        error={errors.password}
                                        rightIcon={
                                            <button type="button" onClick={() => setShowNew(!showNew)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        }
                                        required
                                    />
                                    {pw.password && <PasswordIndicator password={pw.password} />}
                                </div>
                                <Input
                                    type="password"
                                    label={t('Konfirmasi Password Baru', 'Confirm New Password')}
                                    leftIcon={<Lock className="h-4 w-4" />}
                                    value={pw.password_confirmation}
                                    onChange={(e) => setPw({ ...pw, password_confirmation: e.target.value })}
                                    error={errors.password_confirmation}
                                    required
                                />
                                <Button type="submit" variant="primary" isLoading={loading}>
                                    {t('Ubah Password', 'Change Password')}
                                </Button>
                            </form>
                        )}

                        {tab === 'preferensi' && (
                            <form onSubmit={savePref} className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium">{t('Tema', 'Theme')}</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: 'light', icon: Sun, label: t('Terang', 'Light') },
                                            { id: 'dark', icon: Moon, label: t('Gelap', 'Dark') },
                                            { id: 'system', icon: User, label: t('Sistem', 'System') },
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setPref((p) => ({ ...p, tema_preferensi: t.id }))}
                                                className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${
                                                    pref.tema_preferensi === t.id
                                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20'
                                                        : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
                                                }`}
                                            >
                                                <t.icon className="h-5 w-5" />
                                                <span className="text-xs font-medium">{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Select
                                    label={t('Bahasa', 'Language')}
                                    options={[
                                        { value: 'id', label: 'Bahasa Indonesia' },
                                        { value: 'en', label: 'English' },
                                    ]}
                                    value={pref.bahasa_preferensi}
                                    onChange={(e) => setPref((p) => ({ ...p, bahasa_preferensi: e.target.value }))}
                                />
                                <Checkbox
                                    id="reduce-motion"
                                    label={t('Kurangi Animasi', 'Reduce Motion')}
                                    checked={pref.reduce_motion}
                                    onChange={(checked) => setPref((p) => ({ ...p, reduce_motion: checked }))}
                                />

                                <div className="rounded-xl border border-slate-200/80 p-4 dark:border-slate-700/50">
                                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        <Bell className="h-4 w-4 text-indigo-600" /> {t('Notifikasi', 'Notifications')}
                                    </h3>
                                    <div className="space-y-3">
                                        <Switch
                                            label={t('Notifikasi Email', 'Email Notifications')}
                                            checked={pref.notifikasi_email}
                                            onChange={(checked) => setPref((p) => ({ ...p, notifikasi_email: checked }))}
                                        />
                                        <Switch
                                            label={t('Notifikasi WhatsApp', 'WhatsApp Notifications')}
                                            checked={pref.notifikasi_whatsapp}
                                            onChange={(checked) => setPref((p) => ({ ...p, notifikasi_whatsapp: checked }))}
                                        />
                                        <Switch
                                            label={t('Notifikasi di Aplikasi', 'In-App Notifications')}
                                            checked={pref.notifikasi_in_app}
                                            onChange={(checked) => setPref((p) => ({ ...p, notifikasi_in_app: checked }))}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" variant="primary" isLoading={loading} leftIcon={<Save className="h-4 w-4" />}>
                                    {t('Simpan Preferensi', 'Save Preferences')}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
