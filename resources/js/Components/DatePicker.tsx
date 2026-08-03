import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, eachDayOfInterval, endOfMonth, format, getDate, isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';
import { forwardRef, InputHTMLAttributes, useEffect, useRef, useState } from 'react';

type DatePickerProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> & {
    label?: string;
    error?: string;
    onChange?: (e: { target: { value: string } }) => void;
};

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker({ label, error, value, onChange, className = '', ...props }, ref) {
    const [open, setOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => {
        if (typeof value === 'string' && value) return new Date(value);
        return new Date();
    });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof value === 'string' && value) setViewDate(new Date(value));
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
        };
        if (open) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const currentValue = typeof value === 'string' ? value : '';
    const selectedDate = currentValue ? new Date(currentValue) : null;

    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const calendarStart = startOfWeek(monthStart, { locale: id });
    const calendarEnd = endOfMonth(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const selectDate = (date: Date) => {
        const formatted = format(date, 'yyyy-MM-dd');
        if (onChange) onChange({ target: { value: formatted } });
        setOpen(false);
    };

    const displayValue = currentValue ? format(new Date(currentValue), 'dd/MM/yyyy', { locale: id }) : 'Pilih tanggal';

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
                className={`flex w-full items-center justify-start gap-3 rounded-xl border bg-white px-4 py-2.5 text-left text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-900 dark:text-slate-100 ${
                    error
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-700'
                        : 'border-slate-200 dark:border-slate-700'
                }`}
            >
                <span className="flex-1">{displayValue}</span>
                <CalendarIcon className="ml-1 h-4 w-4 text-slate-400" />
            </button>
            {open && (
                <div className="absolute z-50 mt-1 w-72 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xl dark:border-slate-700/80 dark:bg-slate-900">
                    <div className="mb-3 flex items-center justify-between">
                        <button type="button" onClick={() => setViewDate(subMonths(viewDate, 1))} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-semibold capitalize">{format(viewDate, 'MMMM yyyy', { locale: id })}</span>
                        <button type="button" onClick={() => setViewDate(addMonths(viewDate, 1))} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
                            <div key={d}>{d}</div>
                        ))}
                    </div>
                    <div className="mt-1 grid grid-cols-7 gap-1">
                        {days.map((day) => {
                            const inMonth = isSameMonth(day, viewDate);
                            const selected = selectedDate ? isSameDay(day, selectedDate) : false;
                            const today = isToday(day);
                            return (
                                <button
                                    key={day.toISOString()}
                                    type="button"
                                    onClick={() => selectDate(day)}
                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition ${
                                        selected
                                            ? 'bg-indigo-600 text-white'
                                            : today
                                              ? 'border border-indigo-500 text-indigo-600'
                                              : inMonth
                                                ? 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                                                : 'text-slate-300 dark:text-slate-600'
                                    }`}
                                >
                                    {getDate(day)}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
            <input ref={ref} type="hidden" value={currentValue} {...props} />
        </div>
    );
});

DatePicker.displayName = 'DatePicker';
