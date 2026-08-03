import { Loader2 } from 'lucide-react';

interface LoaderProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    fullScreen?: boolean;
}

const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
};

export function Loader({ size = 'md', text, fullScreen = false }: LoaderProps) {
    const content = (
        <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className={`${sizeMap[size]} animate-spin text-indigo-600`} />
            {text && <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
                {content}
            </div>
        );
    }

    return content;
}
