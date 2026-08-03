import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
    message?: string;
}

export default function LoadingScreen({ message = 'Memuat...' }: LoadingScreenProps) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
            <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{message}</p>
        </div>
    );
}
