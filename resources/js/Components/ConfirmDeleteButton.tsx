import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmModal } from './ConfirmModal';
import { Tooltip } from './Tooltip';

interface ConfirmDeleteButtonProps {
    onDelete: () => void;
    label?: string;
    description?: string;
    className?: string;
}

export function ConfirmDeleteButton({ onDelete, label = '', description = 'Data yang dihapus tidak bisa dikembalikan.', className = '' }: ConfirmDeleteButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Tooltip content={label || 'Hapus'}>
                <button type="button" onClick={() => setOpen(true)} className={`inline-flex items-center gap-1 rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20 ${className}`}>
                    <Trash2 className="h-4 w-4" />
                    {label ? <span>{label}</span> : null}
                </button>
            </Tooltip>
            <ConfirmModal
                open={open}
                onClose={() => setOpen(false)}
                onConfirm={() => { setOpen(false); onDelete(); }}
                title="Hapus Data"
                description={description}
                confirmLabel="Hapus"
                cancelLabel="Batal"
                variant="danger"
            />
        </>
    );
}
