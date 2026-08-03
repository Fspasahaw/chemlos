import { useId } from 'react';

interface RadioOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface RadioProps {
    name: string;
    options: RadioOption[];
    value?: string;
    onChange?: (value: string) => void;
    label?: string;
    error?: string;
    hint?: string;
    disabled?: boolean;
    className?: string;
}

export function Radio({ name, options, value, onChange, label, error, hint, disabled, className = '' }: RadioProps) {
    const groupId = useId();

    return (
        <fieldset className={`${className}`}>
            {label && <legend className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</legend>}
            <div className="space-y-2">
                {options.map((option) => {
                    const id = `${groupId}-${option.value}`;
                    const isChecked = value === option.value;
                    const isDisabled = disabled || option.disabled;

                    return (
                        <label
                            key={option.value}
                            htmlFor={id}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                                isChecked
                                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20'
                                    : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-500'
                            } ${isDisabled ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                            <span className="relative flex h-5 w-5 items-center justify-center">
                                <input
                                    id={id}
                                    type="radio"
                                    name={name}
                                    value={option.value}
                                    checked={isChecked}
                                    disabled={isDisabled}
                                    onChange={() => onChange?.(option.value)}
                                    className="peer h-5 w-5 appearance-none rounded-full border-2 border-slate-300 transition-colors checked:border-indigo-600 checked:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600"
                                />
                                <span className="pointer-events-none absolute h-2.5 w-2.5 scale-0 rounded-full bg-white transition-transform peer-checked:scale-100" />
                            </span>
                            <span className={`text-sm ${isDisabled ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>{option.label}</span>
                        </label>
                    );
                })}
            </div>
            {error && <p className="mt-1.5 text-xs text-rose-500">{error}</p>}
            {hint && !error && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
        </fieldset>
    );
}
