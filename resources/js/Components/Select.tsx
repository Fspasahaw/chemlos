import { Check, ChevronDown } from 'lucide-react';
import { forwardRef, SelectHTMLAttributes, useEffect, useRef, useState } from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    hint?: string;
    options: SelectOption[];
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
    ({ label, error, hint, options, value, onChange, className = '', disabled, ...props }, ref) => {
        const [open, setOpen] = useState(false);
        const [selected, setSelected] = useState<string>((value as string) ?? '');
        const containerRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            setSelected((value as string) ?? '');
        }, [value]);

        useEffect(() => {
            const handleClickOutside = (e: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                    setOpen(false);
                }
            };
            if (open) document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, [open]);

        const handleSelect = (optionValue: string) => {
            setSelected(optionValue);
            setOpen(false);
            if (onChange) {
                const synthetic = { target: { value: optionValue, name: props.name } } as any;
                onChange(synthetic);
            }
        };

        const selectedLabel = options.find((o) => o.value === selected)?.label ?? 'Pilih...';

        return (
            <div className={`relative w-full ${className}`} ref={containerRef}>
                {label && (
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                        {label}
                    </label>
                )}
                <button
                    type="button"
                    ref={ref}
                    disabled={disabled}
                    onClick={() => setOpen(!open)}
                    className={`relative flex w-full items-center justify-start gap-3 rounded-xl border bg-white px-4 py-2.5 text-left text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900 dark:text-slate-100 ${
                        error
                            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-700'
                            : 'border-slate-200 dark:border-slate-700'
                    }`}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                >
                    <span className="flex-1 truncate">{selectedLabel}</span>
                    <ChevronDown className={`ml-1 h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                    <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200/80 bg-white shadow-lg dark:border-slate-700/80 dark:bg-slate-900">
                        <ul className="max-h-60 overflow-auto py-1" role="listbox">
                            {options.map((opt) => {
                                const active = opt.value === selected;
                                return (
                                    <li
                                        key={opt.value}
                                        role="option"
                                        aria-selected={active}
                                        onClick={() => handleSelect(opt.value)}
                                        className={`flex cursor-pointer items-center justify-between px-4 py-2 text-sm transition ${
                                            active
                                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <span className="truncate">{opt.label}</span>
                                        {active && <Check className="h-4 w-4 text-indigo-600" />}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
                {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
                {hint && !error && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';
