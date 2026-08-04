import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function parseLocalDate(value: string | Date | null | undefined): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?/);
    if (m) {
        return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), m[4] ? Number(m[4]) : 0, m[5] ? Number(m[5]) : 0, m[6] ? Number(m[6]) : 0);
    }
    try {
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? null : d;
    } catch {
        return null;
    }
}

export function toDateInput(value: string | null | undefined): string {
    if (!value) return '';
    const m = String(value).match(/^\d{4}-\d{2}-\d{2}/);
    return m ? m[0] : '';
}

export function formatDate(value: string | Date | null | undefined, fmt = 'dd MMMM yyyy'): string {
    if (!value) return '-';
    const date = typeof value === 'string' ? parseLocalDate(value) : value;
    if (!date || Number.isNaN(date.getTime())) return '-';
    return format(date, fmt, { locale: id });
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
