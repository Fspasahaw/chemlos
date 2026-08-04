import { Search, X } from 'lucide-react';
import { forwardRef, InputHTMLAttributes, useEffect, useImperativeHandle, useRef, useState } from 'react';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value?: string;
    onChange?: (value: string) => void;
    onSearch?: (value: string) => void;
    debounce?: number;
    variant?: 'default' | 'pill';
    placeholder?: string;
    className?: string;
    loading?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
    ({ value, onChange, onSearch, debounce = 300, variant = 'default', placeholder = 'Cari...', className = '', loading, ...props }, ref) => {
        const [internal, setInternal] = useState(value ?? '');
        const inputRef = useRef<HTMLInputElement>(null);
        const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
        const onChangeRef = useRef(onChange);
        const onSearchRef = useRef(onSearch);

        useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

        useEffect(() => {
            onChangeRef.current = onChange;
            onSearchRef.current = onSearch;
        }, [onChange, onSearch]);

        useEffect(() => {
            const next = value ?? '';
            if (next !== internal && document.activeElement !== inputRef.current) {
                setInternal(next);
            }
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            setInternal(val);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                onChangeRef.current?.(val);
                onSearchRef.current?.(val);
            }, debounce);
        };

        const clear = () => {
            setInternal('');
            onChangeRef.current?.('');
            onSearchRef.current?.('');
            inputRef.current?.focus();
        };

        const rounded = variant === 'pill' ? 'rounded-full' : 'rounded-xl';

        return (
            <div className={`relative ${className}`}>
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search className="h-4 w-4" />
                </span>
                <input
                    ref={inputRef}
                    type="text"
                    value={internal}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`w-full border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${rounded}`}
                    {...props}
                />
                {loading ? (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                    </span>
                ) : internal ? (
                    <button
                        type="button"
                        onClick={clear}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        <X className="h-4 w-4" />
                    </button>
                ) : null}
            </div>
        );
    }
);

SearchInput.displayName = 'SearchInput';
