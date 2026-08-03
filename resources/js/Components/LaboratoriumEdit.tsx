import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar as CalendarIcon, FileText, FlaskConical, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { Calendar, CalendarEvent } from '@/Components/Calendar';
import { EmptyState } from '@/Components/EmptyState';
import { FileUpload } from '@/Components/FileUpload';
import { ImageWithFallback } from '@/Components/ImageWithFallback';
import { SkeletonDetail } from '@/Components/SkeletonDetail';
import { SortableGallery } from '@/Components/SortableGallery';
import { Input } from '@/Components/Input';
import { NumberStepper } from '@/Components/NumberStepper';
import { Select } from '@/Components/Select';
import { SelectSearchMulti } from '@/Components/SelectSearchMulti';
import { Tabs } from '@/Components/Tabs';
import { ConfirmDeleteButton } from '@/Components/ConfirmDeleteButton';
import { SortableList } from '@/Components/SortableList';
import { Textarea } from '@/Components/Textarea';
import { TimePicker } from '@/Components/TimePicker';
import { Timeline } from '@/Components/Timeline';
import { Tooltip } from '@/Components/Tooltip';
import { formatDate } from '../lib/date';
import { dokumenJenisMap, kondisiAlatMap, peranLabelMap, statusKerusakanMap, statusMaintenanceMap, statusPeminjamanMap } from '../lib/status';

interface LaboratoriumEditProps {
    base: string;
    canManagePengelola?: boolean;
}

interface UserOption { id: number; nama_lengkap: string; email: string; }

const hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const statusOptions = [
    { value: 'aktif', label: 'Aktif' },
    { value: 'nonaktif', label: 'Nonaktif' },
];

export default function LaboratoriumEdit({ base, canManagePengelola = false }: LaboratoriumEditProps) {
    const { item, pengelola, riwayat, events } = usePage().props as any;
    if (!item) return <SkeletonDetail />;

    const pengelolaAwal = canManagePengelola
        ? ((item.laboratorium_pengelolas ?? []) as { user_id: number; peran: string }[]).map((p) => ({ user_id: p.user_id, peran: p.peran || 'laboran' }))
        : [];

    const baseForm = {
        nama: item.nama ?? '', kode: item.kode ?? '', deskripsi: item.deskripsi ?? '',
        lokasi: item.lokasi ?? '', gedung: item.gedung ?? '', lantai: item.lantai ?? '', ruangan: item.ruangan ?? '',
        kapasitas: String(item.kapasitas ?? ''), jam_buka: item.jam_buka ?? '08:00', jam_tutup: item.jam_tutup ?? '17:00',
        hari_operasional: item.hari_operasional ?? [], email: item.email ?? '', telepon: item.telepon ?? '',
        status: item.status ?? 'aktif', foto_utama: null as File | null,
    };

    const pengelolaForm = canManagePengelola
        ? {
            pengelola: pengelolaAwal.map((p) => String(p.user_id)),
            pengelola_peran: pengelolaAwal.map((p) => p.peran),
        }
        : {};

    const { data, setData, post: postMain, processing, errors, transform } = useForm<any>({ ...baseForm, ...pengelolaForm });

    const [tab, setTab] = useState('profil');
    const [selectedKategori, setSelectedKategori] = useState('');
    const { data: galData, setData: setGalData, post: postGal, processing: galProcessing, errors: galErrors } = useForm({ file: null as File | null, judul: '' });
    const { data: dokData, setData: setDokData, post: postDok, processing: dokProcessing, errors: dokErrors } = useForm({ file: null as File | null, judul: '', jenis: 'sop' });
    const { data: ttData, setData: setTtData, post: postTt, processing: ttProcessing, errors: ttErrors, reset: resetTt } = useForm({ isi: '' });
    const [editingTt, setEditingTt] = useState<number | null>(null);

    useEffect(() => {
        if (tab !== 'tata-tertib') {
            setEditingTt(null);
            resetTt();
        }
    }, [tab, resetTt]);

    const toggleHari = (hari: string) => {
        setData('hari_operasional', data.hari_operasional.includes(hari) ? data.hari_operasional.filter((h: string) => h !== hari) : [...data.hari_operasional, hari]);
    };

    const setPengelola = (ids: string[]) => {
        if (!canManagePengelola) return;
        const peranMap: Record<string, string> = {};
        data.pengelola.forEach((id: string, i: number) => { peranMap[id] = data.pengelola_peran[i] ?? 'laboran'; });
        setData('pengelola', ids);
        setData('pengelola_peran', ids.map((id) => peranMap[id] ?? 'laboran'));
    };

    const setPeran = (id: number, peran: string) => {
        if (!canManagePengelola) return;
        const key = String(id);
        const index = data.pengelola.indexOf(key);
        if (index >= 0) {
            const next = [...data.pengelola_peran];
            next[index] = peran;
            setData('pengelola_peran', next);
        }
    };

    const pengelolaOptions = canManagePengelola
        ? (pengelola as UserOption[] ?? []).map((u) => ({ value: String(u.id), label: `${u.nama_lengkap} (${u.email})` }))
        : [];

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        transform((formData) => ({ ...formData, _method: 'PUT' }));
        postMain(`${base}/${item.id}`, { forceFormData: true });
    };

    const submitGaleri = (e: React.FormEvent) => {
        e.preventDefault();
        postGal(`${base}/${item.id}/galeri`, { forceFormData: galData.file !== null });
    };

    const submitDokumen = (e: React.FormEvent) => {
        e.preventDefault();
        postDok(`${base}/${item.id}/dokumen`, { forceFormData: dokData.file !== null });
    };

    const deleteGaleri = (id: number) => router.delete(`${base}/${item.id}/galeri/${id}`);
    const deleteDokumen = (id: number) => router.delete(`${base}/${item.id}/dokumen/${id}`);
    const tataTertibs = item.laboratorium_tata_tertibs ?? [];

    const submitTataTertib = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTt) {
            router.put(`${base}/${item.id}/tata-tertib/${editingTt}`, { isi: ttData.isi }, { preserveScroll: true });
        } else {
            postTt(`${base}/${item.id}/tata-tertib`, { preserveScroll: true });
        }
    };

    const startEditTt = (t: any) => {
        setEditingTt(t.id);
        setTtData('isi', t.isi);
    };

    const cancelEditTt = () => {
        setEditingTt(null);
        resetTt();
    };

    const deleteTataTertib = (id: number) => router.delete(`${base}/${item.id}/tata-tertib/${id}`);

    const tabs = [
        { key: 'profil', label: 'Profil' },
        { key: 'alat', label: 'Alat' },
        { key: 'galeri', label: 'Galeri' },
        { key: 'dokumen', label: 'Dokumen' },
        { key: 'tata-tertib', label: 'Tata Tertib' },
        { key: 'jadwal', label: 'Jadwal' },
        { key: 'riwayat', label: 'Riwayat' },
    ];

    const dokumenLain = ((item as any).laboratoriumDokumens ?? (item as any).laboratorium_dokumens ?? item.dokumen ?? []).filter((d: any) => d.jenis !== 'tata_tertib');

    const alatBase = base.replace('/laboratorium', '/alat');
    const alats = (item.alats ?? []) as { id: number; nama: string; kode: string; slug?: string; foto_utama: string | null; kondisi: string; stok_tersedia: number; kategori_alat?: { nama: string } | null }[];
    const kategoriOptions = Array.from(new Set(alats.map((a) => a.kategori_alat?.nama).filter(Boolean) as string[]));
    const filteredAlats = selectedKategori ? alats.filter((a) => a.kategori_alat?.nama === selectedKategori) : alats;
    return (
        <>
            <Head title="Edit Laboratorium" />
            <div className="mb-6">
                <Link href={base} className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400">
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Link>
                <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Edit Laboratorium</h1>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                <Tabs tabs={tabs} active={tab} onChange={setTab} />

                {tab === 'profil' && (
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Input label="Nama *" value={data.nama} onChange={(e) => setData('nama', e.target.value)} error={errors.nama} />
                            <Input label="Kode *" value={data.kode} onChange={(e) => setData('kode', e.target.value)} error={errors.kode} />
                            <Input label="Lokasi *" value={data.lokasi} onChange={(e) => setData('lokasi', e.target.value)} error={errors.lokasi} />
                            <Input label="Gedung" value={data.gedung} onChange={(e) => setData('gedung', e.target.value)} error={errors.gedung} />
                            <Input label="Lantai" value={data.lantai} onChange={(e) => setData('lantai', e.target.value)} error={errors.lantai} />
                            <Input label="Ruangan" value={data.ruangan} onChange={(e) => setData('ruangan', e.target.value)} error={errors.ruangan} />
                            <NumberStepper min={0} label="Kapasitas" value={Number(data.kapasitas) || 0} onChange={(v) => setData('kapasitas', String(v))} error={errors.kapasitas} />
                            <Input type="email" label="Email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} />
                            <Input label="Telepon" value={data.telepon} onChange={(e) => setData('telepon', e.target.value)} error={errors.telepon} />
                            <Select label="Status *" options={statusOptions} value={data.status} onChange={(e) => setData('status', e.target.value)} error={errors.status} />
                            <TimePicker label="Jam Buka" value={data.jam_buka} onChange={(e) => setData('jam_buka', e.target.value)} error={errors.jam_buka} />
                            <TimePicker label="Jam Tutup" value={data.jam_tutup} onChange={(e) => setData('jam_tutup', e.target.value)} error={errors.jam_tutup} />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Hari Operasional</label>
                            <div className="flex flex-wrap gap-2">
                                {hariList.map((h) => (
                                    <button
                                        key={h}
                                        type="button"
                                        onClick={() => toggleHari(h)}
                                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${data.hari_operasional.includes(h) ? 'bg-indigo-600 text-white' : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
                                    >{h}</button>
                                ))}
                            </div>
                            {errors.hari_operasional && <p className="mt-1 text-xs text-rose-500">{errors.hari_operasional}</p>}
                        </div>
                        <Textarea label="Deskripsi" value={data.deskripsi} onChange={(e) => setData('deskripsi', e.target.value)} rows={3} error={errors.deskripsi} />
                        <FileUpload label="Foto Utama" value={data.foto_utama ?? item.foto_utama} onChange={(file) => setData('foto_utama', file)} error={errors.foto_utama} />
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Pengelola</label>
                            {canManagePengelola ? (
                                <>
                                    <SelectSearchMulti
                                        options={pengelolaOptions}
                                        value={data.pengelola}
                                        onChange={setPengelola}
                                        placeholder="Cari pengelola..."
                                    />
                                    {data.pengelola.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {data.pengelola.map((id: string) => {
                                                const u = (pengelola as UserOption[] ?? []).find((x) => String(x.id) === id);
                                                if (!u) return null;
                                                const index = data.pengelola.indexOf(id);
                                                return (
                                                    <div key={id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-medium">{u.nama_lengkap}</p>
                                                            <p className="truncate text-xs text-slate-500">{u.email}</p>
                                                        </div>
                                                        <Select
                                                            options={[
                                                                { value: 'laboran', label: 'Laboran' },
                                                                { value: 'kepala_lab', label: 'Kepala Lab' },
                                                            ]}
                                                            value={data.pengelola_peran[index] ?? 'laboran'}
                                                            onChange={(e) => setPeran(u.id, e.target.value)}
                                                            className="w-40 shrink-0"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="mt-2 space-y-2">
                                    {(item.laboratorium_pengelolas ?? []).length > 0 ? (
                                        (item.laboratorium_pengelolas as any[]).map((p: any, idx: number) => (
                                            <div key={p.id ?? idx} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                                                <div>
                                                    <p className="text-sm font-medium">{p.user?.nama_lengkap ?? `Pengguna #${p.user_id}`}</p>
                                                    <p className="text-xs text-slate-500">{p.user?.email}</p>
                                                </div>
                                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">{peranLabelMap[p.peran] ?? p.peran.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-500">Belum ada pengelola.</p>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" isLoading={processing} leftIcon={<Save className="h-4 w-4" />}>Simpan Perubahan</Button>
                        </div>
                    </form>
                )}

                {tab === 'galeri' && (
                    <div className="space-y-4">
                        <form onSubmit={submitGaleri} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <FileUpload label="Tambah Foto Galeri" value={galData.file} onChange={(file) => setGalData('file', file)} error={galErrors.file} className="flex-1" />
                            <Input label="Judul" value={galData.judul} onChange={(e) => setGalData('judul', e.target.value)} error={galErrors.judul} />
                            <Button type="submit" isLoading={galProcessing} leftIcon={<Save className="h-4 w-4" />}>Tambah</Button>
                        </form>
                        {((item as any).laboratoriumGaleris ?? (item as any).laboratorium_galeris)?.length > 0 && (
                            <SortableGallery
                                items={(item as any).laboratoriumGaleris ?? (item as any).laboratorium_galeris}
                                onReorder={(urutan) => router.post(`${base}/${item.id}/galeri/reorder`, { urutan }, { preserveScroll: true })}
                                onDelete={deleteGaleri}
                            />
                        )}
                    </div>
                )}

                {tab === 'dokumen' && (
                    <div className="space-y-4">
                        <form onSubmit={submitDokumen} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <Input label="Judul *" value={dokData.judul} onChange={(e) => setDokData('judul', e.target.value)} error={dokErrors.judul} />
                            <Select label="Jenis" options={[{ value: 'sop', label: 'SOP' }, { value: 'tata_tertib', label: 'Tata Tertib' }, { value: 'lainnya', label: 'Lainnya' }]} value={dokData.jenis} onChange={(e) => setDokData('jenis', e.target.value)} error={dokErrors.jenis} />
                            <FileUpload label="File PDF" accept="application/pdf" value={dokData.file} onChange={(file) => setDokData('file', file)} error={dokErrors.file} />
                            <Button type="submit" isLoading={dokProcessing} leftIcon={<Save className="h-4 w-4" />}>Upload</Button>
                        </form>
                        <SortableList
                            items={dokumenLain}
                            onReorder={(urutan) => router.post(`${base}/${item.id}/dokumen/reorder`, { urutan }, { preserveScroll: true })}
                            renderItem={(d: any) => (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-300"><FileText className="h-5 w-5" /></div>
                                        <div>
                                            <p className="text-sm font-medium">{d.judul}</p>
                                            <p className="text-xs text-slate-500 capitalize">{dokumenJenisMap[d.jenis] ?? d.jenis}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Tooltip content="Lihat dokumen">
                                            <a href={`/storage/${d.file}`} target="_blank" rel="noreferrer" className="inline-flex rounded-lg p-2 text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"><FileText className="h-4 w-4" /></a>
                                        </Tooltip>
                                        <ConfirmDeleteButton onDelete={() => deleteDokumen(d.id)} description={`Hapus dokumen ${d.judul}?`} />
                                    </div>
                                </div>
                            )}
                        />
                    </div>
                )}

                {tab === 'tata-tertib' && (
                    <div className="space-y-4">
                        <form onSubmit={submitTataTertib} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <Textarea
                                label={editingTt ? 'Edit Tata Tertib' : 'Tata Tertib Baru'}
                                value={ttData.isi}
                                onChange={(e) => setTtData('isi', e.target.value)}
                                error={ttErrors.isi}
                                rows={3}
                                className="min-w-0 flex-1"
                            />
                            <div className="flex gap-2">
                                {editingTt && (
                                    <Button type="button" variant="secondary" onClick={cancelEditTt}>Batal</Button>
                                )}
                                <Button type="submit" isLoading={ttProcessing} leftIcon={<Save className="h-4 w-4" />}>{editingTt ? 'Simpan' : 'Tambah'}</Button>
                            </div>
                        </form>
                        {tataTertibs.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada tata tertib.</p>
                        ) : (
                            <SortableList
                                items={tataTertibs}
                                onReorder={(urutan) => router.post(`${base}/${item.id}/tata-tertib/reorder`, { urutan }, { preserveScroll: true })}
                                renderItem={(t: any) => (
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="min-w-0 flex-1 text-sm text-slate-900 dark:text-slate-100">{t.isi}</p>
                                        <div className="flex items-center gap-1">
                                            <button type="button" onClick={() => startEditTt(t)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                                            <ConfirmDeleteButton onDelete={() => deleteTataTertib(t.id)} description={`Hapus tata tertib?`} />
                                        </div>
                                    </div>
                                )}
                            />
                        )}
                    </div>
                )}

                {tab === 'alat' && (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <Link href={`${alatBase}/create`}>
                                <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Tambah Alat</Button>
                            </Link>
                            {kategoriOptions.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedKategori('')}
                                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${selectedKategori === '' ? 'bg-indigo-600 text-white' : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
                                    >Semua</button>
                                    {kategoriOptions.map((k) => (
                                        <button
                                            type="button"
                                            key={k}
                                            onClick={() => setSelectedKategori(k)}
                                            className={`rounded-full px-3 py-1 text-xs font-medium transition ${selectedKategori === k ? 'bg-indigo-600 text-white' : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
                                        >{k}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {filteredAlats.length === 0 ? (
                            <p className="text-center text-slate-500 dark:text-slate-400">Tidak ada alat tersedia.</p>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredAlats.map((alat) => (
                                    <Link
                                        key={alat.id}
                                        href={`${alatBase}/${alat.id}`}
                                        className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900"
                                    >
                                        <div className="mb-3 aspect-video overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                                            {alat.foto_utama ? (
                                                <ImageWithFallback src={`/storage/${alat.foto_utama}`} alt={alat.nama} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-slate-400">
                                                    <FlaskConical className="h-8 w-8" />
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{alat.nama}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{alat.kategori_alat?.nama ?? 'Umum'}</p>
                                        <div className="mt-3 flex items-center justify-between text-xs">
                                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                                                {alat.stok_tersedia} tersedia
                                            </span>
                                            <span className="text-slate-500 dark:text-slate-400">{kondisiAlatMap[alat.kondisi] ?? alat.kondisi}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {tab === 'jadwal' && (
                    <div className="space-y-4">
                        <Calendar
                            events={events ?? []}
                            height="500px"
                            showFilters={(events ?? []).length > 0}
                        />
                    </div>
                )}

                {tab === 'riwayat' && (
                    <div className="grid gap-6 lg:grid-cols-3">
                        <section>
                            <h4 className="mb-3 text-xs font-semibold uppercase text-slate-500">Peminjaman Terkini</h4>
                            {riwayat?.peminjaman?.length ? (
                                <Timeline items={riwayat.peminjaman.map((p: any) => ({
                                    id: p.id,
                                    icon: ['selesai', 'dibatalkan', 'ditolak'].includes(p.status) ? (p.status === 'selesai' ? 'check' : 'warning') : 'package',
                                    title: `${p.user?.nama_lengkap ?? 'Pengguna'} — ${p.kode ?? ''}`,
                                    description: p.details?.map((d: any) => `${d.alat?.nama ?? 'Alat'} x${d.jumlah}`).join(', '),
                                    status: statusPeminjamanMap[p.status]?.label ?? p.status,
                                    date: `${formatDate(p.tanggal_mulai)} s.d ${formatDate(p.tanggal_selesai)}`,
                                }))} />
                            ) : <EmptyState title="Belum ada peminjaman" description="Laboratorium ini belum memiliki riwayat peminjaman." />}
                        </section>
                        <section>
                            <h4 className="mb-3 text-xs font-semibold uppercase text-slate-500">Kerusakan</h4>
                            {riwayat?.kerusakan?.length ? (
                                <Timeline items={riwayat.kerusakan.map((k: any) => ({
                                    id: k.id,
                                    icon: 'warning',
                                    title: `${k.alat?.nama ?? 'Alat'} — ${kondisiAlatMap[k.kondisi] ?? k.kondisi}`,
                                    description: `${k.jumlah_unit ?? k.jumlah} unit • Pelapor: ${k.pelapor?.nama_lengkap ?? '-'}`,
                                    status: statusKerusakanMap[k.status]?.label ?? k.status,
                                    date: k.tanggal_dilaporkan ?? k.created_at,
                                }))} />
                            ) : <EmptyState title="Belum ada kerusakan" description="Tidak ada laporan kerusakan di laboratorium ini." />}
                        </section>
                        <section>
                            <h4 className="mb-3 text-xs font-semibold uppercase text-slate-500">Maintenance</h4>
                            {riwayat?.maintenance?.length ? (
                                <Timeline items={riwayat.maintenance.map((m: any) => ({
                                    id: m.id,
                                    icon: 'wrench',
                                    title: m.alat?.nama ?? 'Alat',
                                    description: `${statusMaintenanceMap[m.status]?.label ?? m.status} • ${m.laboran?.nama_lengkap ?? '-'}`,
                                    status: statusMaintenanceMap[m.status]?.label ?? m.status,
                                    date: `${formatDate(m.tanggal_mulai)}${m.tanggal_selesai ? ' s.d ' + formatDate(m.tanggal_selesai) : ''}`,
                                }))} />
                            ) : <EmptyState title="Belum ada maintenance" description="Belum ada riwayat pemeliharaan." />}
                        </section>
                    </div>
                )}
            </div>
        </>
    );
}
