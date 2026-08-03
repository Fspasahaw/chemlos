import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

(window as any).Pusher = Pusher;

const env = import.meta.env as any;
const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

let echo: Echo<'pusher'> | null = null;

const driver = env.VITE_BROADCAST_DRIVER ?? 'null';
const reverbKey = env.VITE_REVERB_APP_KEY;
const pusherKey = env.VITE_PUSHER_APP_KEY;

if (driver !== 'null' && (reverbKey || pusherKey)) {
    const isReverb = driver === 'reverb' || (reverbKey && !pusherKey);
    const key = isReverb ? reverbKey : pusherKey;
    const host = isReverb
        ? (env.VITE_REVERB_HOST || window.location.hostname)
        : (env.VITE_PUSHER_HOST || `ws-${env.VITE_PUSHER_APP_CLUSTER || 'mt1'}.pusher.com`);
    const port = isReverb ? (env.VITE_REVERB_PORT || 8080) : (env.VITE_PUSHER_PORT || 443);
    const scheme = isReverb ? (env.VITE_REVERB_SCHEME || 'http') : (env.VITE_PUSHER_SCHEME || 'https');
    const cluster = isReverb ? '' : (env.VITE_PUSHER_APP_CLUSTER || 'mt1');

    echo = new Echo({
        broadcaster: 'pusher',
        key,
        cluster,
        wsHost: host,
        wsPort: Number(port),
        wssPort: Number(port),
        forceTLS: scheme === 'https',
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: '/broadcasting/auth',
        auth: {
            headers: {
                'X-CSRF-TOKEN': csrfToken,
            },
        },
        Pusher,
    } as any);
}

export { echo };
