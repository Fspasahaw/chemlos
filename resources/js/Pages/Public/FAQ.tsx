import { Head, Link, usePage } from '@inertiajs/react';
import { Home } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Accordion } from '../../Components/Accordion';
import { SearchInput } from '../../Components/SearchInput';
import { useLang } from '../../Providers/LanguageProvider';

interface FaqItem { q: string; a: string; }

interface FAQProps {
    faqs?: Record<string, FaqItem[]>;
}

export default function FAQ({ faqs: faqsProp }: FAQProps) {
    const { t } = useLang();
    const { features } = usePage().props as any;
    const isEnabled = (key: string) => !!features?.[key];
    const [active, setActive] = useState<number | null>(null);
    const [search, setSearch] = useState('');

    const defaultFaqs: Record<string, FaqItem[]> = {
        Umum: [
            { q: 'Apa itu ChemLOS?', a: 'ChemLOS adalah sistem online untuk mengelola inventaris dan peminjaman alat laboratorium.' },
        ],
    };

    const faqs = faqsProp || defaultFaqs;
    const categories = Object.keys(faqs);

    const [selected, setSelected] = useState(categories[0] || 'Umum');

    const filtered = useMemo(() => {
        const list = faqs[selected] || [];
        if (!search.trim()) return list;
        const term = search.toLowerCase();
        return list.filter((f) => f.q.toLowerCase().includes(term) || f.a.toLowerCase().includes(term));
    }, [selected, search, faqs]);

    return (
        <>
            <Head title="FAQ" />
            <section className="bg-linear-to-br from-indigo-600 to-violet-700 py-16 text-white">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mb-3 flex items-center gap-2 text-sm text-white/80">
                        <Link href="/" className="flex items-center gap-1 hover:text-white hover:underline"><Home className="h-4 w-4" /> Beranda</Link>
                        <span>/</span>
                        <span className="text-white">FAQ</span>
                    </div>
                    <h1 className="text-3xl font-bold md:text-4xl">FAQ</h1>
                    <p className="mx-auto mt-3 max-w-2xl text-white/90 md:mx-0">{t('Jawaban atas pertanyaan yang sering diajukan.', 'Answers to frequently asked questions.')}</p>
                </div>
            </section>

            <section className="mx-auto max-w-4xl px-4 py-10">
                <div className="mb-6">
                    <SearchInput
                        value={search}
                        onChange={(v) => { setSearch(v); setActive(null); }}
                        placeholder="Cari pertanyaan..."
                        variant="pill"
                        className="max-w-xl"
                    />
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                    {categories.map((c) => (
                        <button
                            key={c}
                            onClick={() => { setSelected(c); setActive(null); setSearch(''); }}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                                selected === c
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200/80 bg-white py-12 text-center dark:border-slate-800/80 dark:bg-slate-900">
                        <p className="text-slate-500 dark:text-slate-400">Tidak menemukan pertanyaan yang cocok.</p>
                    </div>
                ) : (
                    <Accordion
                        items={filtered.map((faq, idx) => ({
                            key: String(idx),
                            title: faq.q,
                            content: <p className="text-slate-600 dark:text-slate-300">{faq.a}</p>,
                        }))}
                        activeKey={active !== null ? String(active) : undefined}
                        onToggle={(key) => setActive(active === Number(key) ? null : Number(key))}
                    />
                )}

                <div className="mt-10 text-center">
                    <p className="text-slate-500 dark:text-slate-400">{t('Masih ada pertanyaan?', 'Still have questions?')}</p>
                    {isEnabled('kontak') && (
                        <Link href="/kontak" className="mt-2 inline-block rounded-full bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-700">
                            {t('Hubungi Kami', 'Contact Us')}
                        </Link>
                    )}
                </div>
            </section>
        </>
    );
}
