import { Link } from '@inertiajs/react';
import { FlaskConical } from 'lucide-react';
import { ReactNode } from 'react';
import { ImageWithFallback } from './ImageWithFallback';

interface CardWithBackgroundProps {
    href: string;
    image: string | null;
    alt: string;
    title: string;
    subtitle?: string;
    badge?: ReactNode;
    footer?: ReactNode;
    className?: string;
    horizontal?: boolean;
    children?: ReactNode;
}

export function CardWithBackground({
    href,
    image,
    alt,
    title,
    subtitle,
    badge,
    footer,
    className = '',
    horizontal = false,
    children,
}: CardWithBackgroundProps) {
    const media = (
        <div className={`relative ${horizontal ? 'h-40 w-full shrink-0 sm:w-56' : 'h-48 w-full'} overflow-hidden bg-slate-200 dark:bg-slate-800`}>
            {image ? (
                <ImageWithFallback src={image} alt={alt} className="relative z-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            ) : (
                <div className="relative z-0 flex h-full items-center justify-center bg-linear-to-br from-indigo-500 to-violet-600 text-white">
                    <FlaskConical className="h-10 w-10" />
                </div>
            )}
            <div className="absolute inset-0 z-[1] bg-linear-to-t from-slate-900/85 via-slate-900/40 to-slate-900/10" />
            <div className="absolute inset-0 z-[2] flex flex-col justify-between p-4 text-white">
                {badge && <div className="flex justify-end">{badge}</div>}
                <div>
                    <h3 className="line-clamp-2 font-semibold">{title}</h3>
                    {subtitle && <p className="text-xs text-white/80">{subtitle}</p>}
                </div>
            </div>
        </div>
    );

    const body = (children || footer) && (
        <div className={`${horizontal ? 'flex-1 p-4' : 'border-t border-slate-200/80 p-4 dark:border-slate-800/80'}`}>
            {children}
            {footer && <div className="mt-2 flex items-center justify-between text-xs">{footer}</div>}
        </div>
    );

    if (horizontal) {
        return (
            <Link href={href} className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900 sm:flex-row ${className}`}>
                {media}
                {body}
            </Link>
        );
    }

    return (
        <Link href={href} className={`group block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900 ${className}`}>
            {media}
            {body}
        </Link>
    );
}
