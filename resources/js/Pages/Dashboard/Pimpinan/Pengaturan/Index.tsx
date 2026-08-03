import { Head, router, usePage } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../../Components/Button';
import { Card } from '../../../../Components/Card';
import { Input } from '../../../../Components/Input';
import { Textarea } from '../../../../Components/Textarea';

const groupLabels: Record<string, string> = {
    umum: 'Umum',
    peminjaman: 'Peminjaman',
    denda: 'Denda',
    notifikasi: 'Template Email & WhatsApp',
};

export default function Index() {
    const { settings, groups } = usePage().props as any;
    const [active, setActive] = useState(groups[0] ?? 'umum');
    const [values, setValues] = useState<Record<string, Record<string, string>>>(settings ?? {});
    const [loading, setLoading] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        router.post('/dashboard/pimpinan/pengaturan', { group: active, keys: { [active]: values[active] ?? {} } }, { preserveScroll: true, onFinish: () => setLoading(false) });
    };

    return (
        <>
            <Head title="Pengaturan" />
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Pengaturan Sistem</h1>
                <p className="text-slate-500 dark:text-slate-400">Edit pengaturan terbatas untuk pimpinan.</p>
            </div>
            <Card>
                <div className="mb-4 flex gap-2 overflow-x-auto border-b border-slate-200/80 pb-2 dark:border-slate-800/80">
                    {groups.map((g: string) => (
                        <button key={g} onClick={() => setActive(g)} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${active === g ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{groupLabels[g] ?? g}</button>
                    ))}
                </div>
                <form onSubmit={submit} className="space-y-4">
                    {Object.entries(values[active] ?? {}).map(([key, val]) => (
                        key.includes('template') || key.includes('konten') ? (
                            <Textarea
                                key={key}
                                label={key.replace(/_/g, ' ')}
                                value={String(val)}
                                onChange={(e) => setValues({ ...values, [active]: { ...values[active], [key]: e.target.value } })}
                                rows={4}
                            />
                        ) : (
                            <Input
                                key={key}
                                label={key.replace(/_/g, ' ')}
                                value={String(val)}
                                onChange={(e) => setValues({ ...values, [active]: { ...values[active], [key]: e.target.value } })}
                            />
                        )
                    ))}
                    <Button type="submit" isLoading={loading} leftIcon={<Save className="h-4 w-4" />}>Simpan Pengaturan</Button>
                </form>
            </Card>
        </>
    );
}
