import { ChevronDown, ChevronUp } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { EmptyState } from './EmptyState';
import { SkeletonTable } from './Skeleton';

export interface Column<T> {
    header: string;
    accessor: keyof T | ((row: T) => ReactNode);
    className?: string;
    sortable?: boolean;
    sortAccessor?: (row: T) => string | number;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (row: T) => string | number;
    emptyText?: string;
    isLoading?: boolean;
    sort?: { key: keyof T | string; direction: 'asc' | 'desc' } | null;
    onSort?: (key: keyof T | string) => void;
}

export function DataTable<T>({
    columns,
    data,
    keyExtractor,
    emptyText = 'Tidak ada data.',
    isLoading,
    sort,
    onSort,
}: DataTableProps<T>) {
    const [internalSort, setInternalSort] = useState<{ key: keyof T | string; direction: 'asc' | 'desc' } | null>(null);

    const activeSort = sort ?? internalSort;

    const handleSort = (col: Column<T>) => {
        const key = col.header;
        if (!col.sortable) return;
        if (onSort) {
            onSort(key);
            return;
        }
        setInternalSort((prev) => {
            if (prev?.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const sortData = (rows: T[]) => {
        if (!activeSort) return rows;
        const col = columns.find((c) => c.header === activeSort.key);
        if (!col) return rows;
        return [...rows].sort((a, b) => {
            const getA = col.sortAccessor || (typeof col.accessor === 'function' ? col.accessor : (row: T) => row[col.accessor as keyof T]);
            const getB = col.sortAccessor || getA;
            const va = typeof getA === 'function' ? (getA as any)(a) : a[getA as keyof T];
            const vb = typeof getB === 'function' ? (getB as any)(b) : b[getB as keyof T];
            if (va == null) return activeSort.direction === 'asc' ? 1 : -1;
            if (vb == null) return activeSort.direction === 'asc' ? -1 : 1;
            if (typeof va === 'number' && typeof vb === 'number') {
                return activeSort.direction === 'asc' ? va - vb : vb - va;
            }
            const sa = String(va).toLowerCase();
            const sb = String(vb).toLowerCase();
            if (sa < sb) return activeSort.direction === 'asc' ? -1 : 1;
            if (sa > sb) return activeSort.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    if (isLoading) {
        return <SkeletonTable rows={5} columns={columns.length} className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-800/80" />;
    }

    const isActionColumn = (header: string) => header.toLowerCase().includes('aksi');
    const sortedData = sortData(data);

    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
            <table className="min-w-full border-collapse divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900/50">
                    <tr>
                        {columns.map((col, idx) => {
                            const action = isActionColumn(col.header);
                            const sorted = activeSort?.key === col.header;
                            return (
                                <th
                                    key={idx}
                                    onClick={() => handleSort(col)}
                                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${
                                        action ? 'sticky right-0 z-20 w-px whitespace-nowrap border-l border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50' : ''
                                    } ${col.sortable ? 'cursor-pointer select-none hover:text-indigo-600' : ''} ${col.className || ''}`}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.header}
                                        {col.sortable && sorted && (
                                            activeSort.direction === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                                        )}
                                    </div>
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
                    {sortedData.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-4 py-6">
                                <EmptyState title={emptyText} />
                            </td>
                        </tr>
                    ) : (
                        sortedData.map((row) => (
                            <tr key={keyExtractor(row)} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                {columns.map((col, idx) => {
                                    const value = typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as ReactNode);
                                    const action = isActionColumn(col.header);
                                    return (
                                        <td
                                            key={idx}
                                            className={`px-4 py-3 text-sm text-slate-700 dark:text-slate-200 ${
                                                action ? 'sticky right-0 z-10 w-px whitespace-nowrap border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900' : ''
                                            } ${col.className || ''}`}
                                        >
                                            {value}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
