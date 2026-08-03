import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Notifikasi {
    id: number;
    judul: string;
    pesan: string;
    jenis: string;
    link: string | null;
    created_at: string;
}

export function useRealtimeNotifications(enabled = true, intervalMs = 30000) {
    const [unreadCount, setUnreadCount] = useState<number | null>(null);
    const [lastNotifiedId, setLastNotifiedId] = useState<number | null>(null);

    useEffect(() => {
        if (! enabled) {
            return;
        }

        let cancelled = false;

        const fetchCount = async () => {
            try {
                const { data } = await axios.get('/api/v1/notifikasi/unread-count');
                if (cancelled) return;
                if (data.success) {
                    setUnreadCount(data.data.count);
                }
            } catch {
                // Silent fail
            }
        };

        const fetchLatest = async () => {
            try {
                const { data } = await axios.get('/api/v1/notifikasi?per_page=1');
                if (cancelled) return;
                if (data.success && data.data.data.length > 0) {
                    const latest: Notifikasi = data.data.data[0];
                    const link = latest.link;
                    if (lastNotifiedId !== null && latest.id > lastNotifiedId) {
                        toast.info(latest.judul, {
                            description: latest.pesan,
                            action: link
                                ? {
                                    label: 'Lihat',
                                    onClick: () => window.location.assign(link),
                                }
                                : undefined,
                        });
                    }
                    setLastNotifiedId(latest.id);
                }
            } catch {
                // Silent fail
            }
        };

        fetchCount();
        fetchLatest();

        const interval = setInterval(() => {
            fetchCount();
            fetchLatest();
        }, intervalMs);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [enabled, intervalMs, lastNotifiedId]);

    return { unreadCount, setUnreadCount };
}
