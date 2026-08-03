import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle, Eye, Pencil, Play, Plus, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { DatePicker } from '../DatePicker';
import { FilterChips } from '../FilterChips';
import { Input } from '../Input';
import { NumberStepper } from '../NumberStepper';
import Modal from '../Modal';
import { Pagination } from '../Pagination';
import { SearchInput } from '../SearchInput';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { Tooltip } from '../Tooltip';
import { EmptyTable } from '../EmptyTable';
import { kondisiAlatMap, kondisiAlatBadgeMap, statusMaintenanceMap } from '../../lib/status';
import { formatDate } from '../../lib/date';

interface Alat { id: number; nama: string; kode: string; laboratorium_id?: number; laboratorium?: { nama: string }; }
interface Lab { id: number; nama: string; }
interface Kerusakan { id: number; alat: Alat; alat_id: number; jumlah: number; kondisi: string; keterangan?: string; }
interface Maintenance {
    id: number;
    alat: Alat;
    laboratorium?: Lab;
    laboran?: { nama_lengkap: string };
    kerusakan?: Kerusakan;
    jumlah: number;
    status: string;
    keterangan: string;
    tanggal_mulai: string;
    tanggal_selesai?: string;
    teknisi?: string;
    biaya?: number;
}

interface Props { base: string; isAdmin?: boolean; canEdit?: boolean; }

const statusOptions = Object.entries(statusMaintenanceMap).map(([value, { label }]) => ({ value, label }));

export default function MaintenanceManager({ base, isAdmin = false, canEdit = true }: Props) {
    const { items, alats, kerusakans, labs, filters } = usePage().props as any;
    const [show, setShow] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [active, setActive] = useState<Maintenance | null>(null);
    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');
    const [lab, setLab] = useState(filters?.laboratorium_id ?? '');

    const form = useForm({ alat_id: '', kerusakan_id: '', jumlah: '1', keterangan: '', tanggal_mulai: '', tanggal_selesai: '', teknisi: '' });
    const editForm = useForm({ keterangan: '', tanggal_mulai: '', tanggal_selesai: '', teknisi: '', biaya: '' });

    useEffect(() => {
        if (form.data.kerusakan_id) {
            const k = kerusakans.find((x: Kerusakan) => String(x.id) === form.data.kerusakan_id);
            if (k) {
                form.setData((prev: any) => ({
                    ...prev,
                    alat_id: String(k.alat_id),
                    jumlah: String(k.jumlah),
                    keterangan: prev.keterangan || `Perbaikan ${kondisiAlatBadgeMap[k.kondisi]?.label ?? k.kondisi} pada ${k.alat.nama}`,
                }));
            }
        }
    }, [form.data.kerusakan_id]);

    useEffect(() => {
        if (active && showEdit) {
            editForm.setData({
                keterangan: active.keterangan ?? '',
                tanggal_mulai: active.tanggal_mulai,
                tanggal_selesai: active.tanggal_selesai ?? '',
                teknisi: active.teknisi ?? '',
                biaya: String(active.biaya ?? 0),
            });
        }
    }, [active, showEdit]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`${base}/maintenance`, { preserveScroll: true, onSuccess: () => { setShow(false); form.reset(); } });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!active) return;
        editForm.put(`${base}/maintenance/${active.id}`, { preserveScroll: true, onSuccess: () => { setShowEdit(false); setActive(null); editForm.reset(); } });
    };

    const action = (m: Maintenance, endpoint: string) => router.post(`${base}/maintenance/${m.id}/${endpoint}`, {}, { preserveScroll: true });

    const cari = () => router.get(`${base}/maintenance`, { search, status, laboratorium_id: lab }, { preserveState: true });
    const reset = () => { setSearch(''); setStatus(''); setLab(''); router.get(`${base}/maintenance`, {}, { preserveState: true }); };

    return (
        <>
            <Head title="Maintenance Alat" />
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold">Maintenance Alat</h1>
                <Button onClick={() => setShow(true)} leftIcon={<Plus className="h-4 w-4" />}>Maintenance Baru</Button>
            </div>

            <div className="mb-4 space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800/80 dark:bg-slate-900">
                <div className="flex flex-wrap items-end gap-3">
                    <SearchInput value={search} onChange={(v) => setSearch(v)} onSearch={cari} placeholder="Cari alat / teknisi / keterangan..." className="w-full max-w-md" />
                    {isAdmin && labs && (
                        <Select options={[{ value: '', label: 'Semua Laboratorium' }, ...labs.map((l: Lab) => ({ value: String(l.id), label: l.nama }))]} value={lab} onChange={(e) => { setLab(e.target.value); router.get(`${base}/maintenance`, { search, status, laboratorium_id: e.target.value }, { preserveState: true }); }} className="w-64" />
                    )}
                    <Button onClick={cari} size="md">Cari</Button>
                    {(search || status || lab) && (
                        <Button onClick={reset} variant="outline" size="md">Reset</Button>
                    )}
                </div>
                <FilterChips options={[{ value: '', label: 'Semua Status' }, ...statusOptions]} value={status} onChange={(v) => { setStatus(v as string); router.get(`${base}/maintenance`, { search, status: v as string, laboratorium_id: lab }, { preserveState: true }); }} />
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold">Alat</th>
                            <th className="px-4 py-3 text-left font-semibold">Lab</th>
                            <th className="px-4 py-3 text-left font-semibold">Jumlah</th>
                            <th className="px-4 py-3 text-left font-semibold">Status</th>
                            <th className="px-4 py-3 text-left font-semibold">Teknisi</th>
                            <th className="px-4 py-3 text-left font-semibold">Tanggal</th>
                            <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.data.length === 0 ? (
                            <EmptyTable colSpan={7} message="Tidak ada data." />
                        ) : items.data.map((m: Maintenance) => {
                            const st = statusMaintenanceMap[m.status] ?? { label: m.status, variant: 'neutral' };
                            return (
                                <tr key={m.id} className="border-t border-slate-200/80 dark:border-slate-800/80">
                                    <td className="px-4 py-3 font-medium">{m.alat.nama} <span className="text-xs text-slate-500">({m.alat.kode})</span></td>
                                    <td className="px-4 py-3 text-slate-500">{m.laboratorium?.nama ?? '-'}</td>
                                    <td className="px-4 py-3">{m.jumlah}</td>
                                    <td className="px-4 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                                    <td className="px-4 py-3">{m.teknisi || '-'}</td>
                                    <td className="px-4 py-3 text-slate-500">{formatDate(m.tanggal_mulai)} {m.tanggal_selesai ? `s/d ${formatDate(m.tanggal_selesai)}` : ''}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Tooltip content="Lihat detail">
                                                <Link href={`${base}/maintenance/${m.id}`} title="Lihat detail" className="inline-flex rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Lihat detail"><Eye className="h-4 w-4" /></Link>
                                            </Tooltip>
                                            {canEdit && m.status === 'dijadwalkan' && (
                                                <Tooltip content="Edit">
                                                    <button onClick={() => { setActive(m); setShowEdit(true); }} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                                                </Tooltip>
                                            )}
                                            {m.status === 'dijadwalkan' && (
                                                <Tooltip content="Mulai">
                                                    <button onClick={() => action(m, 'start')} className="rounded-lg p-2 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30" aria-label="Mulai"><Play className="h-4 w-4" /></button>
                                                </Tooltip>
                                            )}
                                            {(m.status === 'dijadwalkan' || m.status === 'berlangsung') && (
                                                <Tooltip content="Selesai">
                                                    <button onClick={() => action(m, 'complete')} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30" aria-label="Selesai"><CheckCircle className="h-4 w-4" /></button>
                                                </Tooltip>
                                            )}
                                            {(m.status === 'dijadwalkan' || m.status === 'berlangsung') && (
                                                <Tooltip content="Batal">
                                                    <button onClick={() => action(m, 'cancel')} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30" aria-label="Batal"><XCircle className="h-4 w-4" /></button>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <Pagination links={items.links} from={items.from} to={items.to} total={items.total} />

            <Modal open={show} onClose={() => setShow(false)} title="Tambah Maintenance" footer={
                <>
                    <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => setShow(false)}>Batal</Button>
                    <Button type="submit" form="form-maintenance" size="sm" className="rounded-xl" isLoading={form.processing}>{form.processing ? 'Menyimpan...' : 'Simpan'}</Button>
                </>
            }>
                <form id="form-maintenance" onSubmit={submit} className="space-y-4">
                    <Select label="Dari Kerusakan (opsional)" options={[{ value: '', label: 'Tidak ada' }, ...kerusakans.map((k: Kerusakan) => ({ value: String(k.id), label: `${k.alat.nama} - ${kondisiAlatMap[k.kondisi] ?? k.kondisi} (${k.jumlah} unit)` }))]} value={form.data.kerusakan_id} onChange={(e) => form.setData('kerusakan_id', e.target.value)} />
                    <Select label="Alat" options={alats.map((a: Alat) => ({ value: String(a.id), label: `${a.nama} (${a.kode})` }))} value={form.data.alat_id} onChange={(e) => form.setData('alat_id', e.target.value)} required />
                    <div className="grid gap-4 md:grid-cols-2">
                        <NumberStepper label="Jumlah" min={1} value={Number(form.data.jumlah) || 1} onChange={(v) => form.setData('jumlah', v)} required />
                        <DatePicker label="Tanggal Mulai" value={form.data.tanggal_mulai} onChange={(e) => form.setData('tanggal_mulai', e.target.value)} required />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <DatePicker label="Tanggal Selesai (opsional)" value={form.data.tanggal_selesai} onChange={(e) => form.setData('tanggal_selesai', e.target.value)} />
                        <Input label="Teknisi" value={form.data.teknisi} onChange={(e) => form.setData('teknisi', e.target.value)} />
                    </div>
                    <Textarea label="Keterangan" value={form.data.keterangan} onChange={(e) => form.setData('keterangan', e.target.value)} rows={3} required />
                </form>
            </Modal>

            <Modal open={showEdit} onClose={() => { setShowEdit(false); setActive(null); }} title="Edit Maintenance" footer={
                <>
                    <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => { setShowEdit(false); setActive(null); }}>Batal</Button>
                    <Button type="submit" form="form-edit-maintenance" size="sm" className="rounded-xl" isLoading={editForm.processing}>{editForm.processing ? 'Menyimpan...' : 'Simpan'}</Button>
                </>
            }>
                <form id="form-edit-maintenance" onSubmit={submitEdit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <DatePicker label="Tanggal Mulai" value={editForm.data.tanggal_mulai} onChange={(e) => editForm.setData('tanggal_mulai', e.target.value)} required />
                        <DatePicker label="Tanggal Selesai (opsional)" value={editForm.data.tanggal_selesai} onChange={(e) => editForm.setData('tanggal_selesai', e.target.value)} />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Teknisi" value={editForm.data.teknisi} onChange={(e) => editForm.setData('teknisi', e.target.value)} />
                        <Input label="Biaya (Rp)" type="number" min={0} step="0.01" value={editForm.data.biaya} onChange={(e) => editForm.setData('biaya', e.target.value)} />
                    </div>
                    <Textarea label="Keterangan" value={editForm.data.keterangan} onChange={(e) => editForm.setData('keterangan', e.target.value)} rows={3} required />
                </form>
            </Modal>
        </>
    );
}
