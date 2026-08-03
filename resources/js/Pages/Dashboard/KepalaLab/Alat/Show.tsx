import { usePage } from '@inertiajs/react';
import AlatShow from '../../../../Components/AlatShow';

export default function Show() {
    const { item } = usePage().props as any;
    return <AlatShow base="/dashboard/kepala-lab/alat" editHref={`/dashboard/kepala-lab/alat/${item.id}/edit`} />;
}
