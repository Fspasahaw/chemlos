import { Head, Link, router, usePage } from '@inertiajs/react';
import { Bell, Check, SearchX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from '@/Components/Badge';
import { DatePicker } from '@/Components/DatePicker';
import { EmptyState } from '@/Components/EmptyState';
import { FilterChips } from '@/Components/FilterChips';
import { Pagination } from '@/Components/Pagination';
import { Select } from '@/Components/Select';
import { useFilter } from '@/Hooks/useFilter';

interface Notif {
    id: number;
    judul: string;
    pesan: string;
    jenis: string;
    kategori?: string;
    link: string | null;
    dibaca_pada: string | null;
    created_at: string;
}

interface PageProps {
    items: {
        data: Notif[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number;
        to: number;
        total: number;
    };
    unread_count: number;
    filters: {
        jenis: string;
        status: string;
        dari: string;
        sampai: string;
    };
    filterOptions: {
        jenis: string[];
        status: { value: string; label: string }[];
    };
}

export default function Index() {
    const { items, unread_count, filterOptions } = usePage().props as unknown as PageProps;
    const { filters, apply } = useFilter('/notifikasi');

    const relativeTime = (value: string) => {
        try {
            return formatDistanceToNow(new Date(value), { addSuffix: true, locale: id });
        } catch {
            return value;
        }
    };

    const jenisOptions = [
        { value: '', label: 'Semua Jenis' },
        ...filterOptions.jenis.map((j) => ({ value: j, label: j.charAt(0).toUpperCase() + j.slice(1).replace(/_/g, ' ') })),
    ];

    const badgeVariant = (jenis: string) => {
        const allowed = ['info', 'success', 'warning', 'danger', 'neutral'];
        if (allowed.includes(jenis)) return jenis;
        if (jenis.includes('kerusakan') || jenis.includes('terlambat') || jenis.includes('danger')) return 'danger';
        if (jenis.includes('pengingat') || jenis.includes('warning')) return 'warning';
        if (jenis.includes('peminjaman')) return 'info';
        if (jenis.includes('maintenance')) return 'neutral';
        return 'default';
    };

    const markAsRead = (n: Notif) => {
        router.post(`/notifikasi/${n.id}/read`, {}, { preserveScroll: true });
    };

    const markAllRead = () => {
        router.post('/notifikasi/read-all', {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Notifikasi" />

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                        <Bell className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Notifikasi</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {unread_count > 0 ? `${unread_count} belum dibaca` : 'Tidak ada notifikasi baru'}
                        </p>
                    </div>
                </div>
                {unread_count > 0 && (
                    <button
                        type="button"
                        onClick={markAllRead}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <Check className="h-4 w-4" /> Tandai Semua Dibaca
                    </button>
                )}
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-700/80 dark:bg-slate-900">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Select
                        label="Jenis Notifikasi"
                        options={jenisOptions}
                        value={filters?.jenis ?? ''}
                        onChange={(e) => apply({ jenis: e.target.value })}
                    />
                    <div className="md:col-span-2">
                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
                        <FilterChips
                            options={filterOptions.status}
                            value={filters?.status ?? ''}
                            onChange={(value) => apply({ status: value as string })}
                        />
                    </div>
                    <DatePicker
                        label="Dari Tanggal"
                        value={filters?.dari ?? ''}
                        onChange={(e) => apply({ dari: e.target.value })}
                    />
                    <DatePicker
                        label="Sampai Tanggal"
                        value={filters?.sampai ?? ''}
                        onChange={(e) => apply({ sampai: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-3">
                {items.data.length === 0 ? (
                    <EmptyState
                        title="Tidak ada notifikasi"
                        description="Belum ada notifikasi yang cocok dengan filter yang dipilih."
                        icon={<SearchX className="h-8 w-8" />}
                        action={
                            <button
                                type="button"
                                onClick={() => apply({ jenis: '', status: '', dari: '', sampai: '' })}
                                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                Reset Filter
                            </button>
                        }
                    />
                ) : (
                    items.data.map((n) => (
                        <div
                            key={n.id}
                            className={`rounded-2xl border p-5 transition ${
                                n.dibaca_pada
                                    ? 'border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900'
                                    : 'border-indigo-200 bg-indigo-50 dark:border-indigo-900/30 dark:bg-indigo-900/20'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-semibold">{n.judul}</h3>
                                        <Badge variant={badgeVariant(n.jenis) as any}>
                                            {(n.kategori || n.jenis).replace(/_/g, ' ')}
                                        </Badge>
                                        {!n.dibaca_pada && <span className="h-2 w-2 rounded-full bg-indigo-500" />}
                                    </div>
                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{n.pesan}</p>
                                    <p className="mt-2 text-xs text-slate-400">{relativeTime(n.created_at)}</p>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                {!n.dibaca_pada && (
                                    <button
                                        type="button"
                                        onClick={() => markAsRead(n)}
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                        Tandai Dibaca
                                    </button>
                                )}
                                {n.link && (
                                    <Link
                                        href={n.link}
                                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700"
                                    >
                                        Lihat Detail
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-6">
                <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />
            </div>
        </>
    );
}
