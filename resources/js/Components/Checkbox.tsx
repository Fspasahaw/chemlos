import { Check, Minus } from 'lucide-react';
import { InputHTMLAttributes, ReactNode, useId } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
    label?: ReactNode;
    indeterminate?: boolean;
    error?: string;
    hint?: string;
    onChange?: (checked: boolean) => void;
}

export function Checkbox({ label, indeterminate, error, hint, onChange, className = '', disabled, ...props }: CheckboxProps) {
    const generatedId = useId();
    const id = props.id ?? generatedId;

    return (
        <div className={`flex items-start gap-3 ${className}`}>
            <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                <input
                    {...props}
                    id={id}
                    type="checkbox"
                    disabled={disabled}
                    aria-checked={indeterminate ? 'mixed' : props.checked}
                    onChange={(e) => onChange?.(e.target.checked)}
                    className={`peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-md border-2 transition-colors checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-60 ${
                        error
                            ? 'border-rose-300 dark:border-rose-700'
                            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500'
                    }`}
                />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-100 transition-opacity">
                    {indeterminate ? <Minus className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
            </div>
            <div className="flex flex-col">
                {label && (
                    <label htmlFor={id} className={`text-sm font-medium ${disabled ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                        {label}
                    </label>
                )}
                {error && <p className="mt-0.5 text-xs text-rose-500">{error}</p>}
                {hint && !error && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
            </div>
        </div>
    );
}
