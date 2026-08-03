import { X } from 'lucide-react';

interface FilterOption {
    value: string;
    label: string;
}

interface FilterChipsProps {
    options: FilterOption[];
    value: string | string[];
    onChange: (value: string | string[]) => void;
    multiple?: boolean;
    className?: string;
    allowReset?: boolean;
}

export function FilterChips({
    options,
    value,
    onChange,
    multiple = false,
    className = '',
    allowReset = true,
}: FilterChipsProps) {
    const selected = multiple ? ((Array.isArray(value) ? value : [value]) as string[]) : [value as string];

    const toggle = (optionValue: string) => {
        if (multiple) {
            if (selected.includes(optionValue)) {
                onChange(selected.filter((v) => v !== optionValue));
            } else {
                onChange([...selected, optionValue]);
            }
        } else {
            if (allowReset && selected.includes(optionValue)) {
                onChange('');
            } else {
                onChange(optionValue);
            }
        }
    };

    const isActive = (optionValue: string) => selected.includes(optionValue) && (multiple || optionValue !== '' || value === '');

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {options.map((option) => {
                const active = isActive(option.value);
                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => toggle(option.value)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                            active
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                    >
                        {option.label}
                        {active && multiple && <X className="h-3.5 w-3.5" />}
                    </button>
                );
            })}
        </div>
    );
}
