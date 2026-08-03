import { Head, useForm, usePage } from '@inertiajs/react';
import { Clock, Globe, Loader2, Mail, MapPin, Phone } from 'lucide-react';
import { useLang } from '../../Providers/LanguageProvider';
import { useRecaptcha } from '../../Hooks/useRecaptcha';
import { Input } from '../../Components/Input';
import { Textarea } from '../../Components/Textarea';
import { Button } from '../../Components/Button';

export default function Kontak() {
    const { settings } = usePage().props as any;
    const { t } = useLang();
    const recaptcha = useRecaptcha(settings?.recaptcha?.enabled ? settings?.recaptcha?.site_key : undefined);

    const { data, setData, post, processing, errors, reset } = useForm({
        nama: '',
        email: '',
        subjek: '',
        pesan: '',
        recaptcha_token: '',
    });

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = await recaptcha.getToken('kontak');
        setData('recaptcha_token', token ?? '');
        post('/kontak', {
            onSuccess: () => reset(),
        });
    };

    const jam = settings?.['umum.jam_operasional'] || 'Senin - Jumat, 08.00 - 16.00 WIB';
    const socials = [
        { key: 'umum.social_facebook', label: 'Facebook' },
        { key: 'umum.social_instagram', label: 'Instagram' },
        { key: 'umum.social_youtube', label: 'YouTube' },
        { key: 'umum.social_twitter', label: 'X/Twitter' },
    ].filter((s) => settings?.[s.key]);

    return (
        <>
            <Head title={t('Kontak', 'Contact')} />
            <section className="bg-linear-to-br from-indigo-600 to-violet-700 py-16 text-white">
                <div className="mx-auto max-w-7xl px-4 text-center">
                    <h1 className="text-3xl font-bold md:text-4xl">{t('Kontak Kami', 'Contact Us')}</h1>
                    <p className="mx-auto mt-3 max-w-2xl text-white/90">{t('Hubungi tim ChemLOS untuk pertanyaan atau bantuan.', 'Reach out to the ChemLOS team for questions or support.')}</p>
                </div>
            </section>

            <section className="mx-auto max-w-5xl px-4 py-10">
                <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-6">
                        <div className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800/80 dark:bg-slate-900">
                            <div className="rounded-full bg-indigo-50 p-2 dark:bg-indigo-900/20"><MapPin className="h-6 w-6 text-indigo-600" /></div>
                            <div>
                                <h3 className="font-semibold">{t('Alamat', 'Address')}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{settings?.['umum.alamat_institusi'] || '—'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800/80 dark:bg-slate-900">
                            <div className="rounded-full bg-indigo-50 p-2 dark:bg-indigo-900/20"><Mail className="h-6 w-6 text-indigo-600" /></div>
                            <div>
                                <h3 className="font-semibold">Email</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{settings?.['umum.email_kontak'] || '—'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800/80 dark:bg-slate-900">
                            <div className="rounded-full bg-indigo-50 p-2 dark:bg-indigo-900/20"><Phone className="h-6 w-6 text-indigo-600" /></div>
                            <div>
                                <h3 className="font-semibold">WhatsApp</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">+{settings?.['umum.nomor_whatsapp_admin'] || '—'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800/80 dark:bg-slate-900">
                            <div className="rounded-full bg-indigo-50 p-2 dark:bg-indigo-900/20"><Clock className="h-6 w-6 text-indigo-600" /></div>
                            <div>
                                <h3 className="font-semibold">{t('Jam Operasional', 'Operating Hours')}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{jam}</p>
                            </div>
                        </div>

                        {socials.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                                {socials.map((s) => (
                                    <a key={s.key} href={settings[s.key]} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                                        <Globe className="h-4 w-4" /> {s.label}
                                    </a>
                                ))}
                            </div>
                        )}

                        {settings?.['umum.alamat_institusi'] && (
                            <div className="aspect-video overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                                <iframe
                                    title="Lokasi ChemLOS"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    allowFullScreen
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={`https://www.google.com/maps?q=Departemen+Teknik+Kimia+Universitas+Indonesia&output=embed`}
                                />
                            </div>
                        )}
                    </div>

                    <form onSubmit={submit} className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                        <div className="space-y-4">
                            <Input label={t('Nama', 'Name')} value={data.nama} onChange={(e) => setData('nama', e.target.value)} error={errors.nama} required />
                            <Input type="email" label="Email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} required />
                            <Input label={t('Subjek', 'Subject')} value={data.subjek} onChange={(e) => setData('subjek', e.target.value)} error={errors.subjek} required />
                            <Textarea label={t('Pesan', 'Message')} value={data.pesan} onChange={(e) => setData('pesan', e.target.value)} error={errors.pesan} rows={4} required />
                            <Button type="submit" variant="primary" isLoading={processing} leftIcon={<Loader2 className="h-4 w-4" />} className="w-full">
                                {t('Kirim Pesan', 'Send Message')}
                            </Button>
                        </div>
                    </form>
                </div>
            </section>
        </>
    );
}
