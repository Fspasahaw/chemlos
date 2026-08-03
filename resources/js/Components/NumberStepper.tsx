import { Minus, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NumberStepperProps {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    onChange?: (value: number) => void;
    label?: string;
    error?: string;
    hint?: string;
    disabled?: boolean;
    size?: 'sm' | 'md';
    className?: string;
}

export function NumberStepper({
    value = 0,
    min = 0,
    max = Number.MAX_SAFE_INTEGER,
    step = 1,
    onChange,
    label,
    error,
    hint,
    disabled = false,
    size = 'md',
    className = '',
}: NumberStepperProps) {
    const [internal, setInternal] = useState<number | ''>(value ?? '');

    useEffect(() => {
        setInternal(value ?? '');
    }, [value]);

    const handleChange = (val: number | '') => {
        setInternal(val);
        if (typeof val === 'number') onChange?.(val);
    };

    const clamp = (v: number) => Math.min(max, Math.max(min, v));

    const decrement = () => {
        const current = typeof internal === 'number' ? internal : min;
        const next = clamp(current - step);
        handleChange(next);
    };

    const increment = () => {
        const current = typeof internal === 'number' ? internal : min;
        const next = clamp(current + step);
        handleChange(next);
    };

    const btnSize = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
    const inputSize = size === 'sm' ? 'h-8 py-1' : 'h-10 py-2.5';
    const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</label>
            )}
            <div className="flex items-stretch">
                <button
                    type="button"
                    onClick={decrement}
                    disabled={disabled || (typeof internal === 'number' && internal <= min)}
                    className={`${btnSize} inline-flex items-center justify-center rounded-l-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700`}
                    aria-label="Kurangi"
                >
                    <Minus className={iconSize} />
                </button>
                <input
                    type="number"
                    inputMode="numeric"
                    min={min}
                    max={max}
                    step={step}
                    disabled={disabled}
                    value={internal}
                    onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === '') {
                            handleChange('');
                            return;
                        }
                        const num = parseInt(raw, 10);
                        if (!Number.isNaN(num)) handleChange(clamp(num));
                    }}
                    onBlur={() => {
                        if (internal === '' || typeof internal !== 'number') handleChange(min);
                    }}
                    className={`[appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden m-0 w-16 flex-1 border-y border-slate-200 bg-white ${inputSize} px-3 text-center text-sm text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100`}
                />
                <button
                    type="button"
                    onClick={increment}
                    disabled={disabled || (typeof internal === 'number' && internal >= max)}
                    className={`${btnSize} inline-flex items-center justify-center rounded-r-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700`}
                    aria-label="Tambah"
                >
                    <Plus className={iconSize} />
                </button>
            </div>
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
            {hint && !error && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
        </div>
    );
}
