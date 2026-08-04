import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Download, FileText, FlaskConical, Image, Info, MapPin, Pin, Play, QrCode, Wrench, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../../Components/Badge';
import { Calendar, CalendarEvent } from '../../Components/Calendar';
import { CardWithBackground } from '../../Components/CardWithBackground';
import { ImageWithFallback } from '../../Components/ImageWithFallback';
import { Lightbox } from '../../Components/Lightbox';
import { DocumentPreview } from '../../Components/DocumentPreview';
import Modal from '../../Components/Modal';
import { Tabs } from '../../Components/Tabs';
import { formatDate } from '../../lib/date';
import { alatStatusMap, dokumenJenisMap, kondisiAlatMap, statusKerusakanMap, statusMaintenanceMap, statusPeminjamanMap } from '../../lib/status';

interface GaleriItem { id: number; file: string; judul: string; }
interface DokumenItem { id: number; file: string; judul: string; jenis: string; }
interface VideoItem { id: number; judul: string; url: string | null; thumbnail: string | null; durasi: number | null; sumber: string; }
interface Lab { id: number; nama: string; slug: string; }
interface Kategori { id: number; nama: string; slug: string; }
interface HistoryItem { type: 'peminjaman' | 'kerusakan' | 'maintenance'; date: string; end?: string | null; title: string; status: string; description?: string; }

interface Alat {
    id: number;
    nama: string;
    kode: string;
    slug: string;
    deskripsi: string;
    spesifikasi: Record<string, string> | null;
    kondisi: string;
    status: string;
    stok_total: number;
    stok_tersedia: number;
    stok_reserved: number;
    stok_dipinjam: number;
    stok_maintenance: number;
    persyaratan_khusus: string | null;
    pelatihan_wajib: boolean;
    foto_utama: string | null;
    qr_kode_path: string | null;
    laboratorium: Lab;
    kategori_alat: Kategori | null;
    galeri: GaleriItem[];
    dokumen: DokumenItem[];
    video_tutorials: VideoItem[];
}

interface RelatedAlat { id: number; nama: string; slug: string; kode: string; stok_tersedia: number; foto_utama: string | null; laboratorium: { nama: string; slug: string }; }
interface FilterOption { value: string; label: string; }

export default function AlatDetail({ alat, relatedAlats, events, history, statusOptions }: { alat: Alat; relatedAlats: RelatedAlat[]; events: CalendarEvent[]; history: HistoryItem[]; statusOptions: FilterOption[] }) {
    const { auth, features } = usePage().props as any;
    const isEnabled = (key: string) => !!features?.[key];
    const [activeTab, setActiveTab] = useState<'info' | 'spesifikasi' | 'galeri' | 'dokumen' | 'video' | 'qr' | 'riwayat' | 'jadwal'>('info');
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<DokumenItem | null>(null);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [showQr, setShowQr] = useState(false);

    const allGallery = [
        ...(alat.foto_utama ? [{ src: `/storage/${alat.foto_utama}`, alt: alat.nama }] : []),
        ...alat.galeri.map((g) => ({ src: `/storage/${g.file}`, alt: g.judul })),
    ];

    const tabs = [
        { key: 'info', label: 'Info', icon: Info },
        { key: 'spesifikasi', label: 'Spesifikasi', icon: Wrench },
        { key: 'galeri', label: 'Galeri', icon: Image },
        { key: 'dokumen', label: 'Dokumen', icon: FileText },
        { key: 'video', label: 'Video Tutorial', icon: Play, feature: 'video_tutorial' },
        { key: 'qr', label: 'QR Code', icon: QrCode, feature: 'qr_code' },
        { key: 'riwayat', label: 'Riwayat', icon: CalendarIcon },
        { key: 'jadwal', label: 'Jadwal', icon: CalendarIcon },
    ].filter((t) => (t.feature ? isEnabled(t.feature) : true));

    const statusVariant = (status: string) => {
        switch (status) {
            case 'tersedia': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300';
            case 'dipinjam': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300';
            case 'maintenance': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        }
    };


    return (
        <>
            <Head title={alat.nama} />

            <section className="relative h-[320px] overflow-hidden md:h-[420px]">
                {alat.foto_utama ? (
                    <button type="button" onClick={() => setLightboxIndex(0)} className="h-full w-full">
                        <ImageWithFallback src={`/storage/${alat.foto_utama}`} alt={alat.nama} className="h-full w-full object-cover" />
                    </button>
                ) : (
                    <div className="h-full w-full bg-linear-to-br from-violet-600 to-fuchsia-600" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/40 to-slate-900/10" />
                <div className="absolute inset-0 flex flex-col justify-end">
                    <div className="mx-auto w-full max-w-7xl px-4 pb-8 md:pb-12">
                        <div className="mb-3 flex items-center gap-2 text-sm text-white/80">
                            <Link href="/" className="hover:text-white hover:underline">Beranda</Link>
                            <span>/</span>
                            <Link href="/laboratorium" className="hover:text-white hover:underline">Laboratorium</Link>
                            <span>/</span>
                            <Link href={`/laboratorium/${alat.laboratorium.slug}`} className="hover:text-white hover:underline">{alat.laboratorium.nama}</Link>
                            <span>/</span>
                            <span className="text-white">{alat.nama}</span>
                        </div>
                        <p className="text-sm font-medium text-white/80">{alat.kode}</p>
                        <h1 className="text-3xl font-bold text-white md:text-5xl">{alat.nama}</h1>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusVariant(alat.status)}`}>{alatStatusMap[alat.status]?.label ?? alat.status.replace('_', ' ')}</span>
                            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur">Kondisi: {kondisiAlatMap[alat.kondisi] ?? alat.kondisi.replace('_', ' ')}</span>
                            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur">Stok: {alat.stok_tersedia}/{alat.stok_total}</span>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-3">
                            {auth?.user?.active_role === 'mahasiswa' && (
                                <Link href={`/dashboard/mahasiswa/peminjaman/baru?laboratorium_id=${alat.laboratorium.id}&alat_id=${alat.id}`} className="flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-violet-600 transition-transform hover:scale-105">
                                    <Pin className="h-4 w-4" /> Ajukan Peminjaman
                                </Link>
                            )}
                            {isEnabled('qr_code') && alat.qr_kode_path && (
                                <button onClick={() => setShowQr(true)} className="h-20 w-20 overflow-hidden rounded-2xl border-2 border-white/30 bg-white p-2 shadow-lg backdrop-blur transition hover:scale-105" aria-label="Lihat QR Code">
                                    <ImageWithFallback
                                        src={`/storage/${alat.qr_kode_path}`}
                                        alt={`QR Code ${alat.nama}`}
                                        className="h-full w-full object-contain"
                                    />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <div className="sticky top-[61px] z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/95">
                <div className="mx-auto max-w-7xl px-4">
                    <Tabs tabs={tabs} active={activeTab} onChange={(key) => setActiveTab(key as any)} className="mb-0 border-0" />
                </div>
            </div>

            <section className="mx-auto max-w-7xl px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        {activeTab === 'info' && (
                            <div className="space-y-6">
                                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                                    <h2 className="text-xl font-semibold">Deskripsi</h2>
                                    <p className="mt-3 text-slate-600 dark:text-slate-300">{alat.deskripsi}</p>
                                    {alat.persyaratan_khusus && (
                                        <div className="mt-6 rounded-xl bg-amber-50 p-4 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                                            <p className="text-sm font-medium">Persyaratan Khusus</p>
                                            <p className="mt-1 text-sm">{alat.persyaratan_khusus}</p>
                                        </div>
                                    )}
                                    {alat.pelatihan_wajib && (
                                        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
                                            Wajib Pelatihan
                                        </div>
                                    )}
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                                    <Stat label="Stok Total" value={alat.stok_total} variant="emerald" />
                                    <Stat label="Tersedia" value={alat.stok_tersedia} variant="indigo" />
                                    <Stat label="Dipesan" value={alat.stok_reserved} variant="cyan" />
                                    <Stat label="Dipinjam" value={alat.stok_dipinjam} variant="rose" />
                                    <Stat label="Maintenance" value={alat.stok_maintenance} variant="amber" />
                                </div>
                            </div>
                        )}

                        {activeTab === 'spesifikasi' && (
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                                {alat.spesifikasi && Object.keys(alat.spesifikasi).length > 0 ? (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {Object.entries(alat.spesifikasi).map(([key, value]) => (
                                            <div key={key} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{key}</p>
                                                <p className="font-medium text-slate-900 dark:text-slate-100">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 dark:text-slate-400">Tidak ada spesifikasi.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'galeri' && (
                            <div>
                                {allGallery.length === 0 ? (
                                    <p className="text-center text-slate-500 dark:text-slate-400">Tidak ada galeri.</p>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {allGallery.map((img, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setLightboxIndex(idx)}
                                                className="overflow-hidden rounded-2xl border border-slate-200/80 text-left dark:border-slate-800/80"
                                            >
                                                <ImageWithFallback src={img.src} alt={img.alt} className="h-56 w-full object-cover transition hover:scale-105" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'dokumen' && (
                            <div className="space-y-3">
                                {alat.dokumen.length === 0 ? (
                                    <p className="text-center text-slate-500 dark:text-slate-400">Tidak ada dokumen.</p>
                                ) : (
                                    alat.dokumen.map((d) => (
                                        <button
                                            key={d.id}
                                            type="button"
                                            onClick={() => setSelectedDoc(d)}
                                            className="flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 text-left transition hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-900 dark:hover:bg-slate-800"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-violet-600" />
                                                <span className="font-medium">{d.judul}</span>
                                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs uppercase text-slate-600 dark:bg-slate-800">{dokumenJenisMap[d.jenis] ?? d.jenis}</span>
                                            </div>
                                            <span className="text-sm text-violet-600">Lihat</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'video' && (
                            <div>
                                {alat.video_tutorials.length === 0 ? (
                                    <p className="text-center text-slate-500 dark:text-slate-400">Tidak ada video tutorial.</p>
                                ) : (
                                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {alat.video_tutorials.map((v) => (
                                            <button key={v.id} onClick={() => setSelectedVideo(v)} className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left shadow-sm transition hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900">
                                                <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                                                    {v.thumbnail ? <ImageWithFallback src={`/storage/${v.thumbnail}`} alt={v.judul} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400"><Play className="h-8 w-8" /></div>}
                                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 transition group-hover:bg-slate-900/25">
                                                        <Play className="h-10 w-10 text-white opacity-90 transition group-hover:scale-110 group-hover:opacity-100" />
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-semibold">{v.judul}</h3>
                                                    {v.durasi && <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><Clock className="h-3 w-3" /> {v.durasi} detik</p>}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'qr' && (
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center dark:border-slate-800/80 dark:bg-slate-900">
                                {alat.qr_kode_path ? (
                                    <>
                                        <ImageWithFallback
                                            src={`/storage/${alat.qr_kode_path}`}
                                            alt={`QR Code ${alat.nama}`}
                                            className="mx-auto h-48 w-48 rounded-2xl border border-slate-200/80 object-contain p-4 dark:border-slate-800/80"
                                        />
                                        <a
                                            href={`/storage/${alat.qr_kode_path}`}
                                            download
                                            className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                        >
                                            <Download className="h-4 w-4" /> Unduh QR Code
                                        </a>
                                    </>
                                ) : (
                                    <p className="text-slate-500 dark:text-slate-400">QR Code belum tersedia.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'riwayat' && (
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                                <h3 className="mb-6 font-semibold">Riwayat Peminjaman, Kerusakan, dan Maintenance</h3>
                                {history.length === 0 ? (
                                    <p className="text-slate-500 dark:text-slate-400">Belum ada riwayat.</p>
                                ) : (
                                    <div className="relative pl-12">
                                        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
                                        {history.map((h, idx) => {
                                            const statusLabel =
                                                h.type === 'peminjaman' ? statusPeminjamanMap[h.status]?.label ?? h.status :
                                                h.type === 'kerusakan' ? statusKerusakanMap[h.status]?.label ?? h.status :
                                                h.type === 'maintenance' ? statusMaintenanceMap[h.status]?.label ?? h.status :
                                                h.status;
                                            const Icon = h.type === 'peminjaman' ? CalendarIcon : h.type === 'kerusakan' ? Wrench : Wrench;
                                            const iconClass =
                                                h.type === 'peminjaman' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300' :
                                                h.type === 'kerusakan' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-300' :
                                                'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300';
                                            return (
                                                <div key={idx} className="relative mb-8 last:mb-0">
                                                    <span className={`absolute -left-12 top-0 flex h-10 w-10 items-center justify-center rounded-full ${iconClass}`}>
                                                        <Icon className="h-5 w-5" />
                                                    </span>
                                                    <p className="text-sm font-semibold">{h.title}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(h.date)}{h.end ? ` - ${formatDate(h.end)}` : ''} &bull; {statusLabel}</p>
                                                    {h.description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{h.description}</p>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'jadwal' && (
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                                <h3 className="mb-4 font-semibold">Jadwal Peminjaman Alat</h3>
                                <Calendar events={events} statusOptions={statusOptions} height="500px" showFilters={events.length > 0} />
                            </div>
                        )}
                    </div>

                    <aside className="space-y-6">
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                            <h3 className="mb-4 font-semibold">Informasi Alat</h3>
                            <ul className="space-y-4 text-sm">
                                <li className="flex items-start gap-3"><MapPin className="h-4 w-4 text-violet-600" /> <Link href={`/laboratorium/${alat.laboratorium.slug}`} className="text-violet-600 hover:underline">{alat.laboratorium.nama}</Link></li>
                                <li className="flex items-start gap-3"><FlaskConical className="h-4 w-4 text-violet-600" /> <span className="text-slate-600 dark:text-slate-300">{alat.kategori_alat?.nama ?? 'Umum'}</span></li>
                                <li className="flex items-start gap-3"><Clock className="h-4 w-4 text-violet-600" /> <span className="text-slate-600 dark:text-slate-300">{kondisiAlatMap[alat.kondisi] ?? alat.kondisi.replace('_', ' ')}</span></li>
                            </ul>
                            {auth?.user?.active_role === 'mahasiswa' && (
                                <Link href={`/dashboard/mahasiswa/peminjaman/baru?laboratorium_id=${alat.laboratorium.id}&alat_id=${alat.id}`} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
                                    <Pin className="h-4 w-4" /> Pinjam Alat Ini
                                </Link>
                            )}
                            {isEnabled('qr_code') && alat.qr_kode_path && (
                                <a href={`/storage/${alat.qr_kode_path}`} download className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                                    <QrCode className="h-4 w-4" /> Unduh QR Code
                                </a>
                            )}
                            <Link href="/alat" className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                                <ArrowLeft className="h-4 w-4" /> Kembali
                            </Link>
                        </div>
                    </aside>
                </div>
            </section>

            {relatedAlats.length > 0 && (
                <section className="mx-auto max-w-7xl px-4 py-8">
                    <h2 className="mb-6 text-xl font-bold">Alat Lain di Laboratorium Ini</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {relatedAlats.map((a) => (
                            <CardWithBackground
                                key={a.id}
                                href={`/alat/${a.slug}`}
                                image={a.foto_utama ? `/storage/${a.foto_utama}` : null}
                                alt={a.nama}
                                title={a.nama}
                                subtitle={a.laboratorium.nama}
                                badge={<Badge variant={alatStatusMap[a.status]?.variant ?? 'neutral'}>{alatStatusMap[a.status]?.label ?? a.status}</Badge>}
                                footer={<span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">{a.stok_tersedia} tersedia</span>}
                            />
                        ))}
                    </div>
                </section>
            )}

            <Lightbox
                images={allGallery}
                initialIndex={lightboxIndex ?? 0}
                open={lightboxIndex !== null}
                onClose={() => setLightboxIndex(null)}
            />

            <Modal open={!!selectedVideo} onClose={() => setSelectedVideo(null)} title={selectedVideo?.judul ?? 'Video'} size="xl">
                <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    {selectedVideo?.url ? (
                        <iframe src={selectedVideo.url} title={selectedVideo.judul} className="h-full w-full" allowFullScreen />
                    ) : (
                        <div className="flex h-full items-center justify-center text-slate-400"><Play className="h-16 w-16" /></div>
                    )}
                </div>
            </Modal>

            {selectedDoc && (
                <DocumentPreview
                    file={selectedDoc.file}
                    title={selectedDoc.judul}
                    open={!!selectedDoc}
                    onClose={() => setSelectedDoc(null)}
                />
            )}

            <Modal open={showQr} onClose={() => setShowQr(false)} title={`QR Code ${alat.nama}`} size="sm">
                {alat.qr_kode_path ? (
                    <ImageWithFallback
                        src={`/storage/${alat.qr_kode_path}`}
                        alt={`QR Code ${alat.nama}`}
                        className="mx-auto h-48 w-48 rounded-2xl border border-slate-200/80 object-contain p-4 dark:border-slate-800/80"
                    />
                ) : (
                    <p className="text-sm text-slate-500">QR Code tidak tersedia.</p>
                )}
            </Modal>
        </>
    );
}

function Stat({ label, value, variant = 'slate' }: { label: string; value: number; variant?: 'slate' | 'emerald' | 'indigo' | 'cyan' | 'rose' | 'amber' }) {
    const colors: Record<string, string> = {
        slate: 'bg-slate-50 text-slate-900 dark:bg-slate-900/50 dark:text-slate-100',
        emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
        indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300',
        cyan: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300',
        rose: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300',
        amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
    };
    return (
        <div className={`rounded-xl p-4 ${colors[variant]}`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs opacity-80">{label}</p>
        </div>
    );
}
