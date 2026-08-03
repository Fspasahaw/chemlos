import { Head, Link, usePage } from '@inertiajs/react';
import { FileText, Home } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function SyaratKetentuan() {
    const { settings } = usePage().props as any;
    const content = (settings?.['legal.syarat_ketentuan'] as string | undefined) || 'Syarat dan Ketentuan belum tersedia.';
    const lines = content.split('\n').filter((line: string) => line.trim().length > 0);
    const headings = useMemo(() => lines.map((line: string, i: number) => ({ id: `section-${i}`, text: line })), [lines]);
    const [active, setActive] = useState(headings[0]?.id || '');

    useEffect(() => {
        const handleScroll = () => {
            const offsets = headings.map((h) => {
                const el = document.getElementById(h.id);
                return el ? { id: h.id, top: el.getBoundingClientRect().top } : { id: h.id, top: Infinity };
            });
            const visible = offsets.filter((o) => o.top <= 150).pop() || offsets[0];
            setActive(visible.id);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [headings]);

    return (
        <>
            <Head title="Syarat dan Ketentuan" />
            <section className="bg-linear-to-br from-indigo-600 to-violet-700 py-16 text-white">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mb-3 flex items-center gap-2 text-sm text-white/80">
                        <Link href="/" className="flex items-center gap-1 hover:text-white hover:underline"><Home className="h-4 w-4" /> Beranda</Link>
                        <span>/</span>
                        <span className="text-white">Syarat dan Ketentuan</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8" />
                        <h1 className="text-3xl font-bold md:text-4xl">Syarat dan Ketentuan</h1>
                    </div>
                </div>
            </section>
            <section className="mx-auto max-w-7xl px-4 py-10">
                <div className="grid gap-8 lg:grid-cols-4">
                    <div className="hidden lg:block">
                        <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800/80 dark:bg-slate-900">
                            <h3 className="mb-3 font-semibold">Daftar Isi</h3>
                            <ul className="space-y-2 text-sm">
                                {headings.map((h, i) => (
                                    <li key={h.id}>
                                        <a href={`#${h.id}`} onClick={() => setActive(h.id)} className={`block rounded-lg px-2 py-1 transition ${active === h.id ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
                                            {i + 1}. {h.text.replace(/^\d+\.\s*/, '').slice(0, 45)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="lg:col-span-3">
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900 print:border-0 print:bg-white print:shadow-none">
                            {lines.length > 1 ? lines.map((line: string, i: number) => (
                                <div key={i} id={headings[i]?.id} className={`py-3 ${line.match(/^\d+\./) ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                                    <p className={line.match(/^\d+\./) ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}>{line}</p>
                                </div>
                            )) : <p className="text-slate-500 dark:text-slate-400">{content}</p>}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
