import { forwardRef, TextareaHTMLAttributes, useEffect, useRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    autoResize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, hint, leftIcon, autoResize, className = '', ...props }, forwardedRef) => {
        const innerRef = useRef<HTMLTextAreaElement>(null);

        useEffect(() => {
            if (!autoResize || !innerRef.current) return;
            const el = innerRef.current;
            el.style.height = 'auto';
            el.style.height = `${el.scrollHeight}px`;
        }, [autoResize, props.value, props.defaultValue]);

        const setRef = (node: HTMLTextAreaElement | null) => {
            innerRef.current = node;
            if (typeof forwardedRef === 'function') forwardedRef(node);
            else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        };
        return (
            <div className={`w-full ${className}`}>
                {label && (
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <span className="pointer-events-none absolute left-0 top-3 flex items-center pl-3 text-slate-400">
                            {leftIcon}
                        </span>
                    )}
                    <textarea
                        ref={setRef}
                        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-900 ${
                            error
                                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-700'
                                : 'border-slate-200 dark:border-slate-700'
                        } ${leftIcon ? 'pl-10' : ''}`}
                        {...props}
                    />
                </div>
                {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
                {hint && !error && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
