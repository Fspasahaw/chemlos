import { ChevronDown } from 'lucide-react';
import { ReactNode } from 'react';

interface AccordionItem {
    key: string;
    title: ReactNode;
    content: ReactNode;
}

interface AccordionProps {
    items: AccordionItem[];
    activeKey?: string | string[];
    onToggle?: (key: string) => void;
    multiple?: boolean;
    className?: string;
}

export function Accordion({ items, activeKey, onToggle, className = '' }: AccordionProps) {
    const active = Array.isArray(activeKey) ? activeKey : activeKey ? [activeKey] : [];

    const toggle = (key: string) => {
        if (onToggle) {
            onToggle(key);
        }
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {items.map((item) => {
                const isOpen = active.includes(item.key);
                return (
                    <div
                        key={item.key}
                        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-shadow hover:shadow-sm dark:border-slate-800/80 dark:bg-slate-900"
                    >
                        <button
                            type="button"
                            onClick={() => toggle(item.key)}
                            className="flex w-full items-center justify-between px-5 py-4 text-left font-medium transition hover:bg-slate-50 dark:hover:bg-slate-900/50"
                        >
                            <span className="text-slate-900 dark:text-slate-100">{item.title}</span>
                            <ChevronDown className={`h-5 w-5 shrink-0 text-indigo-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden">
                                <div className="border-t border-slate-200/80 px-5 py-4 text-sm text-slate-600 dark:border-slate-800/80 dark:text-slate-300">
                                    {item.content}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
