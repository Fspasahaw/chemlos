import { usePage } from '@inertiajs/react';
import { Breadcrumb } from './Breadcrumb';

const routeLabels: Record<string, string> = {
    'laboratorium': 'Laboratorium',
    'alat': 'Alat',
    'tutorial': 'Tutorial',
    'tentang': 'Tentang',
    'faq': 'FAQ',
    'kontak': 'Kontak',
    'syarat-ketentuan': 'Syarat & Ketentuan',
    'kebijakan-privasi': 'Kebijakan Privasi',
    'daftar': 'Daftar',
    'login': 'Login',
    'lupa-password': 'Lupa Password',
    'verifikasi-email': 'Verifikasi Email',
};

export function PublicBreadcrumb() {
    const { url } = usePage();
    const urlPath = url.split('?')[0];
    const segments = urlPath.replace(/^\//, '').split('/').filter(Boolean);

    if (segments.length === 0) {
        return null;
    }

    const items = segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/');
        const label = routeLabels[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        return index === segments.length - 1 ? { label } : { label, href };
    });

    return (
        <div className="border-b border-slate-200/80 bg-white/80 py-3 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/80">
            <div className="mx-auto flex max-w-7xl items-center px-4">
                <Breadcrumb items={items} />
            </div>
        </div>
    );
}
