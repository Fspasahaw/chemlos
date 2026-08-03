import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface LinkItem {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: LinkItem[];
    from?: number;
    to?: number;
    total?: number;
    itemName?: string;
}

export function Pagination({ links, from, to, total, itemName = 'data' }: PaginationProps) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            {typeof from === 'number' && typeof to === 'number' && typeof total === 'number' && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Menampilkan <span className="font-medium">{from}-{to}</span> dari <span className="font-medium">{total}</span> {itemName}
                </p>
            )}
            <div className="flex flex-wrap items-center gap-1">
                {links.map((link, idx) => {
                    if (idx === 0) {
                        return (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                preserveState
                                preserveScroll
                                className={`rounded-full border p-2 transition ${
                                    link.url
                                        ? 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                                        : 'cursor-not-allowed border-slate-100 opacity-50 dark:border-slate-800'
                                }`}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        );
                    }
                    if (idx === links.length - 1) {
                        return (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                preserveState
                                preserveScroll
                                className={`rounded-full border p-2 transition ${
                                    link.url
                                        ? 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                                        : 'cursor-not-allowed border-slate-100 opacity-50 dark:border-slate-800'
                                }`}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        );
                    }
                    return (
                        <Link
                            key={idx}
                            href={link.url || '#'}
                            preserveState
                            preserveScroll
                            className={`min-w-9 rounded-full border px-3 py-1.5 text-sm transition ${
                                link.active
                                    ? 'border-indigo-600 bg-indigo-600 text-white'
                                    : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
