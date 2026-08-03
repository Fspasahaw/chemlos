import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    noPadding?: boolean;
}

export function Card({ children, className = '', noPadding = false, ...props }: CardProps) {
    return (
        <div
            className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900 ${
                noPadding ? '' : 'p-6'
            } ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    title?: string;
    subtitle?: string;
    action?: ReactNode;
    icon?: ReactNode;
}

Card.Header = function CardHeader({ title, subtitle, action, icon }: CardHeaderProps) {
    return (
        <div className={`mb-4 flex items-start justify-between ${!title ? 'hidden' : ''}`}>
            <div className="flex items-center gap-3">
                {icon && <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20">{icon}</div>}
                <div>
                    {title && <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
                    {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
                </div>
            </div>
            {action}
        </div>
    );
};
