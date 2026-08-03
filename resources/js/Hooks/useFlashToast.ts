import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function useFlashToast() {
    useEffect(() => {
        const removeEvent = router.on('success', (event) => {
            const flash = (event.detail.page.props.flash as { success?: string | null; error?: string | null }) || {};

            if (flash.success) {
                toast.success(flash.success);
            }
            if (flash.error) {
                toast.error(flash.error);
            }
        });

        return removeEvent;
    }, []);
}
