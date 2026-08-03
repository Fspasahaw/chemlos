import { KeyboardEvent, useId } from 'react';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    id?: string;
    disabled?: boolean;
}

export function Switch({ checked, onChange, label, id, disabled }: SwitchProps) {
    const generatedId = useId();
    const switchId = id ?? generatedId;

    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onChange(!checked);
        }
    };

    return (
        <div className="flex items-center gap-3">
            <button
                type="button"
                id={switchId}
                role="switch"
                aria-checked={checked}
                aria-disabled={disabled}
                disabled={disabled}
                tabIndex={disabled ? -1 : 0}
                onClick={() => onChange(!checked)}
                onKeyDown={handleKeyDown}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                    checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
            {label && (
                <label htmlFor={switchId} className={`text-sm ${disabled ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                    {label}
                </label>
            )}
        </div>
    );
}
