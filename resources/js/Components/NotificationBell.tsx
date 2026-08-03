import axios from 'axios';
import { router, usePage } from '@inertiajs/react';
import { Bell, CalendarDays, Check, ClipboardList, Clock, TriangleAlert, Wrench, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { echo } from '../echo';
import { EmptyState } from './EmptyState';
import { Tooltip } from './Tooltip';

interface Notif {
    id: number;
    user_id?: number;
    judul: string;
    pesan: string;
    jenis: string;
    kategori?: string;
    link: string | null;
    dibaca_pada: string | null;
    created_at: string;
}

interface ApiResponse {
    success: boolean;
    data: {
        data: Notif[];
        current_page: number;
        last_page: number;
    };
    unread_count: number;
}

interface PageProps {
    auth?: {
        user?: {
            id: number;
        };
    };
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    peminjaman: ClipboardList,
    peminjaman_diajukan: ClipboardList,
    peminjaman_disetujui: ClipboardList,
    peminjaman_ditolak: XCircle,
    peminjaman_dibatalkan: XCircle,
    peminjaman_dibatalkan_otomatis: XCircle,
    peminjaman_terlambat: TriangleAlert,
    pengingat_pengembalian: Clock,
    pengingat_serah_terima: CalendarDays,
    kerusakan: TriangleAlert,
    maintenance: Wrench,
    umum: Bell,
};

function getIcon(jenis: string) {
    return iconMap[jenis] || Bell;
}

function showToast(notif: Notif) {
    toast.info(notif.judul, {
        description: notif.pesan,
        action: notif.link
            ? {
                  label: 'Lihat',
                  onClick: () => router.visit(notif.link as string),
              }
            : undefined,
    });
}

export function NotificationBell() {
    const { auth } = usePage().props as unknown as PageProps;
    const userId = auth?.user?.id;

    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<Notif[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [lastNotifiedId, setLastNotifiedId] = useState<number | null>(null);
    const [echoConnected, setEchoConnected] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const relativeTime = (value: string) => {
        try {
            return formatDistanceToNow(new Date(value), { addSuffix: true, locale: id });
        } catch {
            return value;
        }
    };

    const fetchNotifications = async () => {
        try {
            const { data } = await axios.get<ApiResponse>('/api/v1/notifikasi?per_page=5');
            if (data.success) {
                setItems(data.data.data);
                setUnreadCount(data.unread_count);

                if (data.data.data.length > 0) {
                    const latest = data.data.data[0];
                    if (lastNotifiedId !== null && latest.id > lastNotifiedId && latest.dibaca_pada === null) {
                        showToast(latest);
                    }
                    setLastNotifiedId(latest.id);
                }
            }
        } catch {
            // Silent fail agar polling tidak mengganggu user
        }
    };

    useEffect(() => {
        if (!userId) {
            return;
        }

        fetchNotifications();

        const interval = setInterval(() => {
            fetchNotifications();
        }, echoConnected ? 60000 : 30000);

        return () => clearInterval(interval);
    }, [userId, echoConnected]);

    useEffect(() => {
        if (!userId || !echo) {
            return;
        }

        const channel = echo.private(`App.Models.User.${userId}`);

        channel
            .subscribed(() => {
                setEchoConnected(true);
            })
            .error(() => {
                setEchoConnected(false);
            })
            .listen('.notifikasi.baru', (payload: Notif) => {
                setItems((prev) => {
                    const exists = prev.some((n) => n.id === payload.id);
                    if (exists) return prev;
                    return [payload, ...prev].slice(0, 5);
                });
                setUnreadCount((c) => c + 1);
                setLastNotifiedId((current) => (current === null || payload.id > current ? payload.id : current));
                showToast(payload);
            });

        return () => {
            channel.stopListening('.notifikasi.baru');
            echo?.leave(`App.Models.User.${userId}`);
        };
    }, [userId]);

    useEffect(() => {
        if (open) {
            fetchNotifications();
        }
    }, [open]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const markAsRead = async (notif: Notif) => {
        try {
            setLoading(true);
            await axios.post(`/api/v1/notifikasi/${notif.id}/read`);
            setUnreadCount((c) => Math.max(0, c - 1));
            setItems((prev) =>
                prev.map((n) => (n.id === notif.id ? { ...n, dibaca_pada: new Date().toISOString() } : n))
            );

            if (notif.link) {
                router.visit(notif.link);
            }
        } catch {
            // Silent fail
        } finally {
            setLoading(false);
            setOpen(false);
        }
    };

    const markAllRead = async () => {
        try {
            setLoading(true);
            await axios.post('/api/v1/notifikasi/read-all');
            setUnreadCount(0);
            setItems((prev) => prev.map((n) => ({ ...n, dibaca_pada: new Date().toISOString() })));
        } catch {
            // Silent fail
        } finally {
            setLoading(false);
        }
    };

    if (!userId) {
        return null;
    }

    return (
        <div className="relative" ref={ref}>
            <Tooltip content={echoConnected ? 'Notifikasi (realtime aktif)' : 'Notifikasi'}>
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="relative rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="Notifikasi"
                    aria-haspopup="true"
                    aria-expanded={open}
                >
                    <Bell className="h-5 w-5" />
                    {echoConnected && (
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-500" title="Realtime aktif" />
                    )}
                    {unreadCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </Tooltip>

            {open && (
                <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl dark:border-slate-700/80 dark:bg-slate-900 sm:w-96">
                    <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-3 dark:border-slate-700/80">
                        <h3 className="font-semibold">Notifikasi</h3>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAllRead}
                                disabled={loading}
                                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                            >
                                <Check className="h-3.5 w-3.5" /> Tandai semua
                            </button>
                        )}
                    </div>

                    <div className="max-h-100 overflow-y-auto">
                        {items.length === 0 ? (
                            <div className="px-4 py-2">
                                <EmptyState
                                    title="Tidak ada notifikasi"
                                    description="Belum ada pemberitahuan terbaru untuk Anda."
                                    icon={<Bell className="h-8 w-8" />}
                                />
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                                {items.map((notif) => {
                                    const Icon = getIcon(notif.kategori || notif.jenis);
                                    return (
                                        <li key={notif.id}>
                                            <button
                                                type="button"
                                                onClick={() => markAsRead(notif)}
                                                disabled={loading}
                                                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800 ${
                                                    notif.dibaca_pada ? 'opacity-70' : 'bg-indigo-50/30 dark:bg-indigo-900/10'
                                                }`}
                                            >
                                                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                    <Icon className="h-4 w-4" />
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">{notif.judul}</p>
                                                    <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-300">{notif.pesan}</p>
                                                    <p className="mt-1 text-[10px] text-slate-400">{relativeTime(notif.created_at)}</p>
                                                </div>
                                                {!notif.dibaca_pada && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    <div className="border-t border-slate-200/80 px-4 py-2 dark:border-slate-700/80">
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                router.visit('/notifikasi');
                            }}
                            className="w-full text-center text-xs font-medium text-indigo-600 hover:text-indigo-700"
                        >
                            Lihat Semua Notifikasi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
