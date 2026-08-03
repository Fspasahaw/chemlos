import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export function usePageLoading(): boolean {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const start = () => setLoading(true);
        const finish = () => setLoading(false);

        const unsubscribeStart = router.on('start', start);
        const unsubscribeFinish = router.on('finish', finish);
        const unsubscribeError = router.on('error', finish);
        const unsubscribeCancel = router.on('cancel', finish);

        return () => {
            unsubscribeStart();
            unsubscribeFinish();
            unsubscribeError();
            unsubscribeCancel();
        };
    }, []);

    return loading;
}
