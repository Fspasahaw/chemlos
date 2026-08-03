import { ChevronRight, Home } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/" className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                <Home className="h-4 w-4" />
                <span className="sr-only">Beranda</span>
            </Link>
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    {item.href && index !== items.length - 1 ? (
                        <Link href={item.href} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                            {item.label}
                        </Link>
                    ) : (
                        <span className={index === items.length - 1 ? 'font-medium text-slate-900 dark:text-slate-100' : ''}>
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}
