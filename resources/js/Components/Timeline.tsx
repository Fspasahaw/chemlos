import { Activity, AlertTriangle, CheckCircle, Clock, Package, Wrench } from 'lucide-react';

interface TimelineItem {
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

interface TimelineProps {
    items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
    if (!items || items.length === 0) {
        return <p className="text-sm text-slate-500 dark:text-slate-400">Tidak ada riwayat.</p>;
    }

    return (
        <div className="relative space-y-0 pl-4">
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800" />
            {items.map((item) => {
                const Icon = item.icon ? iconMap[item.icon] : Activity;
                return (
                    <div key={item.id} className="relative flex gap-4 pb-8">
                        <div className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-indigo-100 text-indigo-600 shadow-sm dark:border-slate-900 dark:bg-indigo-900/30 dark:text-indigo-300">
                            <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.title}</p>
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
