import { Calendar as FullCalendarCore } from '@fullcalendar/core';
import idLocale from '@fullcalendar/core/locales/id';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import { LayoutGrid, List as ListIcon, RotateCcw } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatDateTime } from '../lib/date';
import { Badge } from './Badge';
import { FilterChips } from './FilterChips';
import Modal from './Modal';
import { SelectSearchMulti } from './SelectSearchMulti';

export interface CalendarEvent {
    id: number | string;
    title: string;
    start: string;
    end?: string;
    color?: string;
    url?: string;
    extendedProps?: {
        type?: 'peminjaman' | 'maintenance';
        status?: string;
        statusLabel?: string;
        kode?: string;
        peminjam?: string | null;
        dosen?: string | null;
        laboratorium?: string | null;
        laboratorium_id?: number | null;
        alat?: string | null;
        tujuan?: string | null;
        jam_mulai?: string | null;
        jam_selesai?: string | null;
    };
}

interface FilterOption {
    value: string;
    label: string;
}

interface CalendarProps {
    events: CalendarEvent[];
    height?: string;
    initialView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek' | 'listMonth';
    onEventClick?: (event: CalendarEvent) => void;
    labOptions?: FilterOption[];
    statusOptions?: FilterOption[];
    showFilters?: boolean;
    showLegend?: boolean;
    className?: string;
    emptyText?: string;
}

const statusColors: Record<string, string> = {
    diajukan: '#f59e0b',
    menunggu_dosen: '#f59e0b',
    menunggu_laboran: '#60a5fa',
    disetujui: '#3b82f6',
    berlangsung: '#8b5cf6',
    selesai: '#10b981',
    terlambat: '#f97316',
    ditolak: '#ef4444',
    dibatalkan: '#ef4444',
    maintenance: '#6b7280',
};

const badgeVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'orange'> = {
    diajukan: 'warning',
    menunggu_dosen: 'warning',
    menunggu_laboran: 'info',
    disetujui: 'info',
    berlangsung: 'purple',
    selesai: 'success',
    terlambat: 'orange',
    ditolak: 'danger',
    dibatalkan: 'danger',
    maintenance: 'neutral',
};

const defaultStatusOptions: FilterOption[] = [
    { value: 'diajukan', label: 'Diajukan' },
    { value: 'menunggu_dosen', label: 'Menunggu Dosen' },
    { value: 'menunggu_laboran', label: 'Menunggu Laboran' },
    { value: 'disetujui', label: 'Disetujui' },
    { value: 'berlangsung', label: 'Berlangsung' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'terlambat', label: 'Terlambat' },
    { value: 'maintenance', label: 'Dalam Perbaikan' },
];

export function Calendar({
    events,
    height = '500px',
    initialView = 'dayGridMonth',
    onEventClick,
    labOptions = [],
    statusOptions,
    showFilters = true,
    showLegend = true,
    className = '',
    emptyText = 'Belum ada jadwal.',
}: CalendarProps) {
    const ref = useRef<HTMLDivElement>(null);
    const calendarRef = useRef<FullCalendarCore | null>(null);

    const eventsRef = useRef(events);
    eventsRef.current = events;

    const onEventClickRef = useRef(onEventClick);
    onEventClickRef.current = onEventClick;

    const resolvedStatusOptions = statusOptions ?? defaultStatusOptions;

    const [selectedLabs, setSelectedLabs] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

    const isInitialList = initialView.startsWith('list');
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>(isInitialList ? 'list' : 'calendar');
    const [calendarView, setCalendarView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>(
        isInitialList ? 'dayGridMonth' : (initialView as any)
    );
    const [listView, setListView] = useState<'listWeek' | 'listMonth'>(
        isInitialList ? (initialView as any) : 'listWeek'
    );

    const activeView = viewMode === 'list' ? listView : calendarView;

    const filteredEvents = useMemo(() => {
        return events.filter((e) => {
            const props = e.extendedProps ?? {};
            if (selectedLabs.length > 0 && props.laboratorium_id && !selectedLabs.includes(String(props.laboratorium_id))) {
                return false;
            }
            if (selectedStatuses.length > 0 && props.status && !selectedStatuses.includes(props.status)) {
                return false;
            }
            return true;
        });
    }, [events, selectedLabs, selectedStatuses]);

    const [tooltip, setTooltip] = useState<{ event: CalendarEvent; x: number; y: number } | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const tooltipRef = useRef<HTMLDivElement>(null);
    const tooltipDims = useRef<{ width: number; height: number }>({ width: 288, height: 120 });

    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    const computeTooltipPos = (x: number, y: number, width: number, height: number) => {
        const pad = 12;
        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;

        // Default position: horizontally centered on the cursor and below it
        // so it sits on top of the calendar, not floating above the page hero.
        let posX = x - width / 2;
        let posY = y + 12;

        // Flip above cursor if overflowing bottom edge
        if (posY + height > viewportH - pad) {
            posY = y - height - 12;
        }
        // Flip below cursor if the above position would go off the top
        if (posY < pad) {
            posY = y + 12;
        }
        // Push back from left edge
        if (posX < pad) posX = pad;
        // Push back from right edge
        if (posX + width > viewportW - pad) posX = viewportW - width - pad;

        return { x: posX, y: posY };
    };

    useLayoutEffect(() => {
        if (!tooltip) return;

        const width = tooltipDims.current.width;
        const height = tooltipDims.current.height;

        setTooltipPos(computeTooltipPos(tooltip.x, tooltip.y, width, height));
    }, [tooltip]);

    useLayoutEffect(() => {
        if (!tooltipRef.current || !tooltip) return;

        const rect = tooltipRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            tooltipDims.current = { width: rect.width, height: rect.height };
            const pos = computeTooltipPos(tooltip.x, tooltip.y, rect.width, rect.height);
            if (pos.x !== tooltipPos.x || pos.y !== tooltipPos.y) {
                setTooltipPos(pos);
            }
        }
    }, [tooltip]);

    useEffect(() => {
        if (!ref.current) return;
        if (calendarRef.current) return;

        const calendar = new FullCalendarCore(ref.current, {
            plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
            locale: idLocale,
            initialView: activeView,
            events: filteredEvents.map((e) => ({ ...e, id: String(e.id) })),
            height,
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: '',
            },
            firstDay: 1,
            nowIndicator: true,
            noEventsText: emptyText,
            eventDisplay: 'block',
            eventClick: (info) => {
                info.jsEvent.preventDefault();
                const event = eventsRef.current.find((e) => String(e.id) === info.event.id);
                if (event) setSelectedEvent(event);
            },
            eventMouseEnter: (info) => {
                const event = eventsRef.current.find((e) => String(e.id) === info.event.id);
                if (event) {
                    setTooltip({ event, x: info.jsEvent.clientX, y: info.jsEvent.clientY });
                }
            },
            eventMouseMove: (info) => {
                const event = eventsRef.current.find((e) => String(e.id) === info.event.id);
                if (event) {
                    setTooltip({ event, x: info.jsEvent.clientX, y: info.jsEvent.clientY });
                }
            },
            eventMouseLeave: () => {
                setTooltip(null);
            },
        });

        calendar.render();
        calendarRef.current = calendar;

        return () => {
            calendar.destroy();
            calendarRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!calendarRef.current) return;
        calendarRef.current.changeView(activeView);
    }, [activeView]);

    useEffect(() => {
        if (!calendarRef.current) return;
        calendarRef.current.removeAllEventSources();
        calendarRef.current.addEventSource(filteredEvents.map((e) => ({ ...e, id: String(e.id) })));
    }, [filteredEvents]);

    const resetFilters = () => {
        setSelectedLabs([]);
        setSelectedStatuses([]);
    };

    const renderTooltip = (event: CalendarEvent) => {
        const p = event.extendedProps ?? {};
        const color = event.color ?? statusColors[p.status ?? ''] ?? '#94a3b8';

        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="font-semibold">{p.kode ?? event.title}</span>
                </div>
                {p.statusLabel && (
                    <div>
                        <Badge variant={badgeVariant[p.status ?? ''] ?? 'neutral'}>{p.statusLabel}</Badge>
                    </div>
                )}
                {p.laboratorium && (
                    <p className="text-slate-300">
                        <span className="text-slate-400">Lab:</span> {p.laboratorium}
                    </p>
                )}
                {p.peminjam && (
                    <p className="text-slate-300">
                        <span className="text-slate-400">Peminjam:</span> {p.peminjam}
                    </p>
                )}
                {p.alat && (
                    <p className="text-slate-300">
                        <span className="text-slate-400">Alat:</span> {p.alat}
                    </p>
                )}
                <p className="text-slate-300">
                    <span className="text-slate-400">Waktu:</span>{' '}
                    {event.start && event.end ? formatDateTime(event.start) + ' - ' + formatDateTime(event.end) : '-'}
                </p>
            </div>
        );
    };

    const renderModalContent = (event: CalendarEvent) => {
        const p = event.extendedProps ?? {};

        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <span
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: event.color ?? statusColors[p.status ?? ''] ?? '#94a3b8' }}
                    />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {p.kode ?? event.title}
                    </h3>
                </div>

                {p.statusLabel && (
                    <div>
                        <Badge variant={badgeVariant[p.status ?? ''] ?? 'neutral'}>{p.statusLabel}</Badge>
                    </div>
                )}

                <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900/50">
                    <InfoRow label="Jenis" value={p.type === 'maintenance' ? 'Maintenance' : 'Peminjaman'} />
                    <InfoRow label="Laboratorium" value={p.laboratorium} />
                    <InfoRow label="Peminjam" value={p.peminjam} />
                    <InfoRow label="Dosen Pembimbing" value={p.dosen} />
                    <InfoRow label="Alat" value={p.alat} />
                    <InfoRow label="Tujuan / Keterangan" value={p.tujuan} />
                    <InfoRow
                        label="Tanggal Mulai"
                        value={event.start ? formatDateTime(event.start) : '-'}
                    />
                    <InfoRow
                        label="Tanggal Selesai"
                        value={event.end ? formatDateTime(event.end) : '-'}
                    />
                </div>
            </div>
        );
    };

    const hasActiveFilters = selectedLabs.length > 0 || selectedStatuses.length > 0;

    const legendItems = resolvedStatusOptions;

    return (
        <div className={`space-y-4 ${className}`}>
            {showFilters && (labOptions.length > 0 || resolvedStatusOptions.length > 0) && (
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800/80 dark:bg-slate-900">
                    <div className="flex flex-wrap items-start gap-3">
                        {labOptions.length > 0 && (
                            <SelectSearchMulti
                                label="Filter Laboratorium"
                                options={labOptions}
                                value={selectedLabs}
                                onChange={setSelectedLabs}
                                placeholder="Pilih laboratorium..."
                                className="w-full sm:w-64"
                            />
                        )}
                        {resolvedStatusOptions.length > 0 && (
                            <div className="flex-1">
                                <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                                    Filter Status
                                </span>
                                <FilterChips
                                    options={resolvedStatusOptions}
                                    value={selectedStatuses}
                                    onChange={(v) => setSelectedStatuses(Array.isArray(v) ? v : [v])}
                                    multiple
                                    allowReset={false}
                                />
                            </div>
                        )}
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <RotateCcw className="h-3.5 w-3.5" /> Reset
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
                        <button
                            type="button"
                            onClick={() => setViewMode('calendar')}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                                viewMode === 'calendar'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                            }`}
                        >
                            <LayoutGrid className="h-4 w-4" /> Kalender
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                                viewMode === 'list'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                            }`}
                        >
                            <ListIcon className="h-4 w-4" /> Daftar
                        </button>
                    </div>

                    {viewMode === 'calendar' && (
                        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
                            {[
                                { key: 'dayGridMonth', label: 'Bulan' },
                                { key: 'timeGridWeek', label: 'Minggu' },
                                { key: 'timeGridDay', label: 'Hari' },
                            ].map((v) => (
                                <button
                                    key={v.key}
                                    type="button"
                                    onClick={() => setCalendarView(v.key as any)}
                                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                                        calendarView === v.key
                                            ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                                >
                                    {v.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {viewMode === 'list' && (
                        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
                            {[
                                { key: 'listWeek', label: 'Minggu Ini' },
                                { key: 'listMonth', label: 'Bulan Ini' },
                            ].map((v) => (
                                <button
                                    key={v.key}
                                    type="button"
                                    onClick={() => setListView(v.key as any)}
                                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                                        listView === v.key
                                            ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                                >
                                    {v.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800/80 dark:bg-slate-900">
                <div ref={ref} />
            </div>

            {showLegend && legendItems.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800/80 dark:bg-slate-900">
                    {legendItems.map((item) => {
                        const color = statusColors[item.value] ?? '#94a3b8';
                        return (
                            <div key={item.value} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                                {item.label}
                            </div>
                        );
                    })}
                </div>
            )}

            {tooltip &&
                createPortal(
                    <div
                        ref={tooltipRef}
                        className="pointer-events-none fixed z-[100] w-72 rounded-xl border border-slate-700 bg-slate-800 p-3 text-xs text-white shadow-2xl"
                        style={{ left: tooltipPos.x, top: tooltipPos.y }}
                    >
                        {renderTooltip(tooltip.event)}
                    </div>,
                    document.body
                )}

            {selectedEvent && (
                <Modal
                    open={!!selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    title={selectedEvent.extendedProps?.kode ?? selectedEvent.title}
                    size="md"
                    footer={
                        <div className="flex items-center gap-2">
                            {onEventClickRef.current && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onEventClickRef.current?.(selectedEvent);
                                        setSelectedEvent(null);
                                    }}
                                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                                >
                                    Lihat Detail
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setSelectedEvent(null)}
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                Tutup
                            </button>
                        </div>
                    }
                >
                    {renderModalContent(selectedEvent)}
                </Modal>
            )}
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
            <span className="min-w-35 text-slate-500 dark:text-slate-400">{label}</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{value}</span>
        </div>
    );
}
