import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, leftIcon, rightIcon, className = '', type, ...props }, ref) => {
        const isNumber = type === 'number';
        return (
            <div className={`w-full ${className}`}>
                {label && (
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            {leftIcon}
                        </span>
                    )}
                    <input
                        ref={ref}
                        type={type}
                        className={`w-full cursor-text rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600 ${
                            error
                                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-700'
                                : 'border-slate-200 dark:border-slate-700'
                        } ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${
                            isNumber ? '[appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden' : ''
                        }`}
                        {...props}
                    />
                    {rightIcon && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                            {rightIcon}
                        </span>
                    )}
                </div>
                {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
                {hint && !error && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
