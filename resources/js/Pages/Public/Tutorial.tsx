import { Head, Link, router } from '@inertiajs/react';
import { Clock, Home, Play } from 'lucide-react';
import { useState } from 'react';
import { FilterChips } from '../../Components/FilterChips';
import { ImageWithFallback } from '../../Components/ImageWithFallback';
import { Pagination } from '../../Components/Pagination';
import { SearchInput } from '../../Components/SearchInput';
import { SkeletonCard } from '../../Components/Skeleton';
import { usePageLoading } from '../../Hooks/usePageLoading';
import { formatDate } from '../../lib/date';
import { videoJenisMap } from '../../lib/status';

interface FilterOption { value: string; label: string; }

interface Tutorial {
    id: number;
    judul: string;
    slug: string;
    jenis: string;
    durasi: number | null;
    thumbnail: string | null;
    created_at: string;
    alat: { nama: string; slug: string } | null;
}

interface TutorialPageProps {
    tutorials: { data: Tutorial[]; links: any[]; from: number; to: number; total: number };
    filters: { search?: string; jenis?: string };
    jenisOptions: FilterOption[];
}

export default function Tutorial({ tutorials, filters, jenisOptions }: TutorialPageProps) {
    const loading = usePageLoading();
    const [search, setSearch] = useState(filters.search || '');
    const [jenis, setJenis] = useState(filters.jenis || '');

    const submit = (payload: Record<string, string> = {}) => {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (jenis || payload.jenis !== undefined) {
            const next = payload.jenis !== undefined ? payload.jenis : jenis;
            if (next) params.jenis = next;
        }
        router.get('/tutorial', params, { preserveState: true, preserveScroll: true });
    };

    const formatDurasi = (s: number | null) => s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : null;

    return (
        <>
            <Head title="Tutorial" />
            <section className="bg-linear-to-br from-indigo-600 to-violet-700 py-16 text-white">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mb-3 flex items-center gap-2 text-sm text-white/80">
                        <Link href="/" className="flex items-center gap-1 hover:text-white hover:underline"><Home className="h-4 w-4" /> Beranda</Link>
                        <span>/</span>
                        <span className="text-white">Tutorial</span>
                    </div>
                    <h1 className="text-3xl font-bold md:text-4xl">Tutorial</h1>
                    <p className="mx-auto mt-3 max-w-2xl text-white/90 md:mx-0">Panduan video penggunaan alat dan aplikasi ChemLOS.</p>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-10">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                    <SearchInput
                        value={search}
                        onSearch={(val) => {
                            setSearch(val);
                            const params: Record<string, string> = {};
                            if (val) params.search = val;
                            if (jenis) params.jenis = jenis;
                            router.get('/tutorial', params, { preserveState: true, preserveScroll: true });
                        }}
                        placeholder="Cari tutorial..."
                        className="flex-1"
                    />
                </div>

                <div className="mb-6 flex flex-wrap items-center gap-3">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Jenis:</span>
                    <FilterChips options={jenisOptions} value={jenis} onChange={(v) => { setJenis(v as string); submit({ jenis: v as string }); }} />
                </div>

                {loading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : tutorials.data.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200/80 bg-white py-16 text-center dark:border-slate-800/80 dark:bg-slate-900">
                        <p className="text-slate-500 dark:text-slate-400">Belum ada tutorial.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {tutorials.data.map((v) => (
                                <Link key={v.id} href={`/tutorial/${v.slug}`} className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900">
                                    <div className="relative aspect-video bg-slate-200 dark:bg-slate-800">
                                        {v.thumbnail ? (
                                            <ImageWithFallback src={`/storage/${v.thumbnail}`} alt={v.judul} className="h-full w-full object-cover" />
                                        ) : null}
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 transition group-hover:bg-slate-900/25">
                                            <Play className="h-10 w-10 text-white opacity-90 transition group-hover:scale-110 group-hover:opacity-100" />
                                        </div>
                                        {v.durasi && <span className="absolute bottom-2 right-2 rounded bg-slate-900/70 px-1.5 py-0.5 text-xs text-white"><Clock className="mr-1 inline h-3 w-3" />{formatDurasi(v.durasi)}</span>}
                                    </div>
                                    <div className="p-4">
                                        <span className="text-xs font-medium uppercase text-indigo-600">{videoJenisMap[v.jenis] ?? v.jenis}</span>
                                        <h3 className="mt-1 font-semibold">{v.judul}</h3>
                                        {v.alat && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Alat: {v.alat.nama}</p>}
                                        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{formatDate(v.created_at)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="mt-6">
                            <Pagination links={tutorials.links} from={tutorials.from} to={tutorials.to} total={tutorials.total} itemName="video" />
                        </div>
                    </>
                )}
            </section>
        </>
    );
}
