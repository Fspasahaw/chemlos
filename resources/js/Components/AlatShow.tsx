import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    Clock,
    Download,
    FileText,
    FlaskConical,
    Image,
    Info,
    MapPin,
    Play,
    QrCode,
    Wrench,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from './Badge';
import { Button } from './Button';
import { Calendar, CalendarEvent } from './Calendar';
import { Card } from './Card';
import { DocumentPreview } from './DocumentPreview';
import { ImageWithFallback } from './ImageWithFallback';
import { Lightbox } from './Lightbox';
import Modal from './Modal';
import { formatDate } from '../lib/date';
import { alatStatusMap, dokumenJenisMap, kondisiAlatMap, statusKerusakanMap, statusMaintenanceMap, statusPeminjamanMap } from '../lib/status';

interface GaleriItem {
    id: number;
    file: string;
    judul: string;
}

interface DokumenItem {
    id: number;
    file: string;
    judul: string;
    jenis: string;
}

interface VideoItem {
    id: number;
    judul: string;
    url: string | null;
    thumbnail: string | null;
    durasi: number | null;
    sumber: string;
}

interface Lab {
    id: number;
    nama: string;
    slug?: string;
}

interface Kategori {
    id: number;
    nama: string;
}

interface HistoryItem {
    type: 'peminjaman' | 'kerusakan' | 'maintenance';
    date: string;
    end?: string | null;
    title: string;
    status: string;
    description?: string;
}

interface Alat {
    id: number;
    nama: string;
    kode: string;
    slug?: string;
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
    galeri?: GaleriItem[];
    alat_galeris?: GaleriItem[];
    dokumen?: DokumenItem[];
    alat_dokumens?: DokumenItem[];
    video_tutorials?: VideoItem[];
}

interface AlatShowProps {
    base: string;
    editHref?: string;
}

export default function AlatShow({ base, editHref }: AlatShowProps) {
    const { item, events, riwayat, features } = usePage().props as any;
    const isEnabled = (key: string) => !!features?.[key];
    const [activeTab, setActiveTab] = useState<'info' | 'spesifikasi' | 'galeri' | 'dokumen' | 'video' | 'qr' | 'riwayat' | 'jadwal'>('info');
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<DokumenItem | null>(null);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const alat = item;
    const galeri = (alat as any).alatGaleris ?? (alat as any).alat_galeris ?? alat.galeri ?? [];
    const allGallery = [
        ...(alat.foto_utama ? [{ src: `/storage/${alat.foto_utama}`, alt: alat.nama }] : []),
        ...galeri.map((g: any) => ({ src: `/storage/${g.file}`, alt: g.judul })),
    ];
    const dokumen = (alat as any).alatDokumens ?? (alat as any).alat_dokumens ?? alat.dokumen ?? [];
    const videos = (alat as any).videoTutorials ?? (alat as any).video_tutorials ?? [];

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
            case 'tersedia':
                return 'success';
            case 'dipinjam':
                return 'warning';
            case 'maintenance':
                return 'neutral';
            case 'tidak_tersedia':
                return 'neutral';
            default:
                return 'neutral';
        }
    };

    const historyIcon = (type: string) => {
        const config: Record<string, { icon: typeof CalendarIcon | typeof Wrench; color: string }> = {
            peminjaman: { icon: CalendarIcon, color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300' },
            kerusakan: { icon: Wrench, color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-300' },
            maintenance: { icon: Wrench, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300' },
        };
        const { icon: Icon, color } = config[type] ?? config.maintenance;
        return (
            <span className={`flex h-10 w-10 items-center justify-center rounded-full ${color}`}>
                <Icon className="h-5 w-5" />
            </span>
        );
    };

    return (
        <>
            <Head title={alat.nama} />

            <div className="mb-6 flex items-center gap-4">
                <Link
                    href={base}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/80"
                >
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{alat.nama}</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {alat.kode} &bull; {alat.laboratorium?.nama ?? '-'} &bull; {alat.kategori_alat?.nama ?? 'Umum'}
                    </p>
                </div>
                <div className="ml-auto flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariant(alat.status)}>{alatStatusMap[alat.status]?.label ?? alat.status.replace('_', ' ')}</Badge>
                    <Badge variant="neutral">Kondisi: {kondisiAlatMap[alat.kondisi] ?? alat.kondisi.replace('_', ' ')}</Badge>
                    {editHref && (
                        <Link href={editHref}>
                            <Button size="sm" variant="secondary">Edit</Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Card className="overflow-hidden">
                        <div className="border-b border-slate-200/80 dark:border-slate-800/80">
                            <div className="flex overflow-x-auto">
                                {tabs.map((t) => (
                                    <button
                                        key={t.key}
                                        onClick={() => setActiveTab(t.key as any)}
                                        className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                                            activeTab === t.key
                                                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                        }`}
                                    >
                                        <t.icon className="h-4 w-4" /> {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6">
                            {activeTab === 'info' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Deskripsi</h2>
                                        <p className="mt-3 text-slate-600 dark:text-slate-300">{alat.deskripsi ?? 'Tidak ada deskripsi.'}</p>
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
                                <div>
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
                                            {allGallery.map((g, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setLightboxIndex(idx)}
                                                    className="overflow-hidden rounded-2xl border border-slate-200/80 text-left dark:border-slate-800/80"
                                                >
                                                    <ImageWithFallback
                                                        src={g.src}
                                                        alt={g.alt}
                                                        className="h-56 w-full object-cover transition hover:scale-105"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'dokumen' && (
                                <div className="space-y-3">
                                    {dokumen.length === 0 ? (
                                        <p className="text-center text-slate-500 dark:text-slate-400">Tidak ada dokumen.</p>
                                    ) : (
                                        dokumen.map((d) => (
                                            <button
                                                key={d.id}
                                                type="button"
                                                onClick={() => setSelectedDoc(d)}
                                                className="flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 text-left transition hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-900 dark:hover:bg-slate-800"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-5 w-5 text-indigo-600" />
                                                    <span className="font-medium text-slate-900 dark:text-slate-100">{d.judul}</span>
                                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                        {dokumenJenisMap[d.jenis] ?? d.jenis}
                                                    </span>
                                                </div>
                                                <Download className="h-4 w-4 text-slate-400" />
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'video' && (
                                <div>
                                    {videos.length === 0 ? (
                                        <p className="text-center text-slate-500 dark:text-slate-400">Tidak ada video tutorial.</p>
                                    ) : (
                                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                            {videos.map((v) => (
                                                <button
                                                    key={v.id}
                                                    onClick={() => setSelectedVideo(v)}
                                                    className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left shadow-sm transition hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900"
                                                >
                                                    <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                                                        {v.thumbnail ? (
                                                            <ImageWithFallback
                                                                src={`/storage/${v.thumbnail}`}
                                                                alt={v.judul}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full items-center justify-center text-slate-400">
                                                                <Play className="h-8 w-8" />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 transition group-hover:bg-slate-900/25">
                                                            <Play className="h-10 w-10 text-white opacity-90 transition group-hover:scale-110 group-hover:opacity-100" />
                                                        </div>
                                                    </div>
                                                    <div className="p-4">
                                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{v.judul}</h3>
                                                        {v.durasi && (
                                                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                                <Clock className="h-3 w-3" /> {v.durasi} detik
                                                            </p>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'qr' && (
                                <div className="text-center">
                                    {alat.qr_kode_path ? (
                                        <div className="space-y-4">
                                            <ImageWithFallback
                                                src={`/storage/${alat.qr_kode_path}`}
                                                alt={`QR Code ${alat.nama}`}
                                                className="mx-auto h-48 w-48 rounded-2xl border border-slate-200/80 object-contain p-4 dark:border-slate-800/80"
                                            />
                                            <a
                                                href={`/storage/${alat.qr_kode_path}`}
                                                download
                                                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                            >
                                                <Download className="h-4 w-4" /> Unduh QR Code
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 dark:text-slate-400">QR Code belum tersedia.</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'riwayat' && (
                                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                                    <h3 className="mb-6 font-semibold text-slate-900 dark:text-slate-100">
                                        Riwayat Peminjaman, Kerusakan, dan Maintenance
                                    </h3>
                                    {(riwayat ?? []).length === 0 ? (
                                        <p className="text-slate-500 dark:text-slate-400">Belum ada riwayat.</p>
                                    ) : (
                                        <div className="relative pl-12">
                                            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
                                            {(riwayat ?? []).map((h, idx) => {
                                                const statusLabel =
                                                    h.type === 'peminjaman' ? statusPeminjamanMap[h.status]?.label ?? h.status :
                                                    h.type === 'kerusakan' ? statusKerusakanMap[h.status]?.label ?? h.status :
                                                    h.type === 'maintenance' ? statusMaintenanceMap[h.status]?.label ?? h.status :
                                                    h.status;
                                                return (
                                                    <div key={idx} className="relative mb-8 last:mb-0">
                                                        <span className="absolute -left-12 top-0">{historyIcon(h.type)}</span>
                                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{h.title}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {formatDate(h.date)}
                                                            {h.end ? ` - ${formatDate(h.end)}` : ''} &bull; {statusLabel}
                                                        </p>
                                                        {h.description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{h.description}</p>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'jadwal' && (
                                <div>
                                    <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Jadwal Peminjaman Alat</h3>
                                    <Calendar
                                        events={events ?? []}
                                        height="500px"
                                        showFilters={(events ?? []).length > 0}
                                    />
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                <aside>
                    <Card>
                        <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Informasi Alat</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 text-indigo-600" />
                                <span className="text-slate-600 dark:text-slate-300">{alat.laboratorium?.nama ?? '-'}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <FlaskConical className="h-4 w-4 text-indigo-600" />
                                <span className="text-slate-600 dark:text-slate-300">{alat.kategori_alat?.nama ?? 'Umum'}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Wrench className="h-4 w-4 text-indigo-600" />
                                <span className="text-slate-600 dark:text-slate-300">{kondisiAlatMap[alat.kondisi] ?? alat.kondisi}</span>
                            </li>
                        </ul>
                        {isEnabled('qr_code') && alat.qr_kode_path && (
                            <a
                                href={`/storage/${alat.qr_kode_path}`}
                                download
                                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                <QrCode className="h-4 w-4" /> Unduh QR Code
                            </a>
                        )}
                    </Card>
                </aside>
            </div>

            <Modal open={!!selectedVideo} onClose={() => setSelectedVideo(null)} title={selectedVideo?.judul ?? 'Video'} size="xl">
                <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    {selectedVideo?.url ? (
                        <iframe src={selectedVideo.url} title={selectedVideo.judul} className="h-full w-full" allowFullScreen />
                    ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                            <Play className="h-16 w-16" />
                        </div>
                    )}
                </div>
            </Modal>

            {selectedDoc && (
                <DocumentPreview
                    file={selectedDoc.file}
                    title={selectedDoc.judul}
                    open
                    onClose={() => setSelectedDoc(null)}
                />
            )}

            {lightboxIndex !== null && (
                <Lightbox
                    images={allGallery}
                    initialIndex={lightboxIndex}
                    open={lightboxIndex !== null}
                    onClose={() => setLightboxIndex(null)}
                />
            )}
        </>
    );
}

function Stat({
    label,
    value,
    variant = 'slate',
}: {
    label: string;
    value: number;
    variant?: 'slate' | 'emerald' | 'indigo' | 'cyan' | 'rose' | 'amber';
}) {
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
