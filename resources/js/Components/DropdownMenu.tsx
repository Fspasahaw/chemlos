import { ReactNode, useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';

interface DropdownMenuItem {
    label?: string;
    href?: string;
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    data?: Record<string, any>;
    onClick?: () => void;
    icon?: ReactNode;
    variant?: 'default' | 'danger' | 'divider';
}

interface DropdownMenuProps {
    trigger: ReactNode;
    items: DropdownMenuItem[];
    align?: 'left' | 'right';
    className?: string;
}

export function DropdownMenu({ trigger, items, align = 'right', className = '' }: DropdownMenuProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
    };

    const alignClass = align === 'right' ? 'right-0' : 'left-0';

    return (
        <div className={`relative inline-block ${className}`} ref={ref} onKeyDown={handleKeyDown}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="inline-flex items-center justify-center"
                aria-haspopup="true"
                aria-expanded={open}
            >
                {trigger}
            </button>
            {open && (
                <div className={`absolute ${alignClass} z-50 mt-2 w-56 rounded-xl border border-slate-200/80 bg-white py-1 shadow-lg dark:border-slate-700/80 dark:bg-slate-900`}>
                    {items.map((item, idx) => {
                        if (item.variant === 'divider') {
                            return <div key={idx} className="my-1 border-t border-slate-200 dark:border-slate-700" />;
                        }
                        const base = 'flex w-full items-center gap-2 px-4 py-2 text-sm text-left transition hover:bg-slate-100 dark:hover:bg-slate-800';
                        const variant = item.variant === 'danger' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200';
                        const content = (
                            <>
                                {item.icon && <span className="shrink-0">{item.icon}</span>}
                                <span>{item.label}</span>
                            </>
                        );
                        return item.href ? (
                            <Link key={idx} href={item.href} method={item.method || 'get'} data={item.data} as="button" className={`${base} ${variant}`} onClick={() => setOpen(false)}>
                                {content}
                            </Link>
                        ) : (
                            <button key={idx} type="button" onClick={() => { item.onClick?.(); setOpen(false); }} className={`${base} ${variant}`}>
                                {content}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
