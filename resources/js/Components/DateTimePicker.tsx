import { DatePicker } from './DatePicker';
import { TimePicker } from './TimePicker';

interface DateTimePickerProps {
    label?: string;
    value?: string;
    onChange?: (e: { target: { value: string } }) => void;
    error?: string;
    className?: string;
    timeInterval?: 1 | 5 | 10 | 15 | 30 | 60;
}

function parseValue(value: string): [string, string] {
    if (!value) return ['', ''];
    if (value.includes('T')) return value.split('T') as [string, string];
    const [date, time] = value.split(' ');
    return [date ?? '', time ?? ''];
}

export function DateTimePicker({ label, value = '', onChange, error, className = '', timeInterval = 5 }: DateTimePickerProps) {
    const [date, time] = parseValue(value);

    const update = (newDate: string, newTime: string) => {
        const d = newDate || date;
        const t = newTime || time;
        if (d && t) {
            onChange?.({ target: { value: `${d}T${t}` } });
        } else if (d) {
            onChange?.({ target: { value: `${d}T${time || '00:00'}` } });
        } else if (t) {
            onChange?.({ target: { value: `${date || new Date().toISOString().slice(0, 10)}T${t}` } });
        }
    };

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    {label}
                </label>
            )}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <DatePicker value={date} onChange={(e) => update(e.target.value, time)} />
                <TimePicker value={time} onChange={(e) => update(date, e.target.value)} interval={timeInterval} />
            </div>
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
        </div>
    );
}
