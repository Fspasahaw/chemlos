import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Option {
    value: string;
    label: string;
}

interface SelectSearchProps {
    label?: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    className?: string;
}

export function SelectSearch({ label, options, value, onChange, placeholder = 'Cari...', error, disabled, className = '' }: SelectSearchProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    const selected = options.find((o) => o.value === value);
    const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));

    useEffect(() => {
        const handle = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    const select = (v: string) => {
        onChange(v);
        setSearch('');
        setOpen(false);
    };

    return (
        <div ref={ref} className={`relative ${className}`}>
            {label && <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</label>}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(!open)}
                className={`flex w-full items-center justify-start gap-3 rounded-xl border bg-white px-4 py-2.5 text-left text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-900 ${error ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-indigo-500 dark:border-slate-700'} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
            >
                <span className={`flex-1 truncate ${selected ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>{selected?.label ?? placeholder}</span>
                <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 text-slate-400" />
            </button>
            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                    <div className="relative mb-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={placeholder}
                            className="w-full rounded-lg border border-slate-200 bg-transparent py-1.5 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700"
                            autoFocus
                        />
                    </div>
                    <div className="max-h-48 overflow-auto">
                        {filtered.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-slate-500">Tidak ditemukan</div>
                        ) : (
                            filtered.map((o) => (
                                <button
                                    key={o.value}
                                    type="button"
                                    onClick={() => select(o.value)}
                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 ${o.value === value ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'}`}
                                >
                                    {o.label}
                                    {o.value === value && <Check className="h-4 w-4" />}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
        </div>
    );
}
