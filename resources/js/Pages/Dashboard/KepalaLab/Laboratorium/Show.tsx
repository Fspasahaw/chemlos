import { usePage } from '@inertiajs/react';
import LaboratoriumShow from '../../../../Components/LaboratoriumShow';

export default function Show() {
    const { item } = usePage().props as any;
    return <LaboratoriumShow base="/dashboard/kepala-lab/laboratorium" editHref={`/dashboard/kepala-lab/laboratorium/${item.id}/edit`} />;
}
