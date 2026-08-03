import { SearchX } from 'lucide-react';

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
}

export function EmptyState({ title = 'Tidak ada data', description = 'Belum ada data yang dapat ditampilkan.', icon, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center dark:border-slate-700 dark:bg-slate-900/50">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                {icon ?? <SearchX className="h-8 w-8" />}
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
