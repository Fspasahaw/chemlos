import { Head, Link, usePage } from '@inertiajs/react';
import { FlaskConical, Grid3X3, Home, List, Search, SearchX } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../../Components/Badge';
import { Button } from '../../Components/Button';
import { CardWithBackground } from '../../Components/CardWithBackground';
import { ImageWithFallback } from '../../Components/ImageWithFallback';
import { FilterChips } from '../../Components/FilterChips';
import { Pagination } from '../../Components/Pagination';
import { SearchInput } from '../../Components/SearchInput';
import { Select } from '../../Components/Select';
import { SkeletonCard } from '../../Components/Skeleton';
import { Tooltip } from '../../Components/Tooltip';
import { useFilter } from '../../Hooks/useFilter';
import { usePageLoading } from '../../Hooks/usePageLoading';
import { alatStatusMap } from '../../lib/status';

interface Tool {
    id: number;
    nama: string;
    kode: string;
    slug: string;
    status: string;
    kondisi: string;
    stok_tersedia: number;
    stok_total: number;
    foto_utama: string | null;
    laboratorium: { id: number; nama: string; slug: string };
    kategori_alat: { id: number; nama: string; slug: string } | null;
}

interface FilterOption { value: string; label: string; }

interface AlatPageProps {
    alat: { data: Tool[]; links: any[]; from: number; to: number; total: number };
    filters: { search?: string; laboratorium?: string; kategori?: string; status?: string; kondisi?: string; sort?: string };
    laboratoriumOptions: FilterOption[];
    kategoriOptions: FilterOption[];
    statusOptions: FilterOption[];
    kondisiOptions: FilterOption[];
}

const statusVariant = (status: string) => {
    switch (status) {
        case 'tersedia': return 'success';
        case 'dipinjam': return 'warning';
        case 'maintenance': return 'neutral';
        default: return 'danger';
    }
};

export default function Alat({ alat, laboratoriumOptions, kategoriOptions, statusOptions, kondisiOptions }: AlatPageProps) {
    const { features } = usePage().props as any;
    const isEnabled = (key: string) => !!features?.[key];
    const loading = usePageLoading();
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const { filters, apply } = useFilter('/alat');

    const reset = () => apply({ search: '', laboratorium: '', kategori: '', status: '', kondisi: '', sort: '' });

    const photoUrl = (path: string | null) => (path ? `/storage/${path}` : null);

    return (
        <>
            <Head title="Alat" />
            <section className="bg-linear-to-br from-indigo-600 to-violet-700 py-16 text-white">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mb-3 flex items-center gap-2 text-sm text-white/80">
                        <Link href="/" className="flex items-center gap-1 hover:text-white hover:underline"><Home className="h-4 w-4" /> Beranda</Link>
                        <span>/</span>
                        <span className="text-white">Alat Laboratorium</span>
                    </div>
                    <h1 className="text-3xl font-bold md:text-4xl">Alat Laboratorium</h1>
                    <p className="mx-auto mt-3 max-w-2xl text-white/90 md:mx-0">Cari dan lihat ketersediaan alat laboratorium.</p>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-10">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
                    <SearchInput
                        value={filters?.search ?? ''}
                        onSearch={(val) => apply({ search: val })}
                        placeholder="Cari alat..."
                        className="flex-1"
                    />
                    <div className="flex items-center gap-2">
                        <Button onClick={() => apply({})} leftIcon={<Search className="h-4 w-4" />}>Cari</Button>
                        <Tooltip content={view === 'grid' ? 'Tampilan List' : 'Tampilan Grid'}>
                            <button onClick={() => setView(view === 'grid' ? 'list' : 'grid')} className="rounded-lg border border-slate-300 bg-white p-2.5 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300" aria-label={view === 'grid' ? 'Tampilan List' : 'Tampilan Grid'}>
                                {view === 'grid' ? <List className="h-5 w-5" /> : <Grid3X3 className="h-5 w-5" />}
                            </button>
                        </Tooltip>
                    </div>
                </div>

                <div className="mb-6 flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Laboratorium:</span>
                        <FilterChips options={laboratoriumOptions} value={filters?.laboratorium ?? ''} onChange={(v) => apply({ laboratorium: v as string })} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Kategori:</span>
                        <FilterChips options={kategoriOptions} value={filters?.kategori ?? ''} onChange={(v) => apply({ kategori: v as string })} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Status:</span>
                        <FilterChips options={statusOptions} value={filters?.status ?? ''} onChange={(v) => apply({ status: v as string })} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Kondisi:</span>
                        <FilterChips options={kondisiOptions} value={filters?.kondisi ?? ''} onChange={(v) => apply({ kondisi: v as string })} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Urutkan:</span>
                        <Select
                            options={[
                                { value: 'terbaru', label: 'Terbaru' },
                                { value: 'nama', label: 'Nama' },
                                { value: 'tersedia', label: 'Stok Tersedia' },
                            ]}
                            value={filters?.sort || 'terbaru'}
                            onChange={(e) => apply({ sort: e.target.value === 'terbaru' ? '' : e.target.value })}
                            className="w-44"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : alat.data.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200/80 bg-white py-16 text-center dark:border-slate-800/80 dark:bg-slate-900">
                        <SearchX className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-700" />
                        <p className="mt-4 text-slate-500 dark:text-slate-400">Tidak Menemukan Alat Yang Dicari.</p>
                        <div className="mt-4 flex flex-wrap justify-center gap-3">
                            <Button onClick={reset}>Reset Filter</Button>
                            {isEnabled('kontak') && <Link href="/kontak" className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Hubungi Kami</Link>}
                            {isEnabled('faq') && <Link href="/faq" className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Lihat FAQ</Link>}
                        </div>
                    </div>
                ) : (
                    <>
                        {view === 'grid' ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {alat.data.map((tool) => (
                                    <CardWithBackground
                                        key={tool.id}
                                        href={`/alat/${tool.slug}`}
                                        image={photoUrl(tool.foto_utama) || ''}
                                        alt={tool.nama}
                                        title={tool.nama}
                                        subtitle={tool.kode}
                                        badge={<Badge variant={alatStatusMap[tool.status]?.variant ?? statusVariant(tool.status)}>{alatStatusMap[tool.status]?.label ?? tool.status.replace('_', ' ')}</Badge>}
                                    >
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="info">{tool.laboratorium.nama}</Badge>
                                            {tool.kategori_alat && <Badge variant="neutral">{tool.kategori_alat.nama}</Badge>}
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Stok: {tool.stok_tersedia}/{tool.stok_total}</p>
                                    </CardWithBackground>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {alat.data.map((tool) => (
                                    <CardWithBackground
                                        key={tool.id}
                                        href={`/alat/${tool.slug}`}
                                        image={photoUrl(tool.foto_utama) || ''}
                                        alt={tool.nama}
                                        title={tool.nama}
                                        subtitle={tool.kode}
                                        badge={<Badge variant={alatStatusMap[tool.status]?.variant ?? statusVariant(tool.status)}>{alatStatusMap[tool.status]?.label ?? tool.status.replace('_', ' ')}</Badge>}
                                        horizontal
                                    >
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{tool.laboratorium.nama}</p>
                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            {tool.kategori_alat && <Badge variant="neutral">{tool.kategori_alat.nama}</Badge>}
                                            <span className="text-xs text-slate-500 dark:text-slate-400">Stok: {tool.stok_tersedia}/{tool.stok_total}</span>
                                        </div>
                                    </CardWithBackground>
                                ))}
                            </div>
                        )}
                        <div className="mt-6">
                            <Pagination links={alat.links} from={alat.from} to={alat.to} total={alat.total} itemName="alat" />
                        </div>
                    </>
                )}
            </section>
        </>
    );
}
