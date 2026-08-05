import { AlertTriangle, Info } from 'lucide-react';
import { ReactNode } from 'react';
import { Button } from './Button';
import Modal from './Modal';

interface ConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
    confirmDisabled?: boolean;
    children?: ReactNode;
}

export function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title = 'Konfirmasi',
    description = 'Apakah Anda yakin?',
    confirmLabel = 'Ya, lanjutkan',
    cancelLabel = 'Batal',
    variant = 'danger',
    isLoading,
    confirmDisabled,
    children,
}: ConfirmModalProps) {
    const icon = variant === 'info' ? <Info className="h-6 w-6 text-blue-500" /> : <AlertTriangle className="h-6 w-6 text-amber-500" />;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>{cancelLabel}</Button>
                    <Button variant={variant === 'danger' ? 'danger' : 'primary'} isLoading={isLoading} onClick={onConfirm} disabled={confirmDisabled}>{confirmLabel}</Button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="flex gap-4">
                    <div className="shrink-0">{icon}</div>
                    <p className="text-slate-700 dark:text-slate-300">{description}</p>
                </div>
                {children}
            </div>
        </Modal>
    );
}
