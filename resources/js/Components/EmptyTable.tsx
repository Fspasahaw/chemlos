import { Inbox } from 'lucide-react';

interface EmptyTableProps {
    message?: string;
    description?: string;
    colSpan?: number;
}

export function EmptyTable({ message = 'Tidak ada data.', description, colSpan = 99 }: EmptyTableProps) {
    return (
        <tr>
            <td colSpan={colSpan} className="px-4 py-8 text-center">
                <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    <Inbox className="h-8 w-8" />
                    <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">{message}</p>
                    {description && <p className="text-xs text-slate-400 dark:text-slate-500">{description}</p>}
                </div>
            </td>
        </tr>
    );
}
