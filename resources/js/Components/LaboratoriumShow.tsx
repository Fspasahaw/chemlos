import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Calendar as CalendarIcon,
    CalendarDays,
    Clock,
    FileText,
    FlaskConical,
    Image,
    Info,
    Mail,
    MapPin,
    Phone,
    Users,
    Wrench,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from './Badge';
import { Button } from './Button';
import { Calendar, CalendarEvent } from './Calendar';
import { Card } from './Card';
import { CardWithBackground } from './CardWithBackground';
import { DocumentPreview } from './DocumentPreview';
import { ImageWithFallback } from './ImageWithFallback';
import { Lightbox } from './Lightbox';
import { formatDate } from '../lib/date';
import { alatStatusMap, dokumenJenisMap, kondisiAlatMap, peranLabelMap, statusKerusakanMap, statusMaintenanceMap, statusPeminjamanMap } from '../lib/status';

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

interface AlatItem {
    id: number;
    nama: string;
    slug?: string;
    kode: string;
    stok_tersedia: number;
    kondisi: string;
    foto_utama: string | null;
    kategori_alat?: { nama: string } | null;
}

interface Pengelola {
    user: { nama_lengkap: string };
    peran: string;
}

interface HistoryItem {
    type: 'peminjaman' | 'kerusakan' | 'maintenance';
    date: string;
    end?: string | null;
    title: string;
    status: string;
    description?: string;
}

interface RiwayatData {
    peminjaman?: any[];
    kerusakan?: any[];
    maintenance?: any[];
}

interface Lab {
    id: number;
    nama: string;
    kode: string;
    slug?: string;
    deskripsi: string;
    lokasi: string;
    gedung: string;
    lantai: string;
    ruangan: string;
    kapasitas: number;
    jam_buka: string;
    jam_tutup: string;
    hari_operasional?: string[] | string;
    email: string;
    telepon: string;
    foto_utama: string | null;
    status: string;
    alats: AlatItem[];
    galeri?: GaleriItem[];
    laboratorium_galeris?: GaleriItem[];
    dokumen?: DokumenItem[];
    laboratorium_dokumens?: DokumenItem[];
    laboratorium_tata_tertibs?: { id: number; isi: string }[];
    pengelola?: Pengelola[];
    laboratorium_pengelolas?: Pengelola[];
}

interface LaboratoriumShowProps {
    base: string;
    editHref?: string;
}

export default function LaboratoriumShow({ base, editHref }: LaboratoriumShowProps) {
    const { item, events, riwayat } = usePage().props as unknown as {
        item: Lab;
        events?: CalendarEvent[];
        riwayat?: RiwayatData;
    };
    const [activeTab, setActiveTab] = useState<'tentang' | 'alat' | 'galeri' | 'dokumen' | 'tata-tertib' | 'jadwal-riwayat'>('tentang');
    const [selectedKategori, setSelectedKategori] = useState<string>('');
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<DokumenItem | null>(null);

    const lab = item;
    const galeri = (lab as any).laboratoriumGaleris ?? (lab as any).laboratorium_galeris ?? lab.galeri ?? [];
    const galleryImages = galeri.map((g) => ({ src: `/storage/${g.file}`, alt: g.judul }));
    const dokumen = (lab as any).laboratoriumDokumens ?? (lab as any).laboratorium_dokumens ?? lab.dokumen ?? [];
    const tataTertibs = (lab as any).laboratoriumTataTertibs ?? (lab as any).laboratorium_tata_tertibs ?? [];
    const pengelola = (lab as any).laboratoriumPengelolas ?? (lab as any).laboratorium_pengelolas ?? lab.pengelola ?? [];
    const alats = lab.alats ?? [];

    const tabs = [
        { key: 'tentang', label: 'Tentang', icon: Info },
        { key: 'alat', label: 'Alat', icon: FlaskConical },
        { key: 'galeri', label: 'Galeri', icon: Image },
        { key: 'dokumen', label: 'Dokumen', icon: FileText },
        { key: 'tata-tertib', label: 'Tata Tertib', icon: BookOpen },
        { key: 'jadwal-riwayat', label: 'Jadwal / Riwayat', icon: CalendarIcon },
    ];

    const regulerDocs = dokumen.filter((d) => d.jenis !== 'tata_tertib');
    const kategoriOptions = Array.from(
        new Set(alats.map((a) => a.kategori_alat?.nama).filter(Boolean) as string[])
    );
    const filteredAlats = selectedKategori ? alats.filter((a) => a.kategori_alat?.nama === selectedKategori) : alats;

    const hariOperasional = Array.isArray(lab.hari_operasional)
        ? lab.hari_operasional.join(', ')
        : lab.hari_operasional ?? '-';

    const statusVariant = (status: string) => {
        switch (status) {
            case 'aktif':
                return 'success';
            case 'nonaktif':
                return 'neutral';
            default:
                return 'info';
        }
    };


    return (
        <>
            <Head title={lab.nama} />

            <div className="mb-6 flex items-center gap-4">
                <Link
                    href={base}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/80"
                >
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{lab.nama}</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {lab.kode} &bull; {lab.lokasi ?? '-'}
                    </p>
                </div>
                <Badge variant={statusVariant(lab.status)} className="ml-auto">
                    {lab.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                </Badge>
                {editHref && (
                    <Link href={editHref}>
                        <Button size="sm" variant="secondary">Edit</Button>
                    </Link>
                )}
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
                            {activeTab === 'tentang' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Tentang Laboratorium</h2>
                                        <p className="mt-3 text-slate-600 dark:text-slate-300">{lab.deskripsi ?? 'Tidak ada deskripsi.'}</p>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <InfoItem label="Gedung" value={lab.gedung} />
                                        <InfoItem label="Lantai" value={lab.lantai} />
                                        <InfoItem label="Ruang" value={lab.ruangan} />
                                        <InfoItem label="Kapasitas" value={lab.kapasitas ? `${lab.kapasitas} orang` : '-'} />
                                        <InfoItem label="Jam Buka" value={`${lab.jam_buka?.slice(0, 5) ?? '-'} - ${lab.jam_tutup?.slice(0, 5) ?? '-'}`} />
                                        <InfoItem label="Hari Operasional" value={hariOperasional} />
                                        <InfoItem label="Email" value={lab.email} />
                                        <InfoItem label="Telepon" value={lab.telepon} />
                                    </div>
                                    {pengelola.length > 0 && (
                                        <div>
                                            <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                                                <Users className="h-5 w-5 text-indigo-600" /> Pengelola
                                            </h3>
                                            <ul className="space-y-3">
                                                {pengelola.map((p, i) => (
                                                    <li
                                                        key={i}
                                                        className="rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-900/50"
                                                    >
                                                        <span className="font-medium text-slate-900 dark:text-slate-100">{p.user.nama_lengkap}</span>
                                                        <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">({peranLabelMap[p.peran] ?? p.peran.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())})</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'alat' && (
                                <div>
                                    {kategoriOptions.length > 0 && (
                                        <div className="mb-4 flex flex-wrap gap-2">
                                            <button
                                                onClick={() => setSelectedKategori('')}
                                                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                                    selectedKategori === ''
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                                }`}
                                            >
                                                Semua
                                            </button>
                                            {kategoriOptions.map((k) => (
                                                <button
                                                    key={k}
                                                    onClick={() => setSelectedKategori(k)}
                                                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                                        selectedKategori === k
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                                    }`}
                                                >
                                                    {k}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {filteredAlats.length === 0 ? (
                                        <p className="text-center text-slate-500 dark:text-slate-400">Tidak ada alat tersedia.</p>
                                    ) : (
                                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                            {filteredAlats.map((alat) => (
                                                <CardWithBackground
                                                    key={alat.id}
                                                    href={alat.slug ? `/alat/${alat.slug}` : '#'}
                                                    image={alat.foto_utama ? `/storage/${alat.foto_utama}` : null}
                                                    alt={alat.nama}
                                                    title={alat.nama}
                                                    subtitle={alat.kategori_alat?.nama ?? 'Umum'}
                                                    badge={<Badge variant={alatStatusMap[alat.status]?.variant ?? 'neutral'}>{alatStatusMap[alat.status]?.label ?? alat.status}</Badge>}
                                                    footer={
                                                        <>
                                                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">{alat.stok_tersedia} tersedia</span>
                                                            <span className="text-slate-500 dark:text-slate-400">{kondisiAlatMap[alat.kondisi] ?? alat.kondisi}</span>
                                                        </>
                                                    }
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'galeri' && (
                                <div>
                                    {galeri.length === 0 ? (
                                        <p className="text-center text-slate-500 dark:text-slate-400">Belum ada galeri.</p>
                                    ) : (
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            {galeri.map((g, idx) => (
                                                <button
                                                    key={g.id}
                                                    type="button"
                                                    onClick={() => setLightboxIndex(idx)}
                                                    className="overflow-hidden rounded-2xl border border-slate-200/80 text-left dark:border-slate-800/80"
                                                >
                                                    <ImageWithFallback
                                                        src={`/storage/${g.file}`}
                                                        alt={g.judul}
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
                                    {regulerDocs.length === 0 ? (
                                        <p className="text-center text-slate-500 dark:text-slate-400">Belum ada dokumen.</p>
                                    ) : (
                                        regulerDocs.map((d) => (
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
                                                <span className="text-sm text-indigo-600">Lihat</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'tata-tertib' && (
                                <div>
                                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                                        <BookOpen className="h-5 w-5 text-indigo-600" /> Tata Tertib Laboratorium
                                    </h3>
                                    {tataTertibs.length === 0 ? (
                                        <p className="text-slate-500 dark:text-slate-400">Tata tertib belum tersedia.</p>
                                    ) : (
                                        <ol className="list-decimal space-y-2 pl-5">
                                            {tataTertibs.map((t) => (
                                                <li key={t.id} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-900 dark:bg-slate-900/50 dark:text-slate-100">
                                                    <span className="whitespace-pre-wrap">{t.isi}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    )}
                                </div>
                            )}

                            {activeTab === 'jadwal-riwayat' && (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Jadwal Peminjaman</h3>
                                        <Calendar
                                            events={events ?? []}
                                            height="500px"
                                            showFilters={(events ?? []).length > 0}
                                        />
                                    </div>

                                    <div>
                                        <h3 className="mb-6 font-semibold text-slate-900 dark:text-slate-100">Riwayat</h3>
                                        {(() => {
                                            const historyItems: HistoryItem[] = [
                                                ...(riwayat?.peminjaman ?? []).map((p: any) => ({
                                                    type: 'peminjaman' as const,
                                                    date: p.tanggal_mulai,
                                                    end: p.tanggal_selesai,
                                                    title: `${p.user?.nama_lengkap ?? 'Pengguna'} — ${p.kode ?? ''}`,
                                                    status: statusPeminjamanMap[p.status]?.label ?? p.status,
                                                    description: p.details?.map((d: any) => `${d.alat?.nama ?? 'Alat'} x${d.jumlah}`).join(', '),
                                                })),
                                                ...(riwayat?.kerusakan ?? []).map((k: any) => ({
                                                    type: 'kerusakan' as const,
                                                    date: k.tanggal_laporan,
                                                    end: null,
                                                    title: `${k.alat?.nama ?? 'Alat'} — ${kondisiAlatMap[k.kondisi] ?? k.kondisi}`,
                                                    status: statusKerusakanMap[k.status]?.label ?? k.status,
                                                    description: k.keterangan,
                                                })),
                                                ...(riwayat?.maintenance ?? []).map((m: any) => ({
                                                    type: 'maintenance' as const,
                                                    date: m.tanggal_mulai,
                                                    end: m.tanggal_selesai,
                                                    title: `${m.alat?.nama ?? 'Alat'}`,
                                                    status: statusMaintenanceMap[m.status]?.label ?? m.status,
                                                    description: `Laboran: ${m.laboran?.nama_lengkap ?? '-'}`,
                                                })),
                                            ].sort((a, b) => +new Date(b.date) - +new Date(a.date));

                                            return historyItems.length === 0 ? (
                                                <p className="text-slate-500 dark:text-slate-400">Belum ada riwayat.</p>
                                            ) : (
                                                <div className="relative pl-12">
                                                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
                                                    {historyItems.map((h, idx) => {
                                                        const Icon = h.type === 'peminjaman' ? CalendarIcon : h.type === 'kerusakan' ? Wrench : Wrench;
                                                        const iconClass =
                                                            h.type === 'peminjaman'
                                                                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300'
                                                                : h.type === 'kerusakan'
                                                                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-300'
                                                                  : 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300';
                                                        return (
                                                            <div key={idx} className="relative mb-8 last:mb-0">
                                                                <span className={`absolute -left-12 top-0 flex h-10 w-10 items-center justify-center rounded-full ${iconClass}`}>
                                                                    <Icon className="h-5 w-5" />
                                                                </span>
                                                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{h.title}</p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                    {formatDate(h.date)}
                                                                    {h.end ? ` - ${formatDate(h.end)}` : ''} &bull; {h.status}
                                                                </p>
                                                                {h.description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{h.description}</p>}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {lightboxIndex !== null && (
                        <Lightbox
                            images={galleryImages}
                            initialIndex={lightboxIndex}
                            open={lightboxIndex !== null}
                            onClose={() => setLightboxIndex(null)}
                        />
                    )}

                    {selectedDoc && (
                        <DocumentPreview
                            file={selectedDoc.file}
                            title={selectedDoc.judul}
                            open={!!selectedDoc}
                            onClose={() => setSelectedDoc(null)}
                        />
                    )}
                </div>

                <aside>
                    <Card>
                        <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Kontak & Jam Operasional</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 text-indigo-600" />
                                <span className="text-slate-600 dark:text-slate-300">{lab.lokasi ?? '-'}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Clock className="h-4 w-4 text-indigo-600" />
                                <span className="text-slate-600 dark:text-slate-300">
                                    {lab.jam_buka?.slice(0, 5) ?? '-'} - {lab.jam_tutup?.slice(0, 5) ?? '-'}
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CalendarDays className="h-4 w-4 text-indigo-600" />
                                <span className="text-slate-600 dark:text-slate-300">{hariOperasional}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Mail className="h-4 w-4 text-indigo-600" />
                                <a href={`mailto:${lab.email}`} className="text-indigo-600 hover:underline">
                                    {lab.email ?? '-'}
                                </a>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="h-4 w-4 text-indigo-600" />
                                <a href={`tel:${lab.telepon}`} className="text-indigo-600 hover:underline">
                                    {lab.telepon ?? '-'}
                                </a>
                            </li>
                        </ul>
                    </Card>
                </aside>
            </div>
        </>
    );
}

function InfoItem({ label, value }: { label: string; value: string | number | null | undefined }) {
    return (
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
            <p className="font-medium text-slate-900 dark:text-slate-100">{value ?? '-'}</p>
        </div>
    );
}
