import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Edit3, Eye, Pencil, Plus, Trash2, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { ConfirmActionButton } from '../ConfirmActionButton';
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
import { kondisiAlatBadgeMap, statusKerusakanMap } from '../../lib/status';
import { formatDate } from '../../lib/date';

interface Alat { id: number; nama: string; kode: string; laboratorium_id?: number; laboratorium?: { nama: string }; stok_tersedia?: number; }
interface Lab { id: number; nama: string; }
interface Kerusakan {
    id: number;
    alat: Alat;
    pelapor?: { nama_lengkap: string };
    jumlah: number;
    kondisi: string;
    status: string;
    keterangan?: string;
    tanggal_dilaporkan: string;
    maintenance_id?: number | null;
    foto?: string | null;
}

interface Props {
    base: string;
    isAdmin?: boolean;
    canCreate?: boolean;
    canDelete?: boolean;
    canEdit?: boolean;
}

const kondisiOptions = Object.entries(kondisiAlatBadgeMap).map(([value, { label }]) => ({ value, label }));

const statusOptions = Object.entries(statusKerusakanMap).map(([value, { label }]) => ({ value, label }));

export default function KerusakanManager({ base, isAdmin = false, canCreate = true, canDelete = true, canEdit = true }: Props) {
    const { items, alats, labs, filters } = usePage().props as any;
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [active, setActive] = useState<Kerusakan | null>(null);
    const [mode, setMode] = useState<'status' | 'maintenance' | null>(null);

    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');
    const [kondisi, setKondisi] = useState(filters?.kondisi ?? '');
    const [lab, setLab] = useState(filters?.laboratorium_id ?? '');

    const createForm = useForm({ alat_id: '', jumlah: '1', kondisi: 'rusak_ringan', keterangan: '', foto: null as File | null });
    const editForm = useForm({ alat_id: '', jumlah: '1', kondisi: 'rusak_ringan', keterangan: '', foto: null as File | null });
    const statusForm = useForm({ status: 'dicek', keterangan: '' });
    const maintenanceForm = useForm({ alat_id: '', kerusakan_id: '', jumlah: '1', keterangan: '', tanggal_mulai: '', tanggal_selesai: '', teknisi: '' });

    useEffect(() => {
        if (active && mode === 'status') {
            statusForm.setData({ status: active.status === 'dilaporkan' ? 'dicek' : active.status, keterangan: active.keterangan ?? '' });
        }
        if (active && mode === 'maintenance') {
            maintenanceForm.setData({
                alat_id: String(active.alat.id),
                kerusakan_id: String(active.id),
                jumlah: String(active.jumlah),
                keterangan: `Perbaikan ${kondisiAlatBadgeMap[active.kondisi]?.label ?? active.kondisi} pada ${active.alat.nama}`,
                tanggal_mulai: new Date().toISOString().split('T')[0],
                tanggal_selesai: '',
                teknisi: '',
            });
        }
        if (active && showEdit) {
            editForm.setData({
                alat_id: String(active.alat.id),
                jumlah: String(active.jumlah),
                kondisi: active.kondisi,
                keterangan: active.keterangan ?? '',
                foto: null,
            });
        }
    }, [active, mode, showEdit]);

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append('alat_id', createForm.data.alat_id);
        data.append('jumlah', createForm.data.jumlah);
        data.append('kondisi', createForm.data.kondisi);
        data.append('keterangan', createForm.data.keterangan);
        if (createForm.data.foto) data.append('foto', createForm.data.foto);
        router.post(`${base}/kerusakan`, data, {
            forceFormData: true,
            onSuccess: () => { setShowCreate(false); createForm.reset(); },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!active) return;
        const data = new FormData();
        data.append('alat_id', editForm.data.alat_id);
        data.append('jumlah', editForm.data.jumlah);
        data.append('kondisi', editForm.data.kondisi);
        data.append('keterangan', editForm.data.keterangan);
        data.append('_method', 'PUT');
        if (editForm.data.foto) data.append('foto', editForm.data.foto);
        router.post(`${base}/kerusakan/${active.id}`, data, {
            forceFormData: true,
            onSuccess: () => { setShowEdit(false); setActive(null); editForm.reset(); },
        });
    };

    const submitStatus = (e: React.FormEvent) => {
        e.preventDefault();
        if (!active) return;
        statusForm.post(`${base}/kerusakan/${active.id}/status`, { preserveScroll: true, onSuccess: () => { setActive(null); setMode(null); } });
    };

    const submitMaintenance = (e: React.FormEvent) => {
        e.preventDefault();
        maintenanceForm.post(`${base}/maintenance`, { preserveScroll: true, onSuccess: () => { setActive(null); setMode(null); } });
    };

    const hapus = (id: number) => {
        router.delete(`${base}/kerusakan/${id}`);
    };

    const cari = () => router.get(`${base}/kerusakan`, { search, status, kondisi, laboratorium_id: lab }, { preserveState: true });
    const reset = () => { setSearch(''); setStatus(''); setKondisi(''); setLab(''); router.get(`${base}/kerusakan`, {}, { preserveState: true }); };

    return (
        <>
            <Head title="Kerusakan Alat" />
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold">Kerusakan Alat</h1>
                {canCreate && <Button onClick={() => setShowCreate(true)} leftIcon={<Plus className="h-4 w-4" />}>Laporkan Kerusakan</Button>}
            </div>

            <div className="mb-4 space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800/80 dark:bg-slate-900">
                <div className="flex flex-wrap items-end gap-3">
                    <SearchInput value={search} onChange={(v) => setSearch(v)} onSearch={cari} placeholder="Cari alat / pelapor / keterangan..." className="w-full max-w-md" />
                    {isAdmin && labs && (
                        <Select options={[{ value: '', label: 'Semua Laboratorium' }, ...labs.map((l: Lab) => ({ value: String(l.id), label: l.nama }))]} value={lab} onChange={(e) => { setLab(e.target.value); router.get(`${base}/kerusakan`, { search, status, kondisi, laboratorium_id: e.target.value }, { preserveState: true }); }} className="w-64" />
                    )}
                    <Button onClick={cari} size="md">Cari</Button>
                    {(search || status || kondisi || lab) && (
                        <Button onClick={reset} variant="outline" size="md">Reset</Button>
                    )}
                </div>
                <div className="flex flex-wrap gap-3">
                    <FilterChips options={[{ value: '', label: 'Semua Status' }, ...statusOptions]} value={status} onChange={(v) => { setStatus(v as string); router.get(`${base}/kerusakan`, { search, status: v as string, kondisi, laboratorium_id: lab }, { preserveState: true }); }} />
                    <FilterChips options={[{ value: '', label: 'Semua Kondisi' }, ...kondisiOptions]} value={kondisi} onChange={(v) => { setKondisi(v as string); router.get(`${base}/kerusakan`, { search, status, kondisi: v as string, laboratorium_id: lab }, { preserveState: true }); }} />
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold">Alat</th>
                            <th className="px-4 py-3 text-left font-semibold">Lab</th>
                            <th className="px-4 py-3 text-left font-semibold">Jumlah</th>
                            <th className="px-4 py-3 text-left font-semibold">Kondisi</th>
                            <th className="px-4 py-3 text-left font-semibold">Status</th>
                            <th className="px-4 py-3 text-left font-semibold">Tanggal</th>
                            <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.data.length === 0 ? (
                            <EmptyTable colSpan={7} message="Tidak ada data." />
                        ) : items.data.map((k: Kerusakan) => {
                            const st = statusKerusakanMap[k.status] ?? { label: k.status, variant: 'neutral' };
                            const ko = kondisiAlatBadgeMap[k.kondisi] ?? { label: k.kondisi, variant: 'neutral' };
                            return (
                                <tr key={k.id} className="border-t border-slate-200/80 dark:border-slate-800/80">
                                    <td className="px-4 py-3 font-medium">{k.alat.nama} <span className="text-xs text-slate-500">({k.alat.kode})</span></td>
                                    <td className="px-4 py-3 text-slate-500">{k.alat.laboratorium?.nama ?? '-'}</td>
                                    <td className="px-4 py-3">{k.jumlah}</td>
                                    <td className="px-4 py-3"><Badge variant={ko.variant}>{ko.label}</Badge></td>
                                    <td className="px-4 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                                    <td className="px-4 py-3 text-slate-500">{formatDate(k.tanggal_dilaporkan)}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Tooltip content="Lihat detail">
                                                <Link href={`${base}/kerusakan/${k.id}`} title="Lihat detail" className="inline-flex rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Lihat detail"><Eye className="h-4 w-4" /></Link>
                                            </Tooltip>
                                            {canEdit && (k.status === 'dilaporkan' || k.status === 'dicek') && !k.maintenance_id && (
                                                <Tooltip content="Edit">
                                                    <button onClick={() => { setActive(k); setShowEdit(true); }} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                                                </Tooltip>
                                            )}
                                            {k.status === 'dilaporkan' && !k.maintenance_id && (
                                                <Tooltip content="Daftarkan ke maintenance">
                                                    <button onClick={() => { setActive(k); setMode('maintenance'); }} className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30" aria-label="Daftarkan ke maintenance"><Wrench className="h-4 w-4" /></button>
                                                </Tooltip>
                                            )}
                                            {(k.status === 'dilaporkan' || k.status === 'dicek') && !k.maintenance_id && (
                                                <Tooltip content="Ubah status">
                                                    <button onClick={() => { setActive(k); setMode('status'); }} className="rounded-lg p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30" aria-label="Ubah status"><Edit3 className="h-4 w-4" /></button>
                                                </Tooltip>
                                            )}
                                            {canDelete && !k.maintenance_id && (
                                                <ConfirmActionButton
                                                    icon={<Trash2 className="h-4 w-4" />}
                                                    label="Hapus"
                                                    description="Yakin ingin menghapus laporan kerusakan ini?"
                                                    variant="danger"
                                                    className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                                                    onConfirm={() => hapus(k.id)}
                                                />
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

            <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Laporkan Kerusakan" footer={
                <>
                    <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => setShowCreate(false)}>Batal</Button>
                    <Button type="submit" form="form-kerusakan" size="sm" className="rounded-xl" isLoading={createForm.processing}>{createForm.processing ? 'Menyimpan...' : 'Simpan'}</Button>
                </>
            }>
                <form id="form-kerusakan" onSubmit={submitCreate} className="space-y-4">
                    <Select label="Alat" options={alats.map((a: Alat) => ({ value: String(a.id), label: `${a.nama} (${a.kode})` }))} value={createForm.data.alat_id} onChange={(e) => createForm.setData('alat_id', e.target.value)} required />
                    <div className="grid gap-4 md:grid-cols-2">
                        <NumberStepper label="Jumlah" min={1} value={Number(createForm.data.jumlah) || 1} onChange={(v) => createForm.setData('jumlah', v)} required />
                        <Select label="Kondisi" options={kondisiOptions} value={createForm.data.kondisi} onChange={(e) => createForm.setData('kondisi', e.target.value)} />
                    </div>
                    <Textarea label="Keterangan" value={createForm.data.keterangan} onChange={(e) => createForm.setData('keterangan', e.target.value)} rows={3} />
                    <Input label="Foto" type="file" accept="image/*" onChange={(e) => createForm.setData('foto', e.target.files?.[0] ?? null)} />
                </form>
            </Modal>

            <Modal open={showEdit} onClose={() => { setShowEdit(false); setActive(null); }} title="Edit Kerusakan" footer={
                <>
                    <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => { setShowEdit(false); setActive(null); }}>Batal</Button>
                    <Button type="submit" form="form-edit-kerusakan" size="sm" className="rounded-xl" isLoading={editForm.processing}>{editForm.processing ? 'Menyimpan...' : 'Simpan'}</Button>
                </>
            }>
                <form id="form-edit-kerusakan" onSubmit={submitEdit} className="space-y-4">
                    <Select label="Alat" options={alats.map((a: Alat) => ({ value: String(a.id), label: `${a.nama} (${a.kode})` }))} value={editForm.data.alat_id} onChange={(e) => editForm.setData('alat_id', e.target.value)} required />
                    <div className="grid gap-4 md:grid-cols-2">
                        <NumberStepper label="Jumlah" min={1} value={Number(editForm.data.jumlah) || 1} onChange={(v) => editForm.setData('jumlah', v)} required />
                        <Select label="Kondisi" options={kondisiOptions} value={editForm.data.kondisi} onChange={(e) => editForm.setData('kondisi', e.target.value)} />
                    </div>
                    <Textarea label="Keterangan" value={editForm.data.keterangan} onChange={(e) => editForm.setData('keterangan', e.target.value)} rows={3} />
                    <Input label="Foto (kosongkan jika tidak ingin mengubah)" type="file" accept="image/*" onChange={(e) => editForm.setData('foto', e.target.files?.[0] ?? null)} />
                    {active?.foto && <p className="text-xs text-slate-500">Foto saat ini: {active.foto}</p>}
                </form>
            </Modal>

            <Modal open={!!active && mode === 'status'} onClose={() => { setActive(null); setMode(null); }} title="Ubah Status Kerusakan" footer={
                <>
                    <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => { setActive(null); setMode(null); }}>Batal</Button>
                    <Button type="submit" form="form-status" variant="warning" size="sm" className="rounded-xl" isLoading={statusForm.processing}>{statusForm.processing ? 'Menyimpan...' : 'Simpan'}</Button>
                </>
            }>
                <form id="form-status" onSubmit={submitStatus} className="space-y-4">
                    <Select label="Status" options={[
                        { value: 'dicek', label: 'Dicek' },
                        { value: 'diabaikan', label: 'Diabaikan' },
                        { value: 'selesai', label: 'Selesai' },
                    ]} value={statusForm.data.status} onChange={(e) => statusForm.setData('status', e.target.value)} />
                    <Textarea label="Keterangan / Catatan" value={statusForm.data.keterangan} onChange={(e) => statusForm.setData('keterangan', e.target.value)} rows={3} />
                </form>
            </Modal>

            <Modal open={!!active && mode === 'maintenance'} onClose={() => { setActive(null); setMode(null); }} title="Daftarkan ke Maintenance" footer={
                <>
                    <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => { setActive(null); setMode(null); }}>Batal</Button>
                    <Button type="submit" form="form-maintenance" size="sm" className="rounded-xl" isLoading={maintenanceForm.processing}>{maintenanceForm.processing ? 'Menyimpan...' : 'Simpan'}</Button>
                </>
            }>
                <form id="form-maintenance" onSubmit={submitMaintenance} className="space-y-4">
                    <Input label="Alat" value={`${active?.alat.nama} (${active?.alat.kode})`} disabled />
                    <input type="hidden" name="alat_id" value={maintenanceForm.data.alat_id} />
                    <input type="hidden" name="kerusakan_id" value={maintenanceForm.data.kerusakan_id} />
                    <NumberStepper label="Jumlah" min={1} value={Number(maintenanceForm.data.jumlah) || 1} onChange={(v) => maintenanceForm.setData('jumlah', v)} required />
                    <DatePicker label="Tanggal Mulai" value={maintenanceForm.data.tanggal_mulai} onChange={(e) => maintenanceForm.setData('tanggal_mulai', e.target.value)} required />
                    <DatePicker label="Tanggal Selesai (opsional)" value={maintenanceForm.data.tanggal_selesai} onChange={(e) => maintenanceForm.setData('tanggal_selesai', e.target.value)} />
                    <Input label="Teknisi" value={maintenanceForm.data.teknisi} onChange={(e) => maintenanceForm.setData('teknisi', e.target.value)} />
                    <Textarea label="Keterangan" value={maintenanceForm.data.keterangan} onChange={(e) => maintenanceForm.setData('keterangan', e.target.value)} rows={3} required />
                </form>
            </Modal>
        </>
    );
}
