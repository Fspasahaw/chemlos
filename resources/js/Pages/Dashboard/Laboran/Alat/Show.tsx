import { usePage } from '@inertiajs/react';
import AlatShow from '../../../../Components/AlatShow';

export default function Show() {
    const { item } = usePage().props as any;
    return <AlatShow base="/dashboard/laboran/alat" editHref={`/dashboard/laboran/alat/${item.id}/edit`} />;
}
