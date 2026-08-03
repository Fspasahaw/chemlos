import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses: Record<string, string> = {
    sm: 'max-w-[400px]',
    md: 'max-w-[560px]',
    lg: 'max-w-[800px]',
    xl: 'max-w-[1024px]',
};

const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== 'Tab' || !contentRef.current) return;
            const focusables = Array.from(contentRef.current.querySelectorAll<HTMLElement>(focusableSelectors)).filter(
                (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
            );
            if (focusables.length === 0) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        if (open) {
            previousActiveElement.current = document.activeElement as HTMLElement;
            document.addEventListener('keydown', handleEsc);
            document.addEventListener('keydown', handleTab);
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                const focusables = contentRef.current?.querySelectorAll<HTMLElement>(focusableSelectors);
                const first = focusables?.[0];
                if (first) first.focus();
            }, 50);
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.removeEventListener('keydown', handleTab);
            document.body.style.overflow = '';
            previousActiveElement.current?.focus();
        };
    }, [open, onClose]);

    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={onClose}
                        aria-hidden="true"
                    />
                    <motion.div
                        ref={contentRef}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className={`relative w-full ${sizeClasses[size]} max-h-[90vh] rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl dark:border-slate-700/50 dark:bg-slate-900`}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 id="modal-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                                aria-label="Tutup"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="overflow-y-auto text-sm text-slate-600 dark:text-slate-300" style={{ maxHeight: 'calc(90vh - 8rem)' }}>
                            {children}
                        </div>
                        {footer && <div className="mt-6 flex items-center justify-end gap-2">{footer}</div>}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
