import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps {
    src?: string | null;
    alt: string;
    className?: string;
    iconClassName?: string;
}

export function ImageWithFallback({ src, alt, className = '', iconClassName = '' }: ImageWithFallbackProps) {
    const [error, setError] = useState(false);

    if (!src || error) {
        return (
            <div className={`flex items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800 ${className}`}>
                <ImageIcon className={`h-8 w-8 opacity-50 ${iconClassName}`} />
            </div>
        );
    }

    return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
}
