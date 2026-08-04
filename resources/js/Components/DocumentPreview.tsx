import { Download, FileText } from 'lucide-react';
import Modal from './Modal';

interface DocumentPreviewProps {
    file: string;
    title: string;
    open: boolean;
    onClose: () => void;
}

export function DocumentPreview({ file, title, open, onClose }: DocumentPreviewProps) {
    const src = `/storage/${file}`;
    return (
        <Modal open={open} onClose={onClose} title={title} size="xl">
            <div className="space-y-4">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    <iframe
                        src={src}
                        title={title}
                        className="h-full w-full"
                    />
                </div>
                <div className="flex items-center justify-end gap-2">
                    <a
                        href={src}
                        download
                        className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                    >
                        <Download className="h-4 w-4" /> Unduh
                    </a>
                    <a
                        href={src}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                        <FileText className="h-4 w-4" /> Buka Tab Baru
                    </a>
                </div>
            </div>
        </Modal>
    );
}
