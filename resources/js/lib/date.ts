import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export function formatDate(value: string | Date | null | undefined, fmt = 'dd MMMM yyyy'): string {
    if (!value) return '-';
    try {
        const date = typeof value === 'string' ? parseISO(value) : value;
        if (Number.isNaN(date.getTime())) return '-';
        return format(date, fmt, { locale: id });
    } catch {
        return '-';
    }
}

export function formatDateTime(value: string | Date | null | undefined, fmt = 'dd MMMM yyyy HH:mm'): string {
    return formatDate(value, fmt);
}

export function formatRupiah(value: number | string | null | undefined): string {
    const num = typeof value === 'string' ? Number(value) : value;
    if (num === null || num === undefined || Number.isNaN(num)) return 'Rp 0';
    return `Rp ${num.toLocaleString('id-ID')}`;
}

export function formatDuration(totalSeconds: string | number | null | undefined): string {
    const seconds = Number(totalSeconds ?? 0) || 0;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatMonthYear(value: string | null | undefined): string {
    if (!value) return '-';
    const [year, month] = value.split('-');
    if (!year || !month) return value;
    const date = new Date(Number(year), Number(month) - 1);
    return format(date, 'MMMM yyyy', { locale: id });
}
