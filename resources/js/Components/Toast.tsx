import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';

export const toast = sonnerToast;

interface ToastProps {
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    richColors?: boolean;
    closeButton?: boolean;
    duration?: number;
}

export function Toast({
    position = 'top-right',
    richColors = true,
    closeButton = true,
    duration = 4000,
}: ToastProps) {
    return (
        <SonnerToaster
            position={position}
            richColors={richColors}
            closeButton={closeButton}
            duration={duration}
            toastOptions={{
                className: 'rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-sm',
            }}
            gap={8}
        />
    );
}
