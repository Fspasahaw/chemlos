import { router, usePage } from '@inertiajs/react';
import { useCallback, useMemo, useRef } from 'react';

interface UseFilterOptions {
    base?: string;
    replace?: boolean;
    preserveState?: boolean;
    preserveScroll?: boolean;
}

export function useFilter<T extends Record<string, any>>(opts?: UseFilterOptions | string) {
    const page = usePage();
    const filters = useMemo(() => ((page.props.filters ?? {}) as T) || ({} as T), [page.props.filters]);
    const filtersRef = useRef(filters);
    filtersRef.current = filters;

    const resolvedOpts = useMemo<UseFilterOptions>(() => {
        if (typeof opts === 'string') return { base: opts };
        return opts ?? {};
    }, [opts]);

    const base = useMemo(() => {
        return resolvedOpts.base || (page.props.base as string) || window.location.pathname;
    }, [resolvedOpts.base, page.props.base]);

    const { preserveState, preserveScroll, replace } = resolvedOpts;

    const apply = useCallback(
        (params: Partial<T>) => {
            const next = { ...filtersRef.current, ...params } as Record<string, any>;
            router.get(
                base,
                next,
                {
                    preserveState: preserveState ?? true,
                    preserveScroll: preserveScroll ?? true,
                    replace: replace ?? true,
                }
            );
        },
        [base, preserveState, preserveScroll, replace]
    );

    return { filters, apply };
}
