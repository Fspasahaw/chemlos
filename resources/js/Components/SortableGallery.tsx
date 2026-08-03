import { GripVertical } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDeleteButton } from './ConfirmDeleteButton';
import { ImageWithFallback } from './ImageWithFallback';

interface GalleryItem {
    id: number;
    file: string;
    judul?: string | null;
}

interface SortableGalleryProps {
    items: GalleryItem[];
    baseUrl?: string;
    onReorder: (ids: number[]) => void;
    onDelete: (id: number) => void;
}

export function SortableGallery({ items, baseUrl = '/storage/', onReorder, onDelete }: SortableGalleryProps) {
    const [dragging, setDragging] = useState<number | null>(null);
    const [order, setOrder] = useState<GalleryItem[]>(items);

    const handleDragStart = (id: number) => setDragging(id);
    const handleDragOver = (e: React.DragEvent, targetId: number) => {
        e.preventDefault();
        if (dragging === null || dragging === targetId) return;
        const newOrder = [...order];
        const fromIdx = newOrder.findIndex((i) => i.id === dragging);
        const toIdx = newOrder.findIndex((i) => i.id === targetId);
        const [moved] = newOrder.splice(fromIdx, 1);
        newOrder.splice(toIdx, 0, moved);
        setOrder(newOrder);
    };
    const handleDrop = () => {
        onReorder(order.map((i) => i.id));
        setDragging(null);
    };

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {order.map((item) => (
                <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item.id)}
                    onDragOver={(e) => handleDragOver(e, item.id)}
                    onDrop={handleDrop}
                    className={`group relative cursor-move rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900 ${dragging === item.id ? 'opacity-50' : ''}`}
                >
                    <div className="absolute left-2 top-2 rounded-md bg-black/50 p-1 text-white opacity-0 transition group-hover:opacity-100">
                        <GripVertical className="h-4 w-4" />
                    </div>
                    <ImageWithFallback src={`${baseUrl}${item.file}`} alt={item.judul ?? ''} className="aspect-square w-full rounded-xl object-cover" />
                    {item.judul && <p className="mt-1 truncate text-xs text-slate-600 dark:text-slate-300">{item.judul}</p>}
                    <ConfirmDeleteButton
                        onDelete={() => onDelete(item.id)}
                        description="Yakin ingin menghapus item ini?"
                        className="absolute right-2 top-2 rounded-md bg-rose-500 p-1 text-white opacity-0 transition group-hover:opacity-100 hover:bg-rose-600"
                    />
                </div>
            ))}
        </div>
    );
}
