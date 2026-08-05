import { Head, router, usePage } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/Components/Button';
import { FileUpload } from '@/Components/FileUpload';
import { Input } from '@/Components/Input';
import { Select } from '@/Components/Select';
import { Textarea } from '@/Components/Textarea';

const groups = [
    { key: 'umum', label: 'Umum' },
    { key: 'branding', label: 'Branding' },
    { key: 'email', label: 'Email' },
    { key: 'keamanan', label: 'Keamanan' },
    { key: 'legal', label: 'Legal' },
    { key: 'denda', label: 'Denda' },
    { key: 'peminjaman', label: 'Peminjaman' },
    { key: 'notifikasi', label: 'Notifikasi' },
    { key: 'tentang', label: 'Tentang' },
];

const fieldConfig: Record<string, Record<string, { type: 'text' | 'email' | 'number' | 'textarea' | 'select'; options?: { value: string; label: string }[] }>> = {
    umum: {
        nama_aplikasi: { type: 'text' },
        nama_institusi: { type: 'text' },
        deskripsi_aplikasi: { type: 'textarea' },
        email_kontak: { type: 'email' },
        nomor_whatsapp_admin: { type: 'text' },
        alamat_institusi: { type: 'textarea' },
        jam_operasional: { type: 'text' },
        social_facebook: { type: 'text' },
        social_instagram: { type: 'text' },
        social_youtube: { type: 'text' },
        social_twitter: { type: 'text' },
    },
    legal: {
        syarat_ketentuan: { type: 'textarea' },
        kebijakan_privasi: { type: 'textarea' },
    },
    tentang: {
        tagline: { type: 'text' },
        visi: { type: 'textarea' },
        misi: { type: 'textarea' },
    },
    denda: {
        denda_per_hari: { type: 'number' },
        denda_per_jam: { type: 'number' },
        toleransi_keterlambatan_menit: { type: 'number' },
        maksimal_denda: { type: 'number' },
        blokir_pinjaman_jika_denda: { type: 'select', options: [{ value: '1', label: 'Ya' }, { value: '0', label: 'Tidak' }] },
        denda_rusak_ringan: { type: 'number' },
        denda_rusak_berat: { type: 'number' },
        denda_hilang: { type: 'number' },
    },
    peminjaman: {
        batas_waktu_persetujuan_jam: { type: 'number' },
        maksimal_durasi_hari: { type: 'number' },
        minimal_durasi_hari: { type: 'number' },
        maksimal_alat_per_peminjaman: { type: 'number' },
        maksimal_peminjaman_aktif: { type: 'number' },
        wajib_upload_jsa: { type: 'select', options: [{ value: '1', label: 'Ya' }, { value: '0', label: 'Tidak' }] },
        wajib_dosen_pembimbing: { type: 'select', options: [{ value: '1', label: 'Ya' }, { value: '0', label: 'Tidak' }] },
    },
    notifikasi: {
        email_enabled: { type: 'select', options: [{ value: '1', label: 'Aktif' }, { value: '0', label: 'Nonaktif' }] },
        whatsapp_enabled: { type: 'select', options: [{ value: '1', label: 'Aktif' }, { value: '0', label: 'Nonaktif' }] },
        whatsapp_provider: { type: 'select', options: [{ value: 'stub', label: 'Stub/Log' }, { value: 'fonnte', label: 'Fonnte' }, { value: 'twilio', label: 'Twilio' }] },
        whatsapp_api_key: { type: 'text' },
        whatsapp_base_url: { type: 'text' },
        whatsapp_sender: { type: 'text' },
        reminder_h1_serah_terima: { type: 'select', options: [{ value: '1', label: 'Ya' }, { value: '0', label: 'Tidak' }] },
        reminder_h_serah_terima: { type: 'select', options: [{ value: '1', label: 'Ya' }, { value: '0', label: 'Tidak' }] },
        reminder_h2_pengembalian: { type: 'select', options: [{ value: '1', label: 'Ya' }, { value: '0', label: 'Tidak' }] },
        reminder_h1_pengembalian: { type: 'select', options: [{ value: '1', label: 'Ya' }, { value: '0', label: 'Tidak' }] },
        reminder_h_pengembalian: { type: 'select', options: [{ value: '1', label: 'Ya' }, { value: '0', label: 'Tidak' }] },
        notifikasi_keterlambatan: { type: 'select', options: [{ value: '1', label: 'Ya' }, { value: '0', label: 'Tidak' }] },
        notifikasi_realtime_enabled: { type: 'select', options: [{ value: '1', label: 'Aktif' }, { value: '0', label: 'Nonaktif' }] },
        polling_interval_detik: { type: 'number' },
        template_email_verifikasi: { type: 'textarea' },
        template_email_persetujuan: { type: 'textarea' },
        template_email_penolakan: { type: 'textarea' },
        template_email_peminjaman_selesai: { type: 'textarea' },
        template_whatsapp_pengingat: { type: 'textarea' },
    },
    keamanan: {
        recaptcha_enabled: { type: 'select', options: [{ value: '1', label: 'Aktif' }, { value: '0', label: 'Nonaktif' }] },
        max_login_attempts: { type: 'number' },
        lockout_minutes: { type: 'number' },
    },
    email: {
        mail_mailer: { type: 'select', options: [{ value: 'smtp', label: 'SMTP' }, { value: 'sendmail', label: 'Sendmail' }, { value: 'log', label: 'Log' }] },
        mail_port: { type: 'number' },
        mail_encryption: { type: 'select', options: [{ value: 'tls', label: 'TLS' }, { value: 'ssl', label: 'SSL' }, { value: 'null', label: 'Tidak ada' }] },
    },
    branding: {
        primary_color: { type: 'text' },
        secondary_color: { type: 'text' },
    },
};

function labelize(key: string) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function Index() {
    const { settings } = usePage().props as any;
    const [active, setActive] = useState('umum');
    const [values, setValues] = useState<Record<string, any>>(settings as Record<string, any>);
    const [files, setFiles] = useState<{ logo?: File; favicon?: File; logo_departemen?: File }>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setValues((prev: any) => ({
            ...prev,
            branding: { logo_aplikasi: '', favicon: '', logo_departemen: '', ...(prev?.branding ?? {}) },
        }));
    }, []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        data.append('group', active);
        Object.entries(values[active] ?? {}).forEach(([k, v]) => data.append(`keys[${active}][${k}]`, String(v)));
        if (active === 'branding') {
            if (files.logo) data.append('logo_aplikasi', files.logo);
            if (files.favicon) data.append('favicon', files.favicon);
            if (files.logo_departemen) data.append('logo_departemen', files.logo_departemen);
        }
        router.post('/dashboard/admin/pengaturan', data, { forceFormData: true, onFinish: () => setLoading(false) });
    };

    const setVal = (key: string, val: string) => {
        setValues((prev: any) => ({ ...prev, [active]: { ...prev[active], [key]: val } }));
    };

    const keys = Object.keys(values[active] ?? {}).sort();

    const renderField = (k: string) => {
        const conf = fieldConfig[active]?.[k];
        const value = values[active][k] ?? '';
        if (active === 'notifikasi' && k.startsWith('template_')) {
            return <Textarea key={k} label={labelize(k)} value={value} onChange={(e) => setVal(k, e.target.value)} rows={3} />;
        }
        if (['logo_aplikasi', 'favicon', 'logo_departemen'].includes(k)) {
            const fileKey = k === 'logo_aplikasi' ? 'logo' : k;
            return (
                <FileUpload
                    key={k}
                    label={labelize(k)}
                    value={files[fileKey as keyof typeof files] ?? value}
                    onChange={(file) => setFiles((prev) => ({ ...prev, [fileKey]: file ?? undefined }))}
                />
            );
        }
        if (conf?.type === 'number') {
            return <Input key={k} type="number" label={labelize(k)} value={value} onChange={(e) => setVal(k, e.target.value)} />;
        }
        if (conf?.type === 'email') {
            return <Input key={k} type="email" label={labelize(k)} value={value} onChange={(e) => setVal(k, e.target.value)} />;
        }
        if (conf?.type === 'select' && conf.options) {
            return <Select key={k} label={labelize(k)} options={conf.options} value={value} onChange={(e) => setVal(k, e.target.value)} />;
        }
        if (conf?.type === 'textarea' || (typeof value === 'string' && value.length > 60)) {
            return <Textarea key={k} label={labelize(k)} value={value} onChange={(e) => setVal(k, e.target.value)} rows={3} />;
        }
        return <Input key={k} label={labelize(k)} value={value} onChange={(e) => setVal(k, e.target.value)} />;
    };

    return (
        <>
            <Head title="Pengaturan" />
            <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Pengaturan Sistem</h1>
            <div className="flex flex-col gap-6 lg:flex-row">
                <div className="w-full lg:w-64">
                    <div className="space-y-1 rounded-2xl border border-slate-200/80 bg-white p-2 dark:border-slate-800/80 dark:bg-slate-900">
                        {groups.map((g) => (
                            <button key={g.key} onClick={() => setActive(g.key)} className={`w-full rounded-xl px-4 py-2 text-left text-sm font-medium transition ${active === g.key ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}>{g.label}</button>
                        ))}
                    </div>
                </div>
                <form onSubmit={submit} className="flex-1 space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                    {keys.map((k) => renderField(k))}
                    <div className="flex justify-end">
                        <Button type="submit" isLoading={loading} leftIcon={<Save className="h-4 w-4" />}>Simpan</Button>
                    </div>
                </form>
            </div>
        </>
    );
}
