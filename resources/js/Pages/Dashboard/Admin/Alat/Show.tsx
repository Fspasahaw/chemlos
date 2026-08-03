import { usePage } from '@inertiajs/react';
import AlatShow from '@/Components/AlatShow';

export default function Show() {
    const { item } = usePage().props as any;
    return <AlatShow base="/dashboard/admin/alat" editHref={`/dashboard/admin/alat/${item.id}/edit`} />;
}
