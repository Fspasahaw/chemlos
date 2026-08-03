import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

export function useReducedMotion(): boolean {
    const { auth } = usePage().props as any;
    const [prefersReduced, setPrefersReduced] = useState(false);

    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReduced(media.matches);
        const listener = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, []);

    return auth?.user?.reduce_motion === true || prefersReduced;
}
