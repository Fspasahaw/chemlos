/// <reference types="vite/client" />

import { PageProps as InertiaPageProps } from '@inertiajs/core';

declare module '*.tsx' {
    const component: React.ComponentType<Record<string, unknown>>;
    export default component;
}

declare module '*.css';

export interface User {
    id: number;
    name: string;
    nama_lengkap: string;
    email: string;
    npm_nip: string;
    no_hp: string;
    avatar?: string | null;
    program_studi_id?: number | null;
    jabatan_pimpinan?: string | null;
    status: string;
    roles?: string[];
    unread_notifications_count?: number;
    email_verified_at?: string | null;
}

export interface PageProps extends InertiaPageProps {
    auth?: {
        user: User;
    };
    flash?: {
        success?: string | null;
        error?: string | null;
        warning?: string | null;
    };
    settings?: Record<string, string | null>;
    features?: Record<string, boolean>;
    recaptcha?: {
        enabled: boolean;
        site_key?: string;
    };
    errors?: Record<string, string>;
    [key: string]: unknown;
}

declare global {
    interface Window {
        Ziggy?: {
            routes: Record<string, unknown>;
            port?: number | null;
            defaults: Record<string, unknown>;
            url: string;
        };
        grecaptcha?: {
            ready: (callback: () => void) => void;
            execute: (siteKey: string, options: { action: string }) => Promise<string>;
        };
        google?: {
            translate: {
                TranslateElement: new (options: Record<string, unknown>, elementId: string) => void;
            };
        };
    }
}

declare module 'ziggy-js' {
    export function route(name: string, params?: unknown, absolute?: boolean, ziggy?: unknown): string;
}
