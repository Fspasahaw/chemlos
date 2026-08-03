import { Link } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { createPortal } from 'react-dom';
import { ConfirmModal } from './ConfirmModal';
import { Tooltip } from './Tooltip';

type ActionVariant = 'default' | 'primary' | 'danger' | 'warning' | 'success' | 'info' | 'neutral';

interface ConfirmConfig {
    title?: string;
    description: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning' | 'primary' | 'info';
}

interface ActionItem {
    id: string;
    label: string;
    icon: ReactNode;
    href?: string;
    external?: boolean;
    onClick?: () => void;
    disabled?: boolean;
    variant?: ActionVariant;
    confirm?: ConfirmConfig;
    hidden?: boolean;
}

interface TableActionsProps {
    actions: ActionItem[];
}

const variantClass: Record<ActionVariant, string> = {
    default: 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800',
    primary: 'text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20',
    danger: 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20',
    warning: 'text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20',
    success: 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20',
    info: 'text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-900/20',
    neutral: 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800',
};

const confirmVariantMap: Record<string, 'danger' | 'warning' | 'info'> = {
    danger: 'danger',
    warning: 'warning',
    primary: 'info',
    info: 'info',
};

export function TableActions({ actions }: TableActionsProps) {
    const [open, setOpen] = useState(false);
    const [confirming, setConfirming] = useState<ActionItem | null>(null);

    const visible = actions.filter((a) => !a.hidden);

    const handle = (action: ActionItem) => {
        if (action.disabled) return;
        if (action.confirm) {
            setConfirming(action);
            setOpen(false);
            return;
        }
        action.onClick?.();
        setOpen(false);
    };

    const renderButton = (action: ActionItem, isDropdown = false) => {
        const base = `inline-flex items-center gap-2 rounded-lg ${isDropdown ? 'w-full px-3 py-2 text-left text-sm' : 'justify-center p-2'} ${variantClass[action.variant ?? 'default']} ${action.disabled ? 'cursor-not-allowed opacity-50' : ''}`;

        const content = (
            <>
                <span className="shrink-0">{action.icon}</span>
                {isDropdown && <span className="truncate">{action.label}</span>}
            </>
        );

        if (action.href) {
            const link = action.external ? (
                <a href={action.href} target="_blank" rel="noreferrer" className={base}>{content}</a>
            ) : (
                <Link href={action.href} className={base}>{content}</Link>
            );
            return isDropdown ? link : <Tooltip key={action.id} content={action.label}>{link}</Tooltip>;
        }

        return (
            <Tooltip key={action.id} content={action.label} className={isDropdown ? 'w-full' : undefined}>
                <button type="button" onClick={() => handle(action)} disabled={action.disabled} className={base}>
                    {content}
                </button>
            </Tooltip>
        );
    };

    return (
        <div className="relative flex justify-end">
            <div className="hidden items-center gap-1 sm:flex">
                {visible.map((a) => renderButton(a))}
            </div>

            <div className="sm:hidden">
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="inline-flex rounded-lg p-2 text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                    <MoreHorizontal className="h-4 w-4" />
                </button>
                {open && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                        {visible.map((a) => (
                            <div key={a.id}>{renderButton({ ...a, id: a.id }, true)}</div>
                        ))}
                    </div>
                )}
            </div>

            {confirming && (
                <ConfirmModal
                    open={!!confirming}
                    onClose={() => setConfirming(null)}
                    onConfirm={() => { confirming.onClick?.(); setConfirming(null); }}
                    title={confirming.confirm?.title ?? confirming.label}
                    description={confirming.confirm!.description}
                    confirmLabel={confirming.confirm?.confirmLabel ?? confirming.label}
                    cancelLabel="Batal"
                    variant={confirmVariantMap[confirming.confirm?.variant ?? 'primary']}
                />
            )}

            {open && createPortal(
                <button
                    type="button"
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setOpen(false)}
                    aria-hidden="true"
                />,
                document.body
            )}
        </div>
    );
}
