import { FileText, Upload, X, AlertCircle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface FileUploadProps {
    label?: string;
    accept?: string;
    maxSizeMB?: number;
    value?: File | string | null;
    onChange: (file: File | null) => void;
    error?: string;
    hint?: string;
    disabled?: boolean;
    className?: string;
    previewClassName?: string;
}

export function FileUpload({
    label,
    accept = 'image/*',
    maxSizeMB = 2,
    value,
    onChange,
    error,
    hint,
    disabled,
    className = '',
    previewClassName = '',
}: FileUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);
    const [localError, setLocalError] = useState('');
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        setImgError(false);
    }, [value]);

    const maxBytes = maxSizeMB * 1024 * 1024;

    const fileName = (() => {
        if (!value) return '';
        if (typeof value === 'string') return value.split('/').pop() ?? value;
        if (value instanceof File) return value.name;
        return '';
    })();

    const isImage = useMemo(() => {
        if (!value) return false;
        if (typeof value === 'string') return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(value);
        if (value instanceof File) return value.type.startsWith('image/');
        return false;
    }, [value]);

    const previewUrl = (() => {
        if (!value || !isImage) return null;
        if (typeof value === 'string') return value.startsWith('http') ? value : `/storage/${value}`;
        if (value instanceof File) return URL.createObjectURL(value);
        return null;
    })();

    const validate = (file: File): boolean => {
        setLocalError('');
        if (maxBytes && file.size > maxBytes) {
            setLocalError(`Ukuran file maksimal ${maxSizeMB} MB.`);
            return false;
        }
        if (accept && accept !== '*') {
            const acceptedTypes = accept.split(',').map((t) => t.trim());
            const matches = acceptedTypes.some((type) => {
                if (type.includes('*')) {
                    return file.type.startsWith(type.split('/')[0]);
                }
                if (type.startsWith('.')) {
                    return new RegExp(`\\${type}$`, 'i').test(file.name);
                }
                return file.type === type;
            });
            if (!matches) {
                setLocalError(`Format file tidak didukung. Gunakan ${accept}.`);
                return false;
            }
        }
        return true;
    };

    const handleFile = (file: File | null) => {
        if (!file) {
            onChange(null);
            return;
        }
        if (validate(file)) {
            onChange(file);
        } else {
            onChange(null);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0] ?? null;
        handleFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
    };

    const handleDragLeave = () => setDragOver(false);

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    {label}
                </label>
            )}
            {value && (
                <div className={`relative mb-3 inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-3 dark:border-slate-700/80 dark:bg-slate-900/50 ${previewClassName}`}>
                    {isImage && previewUrl && !imgError ? (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="h-16 w-auto max-w-full rounded-xl object-cover"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <span className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                            <FileText className="h-5 w-5 text-indigo-600" /> {fileName || 'File'}
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            onChange(null);
                            if (inputRef.current) inputRef.current.value = '';
                        }}
                        disabled={disabled}
                        className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow hover:bg-rose-600 disabled:opacity-50"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !disabled && inputRef.current?.click()}
                className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
                    dragOver
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-400'
                } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                    disabled={disabled}
                    className="hidden"
                />
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
                    <Upload className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {fileName ? fileName : 'Klik atau seret file ke sini'}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {hint || `Maks ${maxSizeMB} MB`}
                </p>
            </div>
            {(error || localError) && (
                <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                    <AlertCircle className="h-3.5 w-3.5" /> {error || localError}
                </p>
            )}
        </div>
    );
}

export default FileUpload;
