import { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    width?: string | number;
    height?: string | number;
    className?: string;
    count?: number;
    shimmer?: boolean;
}

export function Skeleton({
    variant = 'text',
    width,
    height,
    className = '',
    count = 1,
    shimmer = true,
    ...props
}: SkeletonProps) {
    const variantClass = {
        text: 'rounded-md',
        circular: 'rounded-full',
        rectangular: 'rounded-none',
        rounded: 'rounded-2xl',
    }[variant];

    const style = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    };

    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`relative overflow-hidden bg-slate-200 dark:bg-slate-800 ${variantClass} ${className}`}
                    style={style}
                    {...props}
                >
                    {shimmer && (
                        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/30 to-transparent dark:via-white/10" />
                    )}
                </div>
            ))}
        </>
    );
}

interface SkeletonCardProps {
    lines?: number;
    className?: string;
}

export function SkeletonCard({ lines = 3, className = '' }: SkeletonCardProps) {
    return (
        <div className={`rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900 ${className}`}>
            <Skeleton variant="rounded" width="100%" height={160} className="mb-4" />
            <Skeleton width="75%" height={20} className="mb-2" />
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton key={i} width={i === lines - 1 ? '50%' : '100%'} height={14} className="mb-2" />
            ))}
        </div>
    );
}

interface SkeletonTableProps {
    rows?: number;
    columns?: number;
    className?: string;
}

export function SkeletonTable({ rows = 5, columns = 4, className = '' }: SkeletonTableProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} height={20} />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                    {Array.from({ length: columns }).map((_, j) => (
                        <Skeleton key={j} height={16} />
                    ))}
                </div>
            ))}
        </div>
    );
}
