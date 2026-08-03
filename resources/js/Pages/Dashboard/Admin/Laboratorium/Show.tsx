import { usePage } from '@inertiajs/react';
import LaboratoriumShow from '@/Components/LaboratoriumShow';

export default function Show() {
    const { item } = usePage().props as any;
    return <LaboratoriumShow base="/dashboard/admin/laboratorium" editHref={`/dashboard/admin/laboratorium/${item.id}/edit`} />;
}
