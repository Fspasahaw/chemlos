import { useEffect, useRef, useState } from 'react';

export function GlobalLoadingIndicator() {
    const [visible, setVisible] = useState(false);
    const [width, setWidth] = useState(0);
    const counter = useRef(0);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const show = () => {
            counter.current += 1;
            if (timer.current) clearTimeout(timer.current);
            setVisible(true);
            setWidth(0);
            requestAnimationFrame(() => {
                setWidth(80);
            });
        };

        const progress = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            const percentage = detail?.progress?.percentage ?? 0;
            if (percentage > 0) setWidth(Math.min(95, percentage));
        };

        const hide = () => {
            counter.current = Math.max(0, counter.current - 1);
            if (counter.current > 0) return;
            setWidth(100);
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => {
                setVisible(false);
                setTimeout(() => setWidth(0), 200);
            }, 300);
        };

        const cancel = () => {
            counter.current = Math.max(0, counter.current - 1);
            if (counter.current > 0) return;
            setVisible(false);
            setWidth(0);
        };

        document.addEventListener('inertia:start', show);
        document.addEventListener('inertia:progress', progress);
        document.addEventListener('inertia:finish', hide);
        document.addEventListener('inertia:error', hide);
        document.addEventListener('inertia:cancel', cancel);

        return () => {
            document.removeEventListener('inertia:start', show);
            document.removeEventListener('inertia:progress', progress);
            document.removeEventListener('inertia:finish', hide);
            document.removeEventListener('inertia:error', hide);
            document.removeEventListener('inertia:cancel', cancel);
        };
    }, []);

    return (
        <div
            aria-hidden="true"
            className={`pointer-events-none fixed left-0 top-0 z-[100] h-1 w-full transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
            <div
                className="h-full bg-linear-to-r from-indigo-500 via-violet-500 to-indigo-500 shadow-[0_2px_10px_rgba(99,102,241,0.6)] transition-[width] duration-1200 ease-out"
                style={{ width: `${width}%` }}
            />
        </div>
    );
}
