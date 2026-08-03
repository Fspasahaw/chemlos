import { Head, usePage } from '@inertiajs/react';
import { Badge } from '../../../../Components/Badge';
import { Card } from '../../../../Components/Card';
import { programStudiStatusMap } from '../../../../lib/status';

export default function Show() {
    const { item } = usePage().props as any;

    return (
        <>
            <Head title={item.nama} />
            <div className="mb-6">
                <h1 className="text-2xl font-bold">{item.nama}</h1>
                <p className="text-slate-500 dark:text-slate-400">{item.jenjang} &bull; {item.kode} &bull; <Badge variant={programStudiStatusMap[item.status]?.variant ?? 'neutral'}>{programStudiStatusMap[item.status]?.label ?? item.status}</Badge></p>
            </div>
            <Card>
                <p className="text-sm text-slate-600 dark:text-slate-300">{item.deskripsi ?? 'Tidak ada deskripsi.'}</p>
                <p className="mt-4 text-sm text-slate-500">Jumlah mahasiswa: <span className="font-medium text-slate-900 dark:text-slate-100">{item.mahasiswa_count ?? 0}</span></p>
            </Card>
        </>
    );
}
