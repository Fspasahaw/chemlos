import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success' | 'warning' | 'info' | 'neutral';
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

const variantClasses: Record<string, string> = {
    primary:
        'bg-linear-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/25 focus:ring-indigo-500 disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none',
    secondary:
        'bg-linear-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 hover:-translate-y-0.5 hover:shadow-lg focus:ring-violet-500 disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none',
    success:
        'bg-linear-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/25 focus:ring-emerald-500 disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none',
    warning:
        'bg-linear-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/25 focus:ring-orange-500 disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none',
    info:
        'bg-linear-to-r from-sky-500 to-cyan-500 text-white hover:from-sky-600 hover:to-cyan-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-500/25 focus:ring-sky-500 disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none',
    danger:
        'bg-linear-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-500/25 focus:ring-rose-500 disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none',
    outline:
        'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-indigo-300 focus:ring-indigo-500 disabled:opacity-70',
    ghost:
        'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 focus:ring-slate-500 disabled:opacity-70',
    neutral:
        'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 focus:ring-slate-500 disabled:opacity-70',
};

const sizeClasses: Record<string, string> = {
    sm: 'px-4 py-1.5 text-xs rounded-full',
    md: 'px-6 py-2.5 text-sm rounded-full',
    lg: 'px-8 py-3 text-base rounded-full',
    xl: 'px-10 py-4 text-lg rounded-full',
    icon: 'h-9 w-9 rounded-full p-2',
};

export function Button({
    variant = 'primary',
    size = 'md',
    isLoading,
    leftIcon,
    rightIcon,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const base = 'group inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:focus:ring-offset-slate-900';
    return (
        <button
            className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {!isLoading && leftIcon && <span className="shrink-0 transition-transform group-hover:-translate-x-0.5">{leftIcon}</span>}
            {children && <span className="truncate">{children}</span>}
            {!isLoading && rightIcon && <span className="shrink-0 transition-transform group-hover:translate-x-0.5">{rightIcon}</span>}
        </button>
    );
}
