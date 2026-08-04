import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function parseLocalDate(value: string | Date | null | undefined): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;

    const s = String(value).trim();

    // Date-only YYYY-MM-DD → treat as local midnight
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [y, m, d] = s.split('-').map(Number);
        return new Date(y, m - 1, d, 0, 0, 0);
    }

    // YYYY-MM-DD HH:MM:SS (space separator, common Laravel output) → local time
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s)) {
        const [date, time] = s.split(' ');
        const [y, m, d] = date.split('-').map(Number);
        const [hh, mm, ss] = time.split(':').map(Number);
        return new Date(y, m - 1, d, hh, mm, ss);
    }

    // ISO string with time/timezone (YYYY-MM-DDTHH:MM:SS or with Z/offset)
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(s) || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[Z+-]/.test(s)) {
        const d = new Date(s);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    try {
        const d = new Date(s);
        return Number.isNaN(d.getTime()) ? null : d;
    } catch {
        return null;
    }
}

export function toDateInput(value: string | null | undefined): string {
    if (!value) return '';
    const d = parseLocalDate(value);
    if (!d || Number.isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
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
