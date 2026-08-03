import './bootstrap';
import './echo';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createElement, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { GlobalLoadingIndicator } from './Components/GlobalLoadingIndicator';
import DashboardLayout from './Layouts/DashboardLayout';
import GuestLayout from './Layouts/GuestLayout';
import PublicLayout from './Layouts/PublicLayout';
import { LanguageProvider } from './Providers/LanguageProvider';
import { NotificationProvider } from './Providers/NotificationProvider';
import { ThemeProvider } from './Providers/ThemeProvider';

const appName = import.meta.env.VITE_APP_NAME || 'ChemLOS';

function getLayout(name: string) {
    if (name.startsWith('Dashboard/') || name.startsWith('Profile/') || name.startsWith('Notifikasi/')) return DashboardLayout;
    if (name.startsWith('Auth/')) return GuestLayout;
    return PublicLayout;
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name) => {
        const page = await resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')) as any;
        const Layout = getLayout(name);
        page.default.layout = page.default.layout || ((pageComponent: ReactNode) => createElement(Layout, null, pageComponent));
        return page;
    },

    setup({ el, App, props }) {
        if (!el) return;
        const root = createRoot(el);
        root.render(
            <ThemeProvider>
                <LanguageProvider>
                    <NotificationProvider>
                        <GlobalLoadingIndicator />
                        <App {...props} />
                    </NotificationProvider>
                </LanguageProvider>
            </ThemeProvider>
        );
    },
    progress: false,
});
