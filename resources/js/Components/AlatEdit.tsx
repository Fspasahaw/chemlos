import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Download, FileText, Plus, QrCode, RefreshCw, Save, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/Components/Button';
import { Calendar } from '@/Components/Calendar';
import { ConfirmActionButton } from '@/Components/ConfirmActionButton';
import { ConfirmDeleteButton } from '@/Components/ConfirmDeleteButton';
import { EmptyState } from '@/Components/EmptyState';
import { FileUpload } from '@/Components/FileUpload';
import { ImageWithFallback } from '@/Components/ImageWithFallback';
import { Input } from '@/Components/Input';
import { NumberStepper } from '@/Components/NumberStepper';
import { Select } from '@/Components/Select';
import { SelectSearch } from '@/Components/SelectSearch';
import { SkeletonDetail } from '@/Components/SkeletonDetail';
import { SortableGallery } from '@/Components/SortableGallery';
import { SortableList } from '@/Components/SortableList';
import { Switch } from '@/Components/Switch';
import { Tabs } from '@/Components/Tabs';
import { Textarea } from '@/Components/Textarea';
import { Timeline } from '@/Components/Timeline';
import { Tooltip } from '@/Components/Tooltip';
import { formatDate } from '../lib/date';
import { dokumenJenisMap, kondisiAlatMap, statusKerusakanMap, statusMaintenanceMap, statusPeminjamanMap } from '../lib/status';

interface Option { id: number; nama: string; }
interface Video { id: number; judul: string; sumber: string; url: string; file?: string; durasi?: string; status: 'aktif' | 'nonaktif'; }

const kondisiOptions = [
    { value: 'baik', label: 'Baik' },
    { value: 'rusak_ringan', label: 'Rusak Ringan' },
    { value: 'rusak_berat', label: 'Rusak Berat' },
    { value: 'hilang', label: 'Hilang' },
];

const sumberOptions = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'url_eksternal', label: 'URL Eksternal' },
    { value: 'upload', label: 'Upload' },
];


interface AlatEditProps {
    base: string;
}

export default function AlatEdit({ base }: AlatEditProps) {
    const { item, labs, kategoris, riwayat, events, features } = usePage().props as any;
    const isEnabled = (key: string) => !!features?.[key];
    if (!item) return <SkeletonDetail />;

    const { data, setData, post: postMain, processing, errors, clearErrors, transform } = useForm({
        nama: item.nama ?? '', kode: item.kode ?? '', laboratorium_id: String(item.laboratorium_id ?? ''),
        kategori_id: String(item.kategori_id ?? ''), deskripsi: item.deskripsi ?? '', kondisi: item.kondisi ?? 'baik',
        stok_total: String(item.stok_total ?? ''), persyaratan_khusus: item.persyaratan_khusus ?? '',
        pelatihan_wajib: !!item.pelatihan_wajib,
        foto_utama: null as File | null,
        spesifikasi: (item.spesifikasi as Record<string, string>) ?? {},
    });

    const [tab, setTab] = useState('profil');
    const [specKey, setSpecKey] = useState('');
    const [specValue, setSpecValue] = useState('');

    const { data: galData, setData: setGalData, post: postGal, processing: galProcessing, errors: galErrors } = useForm({ file: null as File | null, judul: '' });
    const { data: dokData, setData: setDokData, post: postDok, processing: dokProcessing, errors: dokErrors } = useForm({ file: null as File | null, judul: '', jenis: 'manual' });
    const { data: vidData, setData: setVidData, post: postVid, processing: vidProcessing, errors: vidErrors } = useForm({
        judul: '', sumber: 'youtube', url: '', file: null as File | null, durasi: '', status: 'aktif' as 'aktif' | 'nonaktif',
    });

    const addSpec = () => {
        if (!specKey || !specValue) return;
        setData('spesifikasi', { ...data.spesifikasi, [specKey]: specValue });
        setSpecKey('');
        setSpecValue('');
        clearErrors('spesifikasi');
    };

    const removeSpec = (key: string) => {
        const next = { ...data.spesifikasi };
        delete next[key];
        setData('spesifikasi', next);
    };

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

    const submitVideo = (e: React.FormEvent) => {
        e.preventDefault();
        postVid(`${base}/${item.id}/video`, { forceFormData: vidData.sumber === 'upload' && vidData.file !== null });
    };

    const regenerateQr = () => router.post(`${base}/${item.id}/qr/regenerate`);
    const deleteGaleri = (id: number) => router.delete(`${base}/${item.id}/galeri/${id}`);
    const deleteDokumen = (id: number) => router.delete(`${base}/${item.id}/dokumen/${id}`);
    const deleteVideo = (id: number) => router.delete(`${base}/${item.id}/video/${id}`);

    const labOptions = [{ value: '', label: 'Pilih' }, ...labs.map((l: Option) => ({ value: String(l.id), label: l.nama }))];
    const kategoriOptions = [{ value: '', label: 'Pilih' }, ...kategoris.map((k: Option) => ({ value: String(k.id), label: k.nama }))];
    const dokJenisOptions = [
        { value: 'manual', label: 'Manual' },
        { value: 'sop', label: 'SOP' },
        { value: 'sertifikat_kalibrasi', label: 'Sertifikat Kalibrasi' },
        { value: 'lainnya', label: 'Lainnya' },
    ];

    const tabs = [
        { key: 'profil', label: 'Profil' },
        { key: 'spesifikasi', label: 'Spesifikasi' },
        { key: 'galeri', label: 'Galeri' },
        { key: 'dokumen', label: 'Dokumen' },
        { key: 'video', label: 'Video', feature: 'video_tutorial' },
        { key: 'qr', label: 'QR Code', feature: 'qr_code' },
        { key: 'riwayat', label: 'Riwayat' },
        { key: 'jadwal', label: 'Jadwal' },
    ].filter((t) => (t.feature ? isEnabled(t.feature) : true));
    return (
        <>
            <Head title="Edit Alat" />
            <div className="mb-6">
                <Link href={base} className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400">
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Link>
                <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Edit Alat</h1>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                <Tabs tabs={tabs} active={tab} onChange={setTab} />

                {tab === 'profil' && (
                    <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Stok Total</p>
                                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{item.stok_total ?? 0}</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Stok Tersedia</p>
                                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{item.stok_tersedia ?? 0}</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Stok Dipesan</p>
                                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{item.stok_reserved ?? 0}</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Stok Dipinjam</p>
                                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{item.stok_dipinjam ?? 0}</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Stok Maintenance</p>
                                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{item.stok_maintenance ?? 0}</p>
                            </div>
                        </div>
                        {item.foto_utama && (
                            <ImageWithFallback src={`/storage/${item.foto_utama}`} alt={item.nama} className="h-48 w-full rounded-2xl object-cover" />
                        )}
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                            <Input label="Nama *" value={data.nama} onChange={(e) => setData('nama', e.target.value)} error={errors.nama} />
                            <Input label="Kode *" value={data.kode} onChange={(e) => setData('kode', e.target.value)} error={errors.kode} />
                            <SelectSearch label="Laboratorium *" options={labOptions} value={data.laboratorium_id} onChange={(v) => setData('laboratorium_id', v)} error={errors.laboratorium_id} disabled={labs.length <= 1} />
                            <SelectSearch label="Kategori *" options={kategoriOptions} value={data.kategori_id} onChange={(v) => setData('kategori_id', v)} error={errors.kategori_id} />
                            <Select label="Kondisi *" options={kondisiOptions} value={data.kondisi} onChange={(e) => setData('kondisi', e.target.value)} error={errors.kondisi} />
                            <NumberStepper min={0} label="Stok Total *" value={Number(data.stok_total) || 0} onChange={(v) => setData('stok_total', String(v))} error={errors.stok_total} />
                        </div>
                        <Textarea label="Deskripsi" value={data.deskripsi} onChange={(e) => setData('deskripsi', e.target.value)} rows={3} error={errors.deskripsi} />
                        <FileUpload label="Foto Utama" value={data.foto_utama ?? item.foto_utama} onChange={(file) => setData('foto_utama', file)} error={errors.foto_utama} />
                        <Switch checked={data.pelatihan_wajib} onChange={(v) => setData('pelatihan_wajib', v)} label="Wajib Pelatihan" />
                        <Textarea label="Persyaratan Khusus" value={data.persyaratan_khusus} onChange={(e) => setData('persyaratan_khusus', e.target.value)} rows={2} error={errors.persyaratan_khusus} />
                        <div className="flex justify-end">
                            <Button type="submit" isLoading={processing} leftIcon={<Save className="h-4 w-4" />}>Simpan Perubahan</Button>
                        </div>
                    </form>
                </div>
                )}

                {tab === 'spesifikasi' && (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Input placeholder="Kunci" value={specKey} onChange={(e) => setSpecKey(e.target.value)} />
                            <Input placeholder="Nilai" value={specValue} onChange={(e) => setSpecValue(e.target.value)} />
                            <Button type="button" variant="outline" size="sm" onClick={addSpec} leftIcon={<Plus className="h-4 w-4" />}>Tambah</Button>
                        </div>
                        {errors.spesifikasi && <p className="text-xs text-rose-500">{errors.spesifikasi}</p>}
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(data.spesifikasi).map(([k, v]) => (
                                <span key={k} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300">
                                    {k}: {v}
                                    <button type="button" onClick={() => removeSpec(k)} className="ml-1 text-indigo-500 hover:text-rose-600"><X className="h-3 w-3" /></button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {tab === 'galeri' && (
                    <div className="space-y-4">
                        <form onSubmit={submitGaleri} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <FileUpload label="Tambah Foto" value={galData.file} onChange={(file) => setGalData('file', file)} error={galErrors.file} className="flex-1" />
                            <Input label="Judul" value={galData.judul} onChange={(e) => setGalData('judul', e.target.value)} error={galErrors.judul} />
                            <Button type="submit" isLoading={galProcessing} leftIcon={<Upload className="h-4 w-4" />}>Tambah</Button>
                        </form>
                        {((item as any).alatGaleris ?? (item as any).alat_galeris)?.length > 0 && (
                            <SortableGallery
                                items={(item as any).alatGaleris ?? (item as any).alat_galeris}
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
                            <Select label="Jenis" options={dokJenisOptions} value={dokData.jenis} onChange={(e) => setDokData('jenis', e.target.value)} error={dokErrors.jenis} />
                            <FileUpload label="File PDF" accept="application/pdf" value={dokData.file} onChange={(file) => setDokData('file', file)} error={dokErrors.file} />
                            <Button type="submit" isLoading={dokProcessing} leftIcon={<Upload className="h-4 w-4" />}>Upload</Button>
                        </form>
                        <SortableList
                            items={(item as any).alatDokumens ?? (item as any).alat_dokumens ?? item.dokumen ?? []}
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

                {tab === 'video' && (
                    <div className="space-y-4">
                        <form onSubmit={submitVideo} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <Input label="Judul *" value={vidData.judul} onChange={(e) => setVidData('judul', e.target.value)} error={vidErrors.judul} />
                            <Select label="Sumber" options={sumberOptions} value={vidData.sumber} onChange={(e) => setVidData('sumber', e.target.value)} error={vidErrors.sumber} />
                            {vidData.sumber !== 'upload' ? (
                                <Input label="URL *" value={vidData.url} onChange={(e) => setVidData('url', e.target.value)} error={vidErrors.url} />
                            ) : (
                                <FileUpload label="File Video" accept="video/*" value={vidData.file} onChange={(file) => setVidData('file', file)} error={vidErrors.file} />
                            )}
                            <NumberStepper min={0} label="Durasi (detik)" value={Number(vidData.durasi) || 0} onChange={(v) => setVidData('durasi', String(v))} error={vidErrors.durasi} hint="Contoh: 120" />
                            <Select label="Status" options={[{ value: 'aktif', label: 'Aktif' }, { value: 'nonaktif', label: 'Nonaktif' }]} value={vidData.status} onChange={(e) => setVidData('status', e.target.value as any)} error={vidErrors.status} />
                            <div className="flex items-end">
                                <Button type="submit" isLoading={vidProcessing} leftIcon={<Upload className="h-4 w-4" />}>Tambah Video</Button>
                            </div>
                        </form>
                        <SortableList
                            items={(item as any).videoTutorials ?? (item as any).video_tutorials ?? []}
                            onReorder={(urutan) => router.post(`${base}/${item.id}/video/reorder`, { urutan }, { preserveScroll: true })}
                            renderItem={(v: Video) => (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-900/20 dark:text-sky-300"><QrCode className="h-5 w-5" /></div>
                                        <div>
                                            <p className="text-sm font-medium">{v.judul}</p>
                                            <p className="text-xs text-slate-500 capitalize">{v.sumber} {v.durasi && `• ${v.durasi}`}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a href={v.url || `/storage/${v.file}`} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"><FileText className="h-4 w-4" /></a>
                                        <ConfirmDeleteButton onDelete={() => deleteVideo(v.id)} description={`Hapus video ${v.judul}?`} />
                                    </div>
                                </div>
                            )}
                        />
                    </div>
                )}

                {tab === 'qr' && (
                    <div className="space-y-4 text-center">
                        {item.qr_kode_path ? (
                            <ImageWithFallback src={`/storage/${item.qr_kode_path}`} alt="QR Code" className="mx-auto h-64 w-64 rounded-2xl border border-slate-200 object-contain p-4 dark:border-slate-700" />
                        ) : (
                            <p className="text-slate-500 dark:text-slate-400">QR code belum tersedia.</p>
                        )}
                        <div className="flex justify-center gap-3">
                            <a href={`${base}/${item.id}/qr`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                                <Download className="h-4 w-4" /> Unduh QR
                            </a>
                            <a href={`${base}/${item.id}/qr/label`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                                <Download className="h-4 w-4" /> Unduh Label
                            </a>
                            <ConfirmActionButton
                                icon={<RefreshCw className="h-4 w-4" />}
                                label="Regenerasi QR"
                                description="Regenerasi QR code? QR lama tidak bisa dipakai lagi."
                                confirmLabel="Regenerasi"
                                variant="warning"
                                onConfirm={regenerateQr}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                            />
                        </div>
                    </div>
                )}

                {tab === 'riwayat' && (
                    <div className="grid gap-6 lg:grid-cols-3">
                        <section>
                            <h4 className="mb-3 text-xs font-semibold uppercase text-slate-500">Peminjaman</h4>
                            {riwayat?.peminjaman?.length ? (
                                <Timeline items={riwayat.peminjaman.map((p: any) => ({
                                    id: p.id,
                                    icon: ['selesai', 'dibatalkan', 'ditolak'].includes(p.peminjaman?.status) ? (p.peminjaman?.status === 'selesai' ? 'check' : 'warning') : 'package',
                                    title: `${p.peminjaman?.user?.nama_lengkap ?? 'Pengguna'} — ${p.peminjaman?.kode ?? ''}`,
                                    description: `${p.jumlah} unit alat ini`,
                                    status: statusPeminjamanMap[p.peminjaman?.status]?.label ?? p.peminjaman?.status,
                                    date: `${formatDate(p.peminjaman?.tanggal_mulai)} s.d ${formatDate(p.peminjaman?.tanggal_selesai)}`,
                                }))} />
                            ) : <EmptyState title="Belum ada peminjaman" description="Alat ini belum pernah dipinjam." />}
                        </section>
                        <section>
                            <h4 className="mb-3 text-xs font-semibold uppercase text-slate-500">Kerusakan</h4>
                            {riwayat?.kerusakan?.length ? (
                                <Timeline items={riwayat.kerusakan.map((k: any) => ({
                                    id: k.id,
                                    icon: 'warning',
                                    title: `${kondisiAlatMap[k.kondisi] ?? k.kondisi} — ${k.jumlah_unit ?? k.jumlah} unit`,
                                    description: `Pelapor: ${k.pelapor?.nama_lengkap ?? '-'}`,
                                    status: statusKerusakanMap[k.status]?.label ?? k.status,
                                    date: k.tanggal_dilaporkan ?? k.created_at,
                                }))} />
                            ) : <EmptyState title="Belum ada kerusakan" description="Belum ada laporan kerusakan." />}
                        </section>
                        <section>
                            <h4 className="mb-3 text-xs font-semibold uppercase text-slate-500">Maintenance</h4>
                            {riwayat?.maintenance?.length ? (
                                <Timeline items={riwayat.maintenance.map((m: any) => ({
                                    id: m.id,
                                    icon: 'wrench',
                                    title: m.alat?.nama ?? 'Alat',
                                    description: `${statusMaintenanceMap[m.status]?.label ?? m.status} • Pelaksana: ${m.laboran?.nama_lengkap ?? '-'}`,
                                    status: statusMaintenanceMap[m.status]?.label ?? m.status,
                                    date: `${formatDate(m.tanggal_mulai)}${m.tanggal_selesai ? ' s.d ' + formatDate(m.tanggal_selesai) : ''}`,
                                }))} />
                            ) : <EmptyState title="Belum ada maintenance" description="Belum ada riwayat pemeliharaan." />}
                        </section>
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
            </div>
        </>
    );
}
