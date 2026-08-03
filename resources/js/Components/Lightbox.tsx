import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface LightboxImage {
    src: string;
    alt?: string;
}

interface LightboxProps {
    images: LightboxImage[];
    initialIndex?: number;
    open: boolean;
    onClose: () => void;
}

export function Lightbox({ images, initialIndex = 0, open, onClose }: LightboxProps) {
    const [index, setIndex] = useState(initialIndex);

    useEffect(() => {
        if (open) setIndex(initialIndex);
    }, [open, initialIndex]);

    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        };
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [open, onClose, index]);

    if (!open || images.length === 0) return null;

    const current = images[index];

    const next = () => setIndex((i) => (i + 1) % images.length);
    const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div className="absolute right-4 top-4 flex gap-2">
                <a
                    href={current.src}
                    download
                    className="rounded-full bg-slate-800/80 p-2 text-white transition hover:bg-slate-700"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Unduh gambar"
                >
                    <Download className="h-5 w-5" />
                </a>
                <button
                    onClick={onClose}
                    className="rounded-full bg-slate-800/80 p-2 text-white transition hover:bg-slate-700"
                    aria-label="Tutup"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {images.length > 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); prev(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-slate-800/60 p-3 text-white transition hover:bg-slate-700"
                    aria-label="Sebelumnya"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
            )}

            <img
                src={current.src}
                alt={current.alt || 'Preview'}
                className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />

            {images.length > 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); next(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-slate-800/60 p-3 text-white transition hover:bg-slate-700"
                    aria-label="Berikutnya"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>
            )}

            {current.alt && (
                <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-slate-800/80 px-4 py-1.5 text-sm text-white">
                    {current.alt}
                </p>
            )}

            {images.length > 1 && (
                <p className="absolute bottom-12 left-1/2 -translate-x-1/2 rounded-full bg-slate-800/60 px-3 py-1 text-xs text-white">
                    {index + 1} / {images.length}
                </p>
            )}
        </div>,
        document.body
    );
}
