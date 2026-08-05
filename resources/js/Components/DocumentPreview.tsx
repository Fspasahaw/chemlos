import { Download, FileText, FileX } from 'lucide-react';
import { useEffect, useState } from 'react';
import Modal from './Modal';

interface DocumentPreviewProps {
    file: string;
    title: string;
    open: boolean;
    onClose: () => void;
}

export function DocumentPreview({ file, title, open, onClose }: DocumentPreviewProps) {
    const src = `/storage/${file}`;
    const [exists, setExists] = useState<boolean | null>(null);

    useEffect(() => {
        if (!open) {
            setExists(null);
            return;
        }

        setExists(null);
        fetch(src, { method: 'HEAD' })
            .then((res) => setExists(res.ok))
            .catch(() => setExists(false));
    }, [src, open]);

    const missing = exists === false;

    return (
        <Modal open={open} onClose={onClose} title={title} size="xl">
            <div className="space-y-4">
                {missing ? (
                    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <FileX className="h-12 w-12" />
                        <p className="text-sm font-medium">File tidak ditemukan atau telah dihapus.</p>
                    </div>
                ) : (
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                        <iframe
                            src={src}
                            title={title}
                            className="h-full w-full"
                        />
                    </div>
                )}
                <div className="flex items-center justify-end gap-2">
                    <a
                        href={src}
                        download
                        className={`inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 ${missing ? 'pointer-events-none opacity-50' : ''}`}
                        aria-disabled={missing}
                    >
                        <Download className="h-4 w-4" /> Unduh
                    </a>
                    <a
                        href={src}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${missing ? 'pointer-events-none opacity-50' : ''}`}
                        aria-disabled={missing}
                    >
                        <FileText className="h-4 w-4" /> Buka Tab Baru
                    </a>
                </div>
            </div>
        </Modal>
    );
}
