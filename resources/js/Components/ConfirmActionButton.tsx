import { ReactNode, useState } from 'react';
import { ConfirmModal } from './ConfirmModal';
import { Tooltip } from './Tooltip';

interface ConfirmActionButtonProps {
    icon: ReactNode;
    label: string;
    title?: string;
    description: string;
    confirmLabel?: string;
    variant?: 'primary' | 'danger' | 'warning';
    onConfirm: () => void;
    disabled?: boolean;
    className?: string;
}

export function ConfirmActionButton({
    icon,
    label,
    title,
    description,
    confirmLabel,
    variant = 'primary',
    onConfirm,
    disabled,
    className = '',
}: ConfirmActionButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Tooltip content={label}>
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    disabled={disabled}
                    className={`inline-flex rounded-lg p-2 disabled:opacity-50 ${className}`}
                >
                    {icon}
                </button>
            </Tooltip>
            <ConfirmModal
                open={open}
                onClose={() => setOpen(false)}
                onConfirm={() => { setOpen(false); onConfirm(); }}
                title={title ?? label}
                description={description}
                confirmLabel={confirmLabel ?? label}
                variant={variant === 'danger' ? 'danger' : variant === 'warning' ? 'warning' : 'info'}
            />
        </>
    );
}
