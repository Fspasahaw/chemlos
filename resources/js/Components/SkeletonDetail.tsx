import { Skeleton } from './Skeleton';

export function SkeletonDetail({ rows = 4 }: { rows?: number }) {
    return (
        <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
            <div className="flex items-center gap-4">
                <Skeleton variant="circular" width={64} height={64} />
                <div className="flex-1 space-y-2">
                    <Skeleton width="40%" height={20} />
                    <Skeleton width="60%" height={14} />
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: rows }).map((_, i) => (
                    <Skeleton key={i} width="100%" height={16} />
                ))}
            </div>
        </div>
    );
}
