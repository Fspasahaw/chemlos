import { GripVertical } from 'lucide-react';
import { ReactNode, useState } from 'react';

interface SortableListItem {
    id: number;
}

interface SortableListProps<T extends SortableListItem> {
    items: T[];
    renderItem: (item: T) => ReactNode;
    onReorder: (ids: number[]) => void;
}

export function SortableList<T extends SortableListItem>({ items, renderItem, onReorder }: SortableListProps<T>) {
    const [order, setOrder] = useState<T[]>(items);
    const [dragging, setDragging] = useState<number | null>(null);

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
        <div className="space-y-2">
            {order.map((item) => (
                <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item.id)}
                    onDragOver={(e) => handleDragOver(e, item.id)}
                    onDrop={handleDrop}
                    className={`group flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900 ${dragging === item.id ? 'opacity-50' : ''}`}
                >
                    <div className="cursor-move rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <GripVertical className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">{renderItem(item)}</div>
                </div>
            ))}
        </div>
    );
}
