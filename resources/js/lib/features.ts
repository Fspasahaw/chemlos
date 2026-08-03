import { usePage } from '@inertiajs/react';

export function useFeatureEnabled(feature: string): boolean {
    const { features } = usePage().props as { features?: Record<string, boolean> };
    return !!features?.[feature];
}

export function useFeatures(): Record<string, boolean> {
    const { features } = usePage().props as { features?: Record<string, boolean> };
    return features ?? {};
}
