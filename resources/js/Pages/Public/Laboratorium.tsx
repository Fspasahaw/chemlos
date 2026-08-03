import { Head, Link, router, usePage } from '@inertiajs/react';
import { FlaskConical, Grid3X3, Home, List, Search, SearchX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '../../Components/Badge';
import { Button } from '../../Components/Button';
import { CardWithBackground } from '../../Components/CardWithBackground';
import { ImageWithFallback } from '../../Components/ImageWithFallback';
import { FilterChips } from '../../Components/FilterChips';
import { Pagination } from '../../Components/Pagination';
import { SearchInput } from '../../Components/SearchInput';
import { SkeletonCard } from '../../Components/Skeleton';
import { Tooltip } from '../../Components/Tooltip';
import { usePageLoading } from '../../Hooks/usePageLoading';
import { laboratoriumStatusMap } from '../../lib/status';

interface Lab {
    id: number;
    nama: string;
    kode: string;
    slug: string;
    status: string;
    lokasi: string;
    kapasitas: number;
    alats_count: number;
    foto_utama: string | null;
}

interface FilterOption { value: string; label: string; }

interface LaboratoriumPageProps {
    laboratorium: { data: Lab[]; links: any[]; from: number; to: number; total: number };
    filters: { search?: string; status?: string; lokasi?: string; kapasitas?: string };
    statusOptions: FilterOption[];
    lokasiOptions: FilterOption[];
    kapasitasOptions: FilterOption[];
}

const statusVariant = (status: string) => status === 'aktif' ? 'success' : 'neutral';

export default function Laboratorium({ laboratorium, filters, statusOptions, lokasiOptions, kapasitasOptions }: LaboratoriumPageProps) {
    const { features } = usePage().props as any;
    const isEnabled = (key: string) => !!features?.[key];
    const loading = usePageLoading();
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [lokasi, setLokasi] = useState(filters.lokasi || '');
    const [kapasitas, setKapasitas] = useState(filters.kapasitas || '');
    const [view, setView] = useState<'grid' | 'list'>('grid');

    const applyFilters = (payload: Record<string, string> = {}) => {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (status || payload.status !== undefined) {
            const next = payload.status !== undefined ? payload.status : status;
            if (next) params.status = next;
        }
        if (lokasi || payload.lokasi !== undefined) {
            const next = payload.lokasi !== undefined ? payload.lokasi : lokasi;
            if (next) params.lokasi = next;
        }
        if (kapasitas || payload.kapasitas !== undefined) {
            const next = payload.kapasitas !== undefined ? payload.kapasitas : kapasitas;
            if (next) params.kapasitas = next;
        }
        router.get('/laboratorium', params, { preserveState: true, preserveScroll: true });
    };

    const didMount = useRef(false);
    useEffect(() => {
        if (!didMount.current) { didMount.current = true; return; }
        const t = setTimeout(() => applyFilters({}), 400);
        return () => clearTimeout(t);
    }, [search]);

    const reset = () => {
        setSearch(''); setStatus(''); setLokasi(''); setKapasitas('');
        router.get('/laboratorium', {}, { preserveState: true, preserveScroll: true });
    };

    const photoUrl = (path: string | null) => (path ? `/storage/${path}` : null);

    return (
        <>
            <Head title="Laboratorium" />
            <section className="bg-linear-to-br from-indigo-600 to-violet-700 py-16 text-white">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mb-3 flex items-center gap-2 text-sm text-white/80">
                        <Link href="/" className="flex items-center gap-1 hover:text-white hover:underline"><Home className="h-4 w-4" /> Beranda</Link>
                        <span>/</span>
                        <span className="text-white">Laboratorium</span>
                    </div>
                    <h1 className="text-3xl font-bold md:text-4xl">Laboratorium</h1>
                    <p className="mx-auto mt-3 max-w-2xl text-white/90 md:mx-0">Temukan laboratorium yang tersedia untuk peminjaman alat.</p>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-10">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
                    <SearchInput
                        value={search}
                        onChange={(v) => setSearch(v)}
                        onSearch={() => applyFilters()}
                        placeholder="Cari laboratorium..."
                        className="flex-1"
                    />
                    <div className="flex items-center gap-2">
                        <Button onClick={() => applyFilters()} leftIcon={<Search className="h-4 w-4" />}>Cari</Button>
                        <Tooltip content={view === 'grid' ? 'Tampilan List' : 'Tampilan Grid'}>
                            <button onClick={() => setView(view === 'grid' ? 'list' : 'grid')} className="rounded-lg border border-slate-300 bg-white p-2.5 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300" aria-label={view === 'grid' ? 'Tampilan List' : 'Tampilan Grid'}>
                                {view === 'grid' ? <List className="h-5 w-5" /> : <Grid3X3 className="h-5 w-5" />}
                            </button>
                        </Tooltip>
                    </div>
                </div>

                <div className="mb-6 flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Status:</span>
                        <FilterChips options={statusOptions} value={status} onChange={(v) => { setStatus(v as string); applyFilters({ status: v as string }); }} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Lokasi:</span>
                        <FilterChips options={lokasiOptions} value={lokasi} onChange={(v) => { setLokasi(v as string); applyFilters({ lokasi: v as string }); }} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Kapasitas:</span>
                        <FilterChips options={kapasitasOptions} value={kapasitas} onChange={(v) => { setKapasitas(v as string); applyFilters({ kapasitas: v as string }); }} />
                    </div>
                </div>

                {loading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : laboratorium.data.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200/80 bg-white py-16 text-center dark:border-slate-800/80 dark:bg-slate-900">
                        <SearchX className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-700" />
                        <p className="mt-4 text-slate-500 dark:text-slate-400">Tidak menemukan laboratorium yang cocok.</p>
                        <div className="mt-4 flex justify-center gap-3">
                            <Button onClick={reset}>Reset Filter</Button>
                            {isEnabled('kontak') && <Link href="/kontak" className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Hubungi Kami</Link>}
                        </div>
                    </div>
                ) : (
                    <>
                        {view === 'grid' ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {laboratorium.data.map((lab) => (
                                    <CardWithBackground
                                        key={lab.id}
                                        href={`/laboratorium/${lab.slug}`}
                                        image={photoUrl(lab.foto_utama) || ''}
                                        alt={lab.nama}
                                        title={lab.nama}
                                        subtitle={`${lab.kode} • ${lab.lokasi}`}
                                        badge={<Badge variant={statusVariant(lab.status)}>{laboratoriumStatusMap[lab.status]?.label ?? lab.status}</Badge>}
                                        footer={<span className="text-slate-500 dark:text-slate-400">{lab.alats_count} alat • Kapasitas {lab.kapasitas}</span>}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {laboratorium.data.map((lab) => (
                                    <CardWithBackground
                                        key={lab.id}
                                        href={`/laboratorium/${lab.slug}`}
                                        image={photoUrl(lab.foto_utama) || ''}
                                        alt={lab.nama}
                                        title={lab.nama}
                                        subtitle={lab.kode}
                                        badge={<Badge variant={statusVariant(lab.status)}>{laboratoriumStatusMap[lab.status]?.label ?? lab.status}</Badge>}
                                        horizontal
                                    >
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{lab.lokasi}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Kapasitas {lab.kapasitas} orang</p>
                                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{lab.alats_count} alat</p>
                                    </CardWithBackground>
                                ))}
                            </div>
                        )}
                        <div className="mt-6">
                            <Pagination links={laboratorium.links} from={laboratorium.from} to={laboratorium.to} total={laboratorium.total} itemName="laboratorium" />
                        </div>
                    </>
                )}
            </section>
        </>
    );
}
