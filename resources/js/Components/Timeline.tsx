import { Activity, AlertTriangle, CheckCircle, Clock, Package, Wrench } from 'lucide-react';

export interface TimelineItem {
    id: number | string;
    icon?: 'activity' | 'check' | 'warning' | 'package' | 'wrench' | 'clock';
    title: string;
    description?: string;
    date: string;
    status?: string;
}

const iconMap = {
    activity: Activity,
    check: CheckCircle,
    warning: AlertTriangle,
    package: Package,
    wrench: Wrench,
    clock: Clock,
};

const colorMap: Record<string, { bg: string; text: string }> = {
    activity: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-300' },
    check: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-300' },
    warning: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-600 dark:text-rose-300' },
    package: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-300' },
    wrench: { bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-600 dark:text-sky-300' },
    clock: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300' },
};

interface TimelineProps {
    items: TimelineItem[];
    size?: 'sm' | 'lg';
    className?: string;
}

export function Timeline({ items, size = 'sm', className = '' }: TimelineProps) {
    if (!items || items.length === 0) {
        return <p className="text-sm text-slate-500 dark:text-slate-400">Tidak ada riwayat.</p>;
    }

    const isLg = size === 'lg';

    return (
        <div className={`relative ${isLg ? 'pl-12' : 'pl-4'} ${className}`}>
            <div className={`absolute ${isLg ? 'left-5' : 'left-4'} top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700`} />
            {items.map((item) => {
                const Icon = item.icon ? iconMap[item.icon] : Activity;
                const colors = item.icon ? colorMap[item.icon] : colorMap.activity;
                return (
                    <div key={item.id} className={`relative ${isLg ? 'mb-8 last:mb-0' : 'flex gap-4 pb-8'}`}>
                        <span className={`${
                            isLg
                                ? 'absolute -left-12 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white shadow-sm dark:border-slate-900'
                                : 'z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white shadow-sm dark:border-slate-900'
                        } ${colors.bg} ${colors.text}`}>
                            <Icon className={isLg ? 'h-5 w-5' : 'h-4 w-4'} />
                        </span>
                        <div className={isLg ? '' : 'flex-1'}>
                            <p className={`text-slate-900 dark:text-slate-100 ${isLg ? 'text-sm font-semibold' : 'text-sm font-medium'}`}>{item.title}</p>
                            {item.description && <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>}
                            {item.status && <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{item.status}</span>}
                            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{item.date}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
