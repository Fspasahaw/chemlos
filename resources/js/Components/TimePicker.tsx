import { Clock } from 'lucide-react';
import { forwardRef, InputHTMLAttributes, useEffect, useRef, useState } from 'react';

type TimePickerProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> & {
    label?: string;
    error?: string;
    interval?: 1 | 5 | 10 | 15 | 30 | 60;
    onChange?: (e: { target: { value: string } }) => void;
};

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const getMinutes = (interval: number) =>
    Array.from({ length: Math.ceil(60 / interval) }, (_, i) => (i * interval).toString().padStart(2, '0'));

export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(function TimePicker(
    { label, error, value, onChange, interval = 30, className = '', ...props },
    ref
) {
    const minutes = getMinutes(interval);
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const currentValue = typeof value === 'string' ? value : '';

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
        };
        if (open) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const [selectedHour, selectedMinute] = currentValue ? currentValue.split(':') : ['', ''];

    const setTime = (hour: string, minute: string) => {
        const formatted = `${hour}:${minute}`;
        if (onChange) onChange({ target: { value: formatted } });
    };

    const displayValue = currentValue ? currentValue : 'Pilih waktu';

    return (
        <div className={`relative w-full ${className}`} ref={containerRef}>
            {label && (
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    {label}
                </label>
            )}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`flex w-full items-center justify-between rounded-xl border bg-white px-4 py-2.5 text-left text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-900 dark:text-slate-100 ${
                    error
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-700'
                        : 'border-slate-200 dark:border-slate-700'
                }`}
            >
                <span>{displayValue}</span>
                <Clock className="h-4 w-4 text-slate-400" />
            </button>
            {open && (
                <div className="absolute z-50 mt-1 flex gap-2 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xl dark:border-slate-700/80 dark:bg-slate-900">
                    <div className="h-48 w-20 overflow-y-auto rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                        {hours.map((h) => (
                            <button
                                key={h}
                                type="button"
                                onClick={() => setTime(h, selectedMinute || '00')}
                                className={`w-full px-3 py-1.5 text-sm transition ${
                                    selectedHour === h
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                                }`}
                            >
                                {h}
                            </button>
                        ))}
                    </div>
                    <div className="h-48 w-20 overflow-y-auto rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                        {minutes.map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setTime(selectedHour || '00', m)}
                                className={`w-full px-3 py-1.5 text-sm transition ${
                                    selectedMinute === m
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                                }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
            <input ref={ref} type="hidden" value={currentValue} {...props} />
        </div>
    );
});

TimePicker.displayName = 'TimePicker';
