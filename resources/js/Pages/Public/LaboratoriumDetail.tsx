import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Calendar as CalendarIcon, CalendarDays, ChevronLeft, ChevronRight, Clock, Download, FileText, FlaskConical, Grid3X3, Image, Info, List, Mail, MapPin, Phone, Pin, Search, SearchX, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '../../Components/Badge';
import { Button } from '../../Components/Button';
import { Calendar, CalendarEvent } from '../../Components/Calendar';
import { CardWithBackground } from '../../Components/CardWithBackground';
import { ImageWithFallback } from '../../Components/ImageWithFallback';
import { Lightbox } from '../../Components/Lightbox';
import { SearchInput } from '../../Components/SearchInput';
import { Select } from '../../Components/Select';
import { Tabs } from '../../Components/Tabs';
import { Tooltip } from '../../Components/Tooltip';
import { alatStatusMap, dokumenJenisMap, kondisiAlatMap, peranLabelMap } from '../../lib/status';

interface GaleriItem { id: number; file: string; judul: string; }
interface DokumenItem { id: number; file: string; judul: string; jenis: string; }
interface AlatItem { id: number; nama: string; slug: string; kode: string; stok_tersedia: number; status: string; kondisi: string; foto_utama: string | null; kategori_alat?: { nama: string } | null; }
interface Pengelola { user: { nama_lengkap: string }; peran: string; }

interface Lab {
    id: number;
    nama: string;
    kode: string;
    slug: string;
    deskripsi: string;
    lokasi: string;
    gedung: string;
    lantai: string;
    ruangan: string;
    kapasitas: number;
    jam_buka: string;
    jam_tutup: string;
    hari_operasional: string[];
    email: string;
    telepon: string;
    foto_utama: string | null;
    alats: AlatItem[];
    galeri: GaleriItem[];
    dokumen: DokumenItem[];
    laboratorium_tata_tertibs?: { id: number; isi: string }[];
    pengelola: Pengelola[];
}

interface FilterOption { value: string; label: string; }

export default function LaboratoriumDetail({ lab, events, statusOptions }: { lab: Lab; events: CalendarEvent[]; statusOptions: FilterOption[] }) {
    const { auth } = usePage().props as any;
    const [activeTab, setActiveTab] = useState<'tentang' | 'alat' | 'galeri' | 'dokumen' | 'tata-tertib' | 'jadwal'>('tentang');
    const [selectedKategori, setSelectedKategori] = useState<string>('');
    const [searchAlat, setSearchAlat] = useState<string>('');
    const [statusAlat, setStatusAlat] = useState<string>('');
    const [viewAlat, setViewAlat] = useState<'grid' | 'list'>('grid');
    const [pageAlat, setPageAlat] = useState<number>(1);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const perPageAlat = 12;

    const galeri = (lab as any).laboratoriumGaleris ?? (lab as any).laboratorium_galeris ?? lab.galeri ?? [];
    const dokumen = (lab as any).laboratoriumDokumens ?? (lab as any).laboratorium_dokumens ?? lab.dokumen ?? [];
    const tataTertibs = (lab as any).laboratoriumTataTertibs ?? (lab as any).laboratorium_tata_tertibs ?? lab.laboratorium_tata_tertibs ?? [];
    const galleryImages = galeri.map((g: any) => ({ src: `/storage/${g.file}`, alt: g.judul }));

    const tabs = [
        { key: 'tentang', label: 'Tentang', icon: Info },
        { key: 'alat', label: 'Alat', icon: FlaskConical },
        { key: 'galeri', label: 'Galeri', icon: Image },
        { key: 'tata-tertib', label: 'Tata Tertib', icon: BookOpen },
        { key: 'dokumen', label: 'Dokumen', icon: FileText },
        { key: 'jadwal', label: 'Jadwal', icon: CalendarIcon },
    ];

    const regulerDocs = dokumen.filter((d: any) => d.jenis !== 'tata_tertib');
    const kategoriOptions = Array.from(new Set(lab.alats.map((a) => a.kategori_alat?.nama).filter(Boolean) as string[]));
    const statusAlatOptions = [
        { value: '', label: 'Semua' },
        { value: 'tersedia', label: alatStatusMap['tersedia']?.label ?? 'Tersedia' },
        { value: 'dipinjam', label: alatStatusMap['dipinjam']?.label ?? 'Dipinjam' },
        { value: 'maintenance', label: alatStatusMap['maintenance']?.label ?? 'Dalam Perbaikan' },
        { value: 'tidak_tersedia', label: alatStatusMap['tidak_tersedia']?.label ?? 'Tidak Tersedia' },
    ];

    const filteredAlats = useMemo(() => {
        return lab.alats.filter((a) => {
            const kategoriMatch = selectedKategori ? a.kategori_alat?.nama === selectedKategori : true;
            const statusMatch = statusAlat ? a.status === statusAlat : true;
            const searchMatch = searchAlat
                ? (a.nama.toLowerCase().includes(searchAlat.toLowerCase()) || a.kode.toLowerCase().includes(searchAlat.toLowerCase()))
                : true;
            return kategoriMatch && statusMatch && searchMatch;
        });
    }, [lab.alats, selectedKategori, statusAlat, searchAlat]);

    const totalAlatPages = Math.max(1, Math.ceil(filteredAlats.length / perPageAlat));
    const pagedAlats = filteredAlats.slice((pageAlat - 1) * perPageAlat, pageAlat * perPageAlat);

    return (
        <>
            <Head title={lab.nama} />

            <section className="relative h-[320px] overflow-hidden md:h-[420px]">
                {lab.foto_utama ? (
                    <ImageWithFallback src={`/storage/${lab.foto_utama}`} alt={lab.nama} className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full w-full bg-linear-to-br from-indigo-600 to-violet-700" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/40 to-slate-900/10" />
                <div className="absolute inset-0 flex flex-col justify-end">
                    <div className="mx-auto w-full max-w-7xl px-4 pb-8 md:pb-12">
                        <div className="mb-3 flex items-center gap-2 text-sm text-white/80">
                            <Link href="/" className="hover:text-white hover:underline">Beranda</Link>
                            <span>/</span>
                            <Link href="/laboratorium" className="hover:text-white hover:underline">Laboratorium</Link>
                            <span>/</span>
                            <span className="text-white">{lab.nama}</span>
                        </div>
                        <p className="text-sm font-medium text-white/80">{lab.kode}</p>
                        <h1 className="text-3xl font-bold text-white md:text-5xl">{lab.nama}</h1>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/90">
                            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {lab.lokasi}</span>
                            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs backdrop-blur">Aktif</span>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <button onClick={() => setActiveTab('jadwal')} className="flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-indigo-600 transition-transform hover:scale-105">
                                <CalendarIcon className="h-4 w-4" /> Lihat Jadwal
                            </button>
                            <a href={`mailto:${lab.email}`} className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20">
                                <Mail className="h-4 w-4" /> Hubungi
                            </a>
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
                        {activeTab === 'tentang' && (
                            <div className="space-y-6">
                                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                                    <h2 className="text-xl font-semibold">Tentang Laboratorium</h2>
                                    <p className="mt-3 text-slate-600 dark:text-slate-300">{lab.deskripsi}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                                    <h3 className="mb-4 flex items-center gap-2 font-semibold"><Info className="h-5 w-5 text-indigo-600" /> Informasi Umum</h3>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <InfoItem label="Gedung" value={lab.gedung} />
                                        <InfoItem label="Lantai" value={lab.lantai} />
                                        <InfoItem label="Ruang" value={lab.ruangan} />
                                        <InfoItem label="Kapasitas" value={`${lab.kapasitas} orang`} />
                                        <InfoItem label="Jam Buka" value={`${lab.jam_buka?.slice(0, 5)} - ${lab.jam_tutup?.slice(0, 5)}`} />
                                        <InfoItem label="Hari Operasional" value={lab.hari_operasional?.join(', ')} />
                                        <InfoItem label="Email" value={lab.email} />
                                        <InfoItem label="Telepon" value={lab.telepon} />
                                    </div>
                                </div>
                                {lab.pengelola.length > 0 && (
                                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                                        <h3 className="mb-4 flex items-center gap-2 font-semibold"><Users className="h-5 w-5 text-indigo-600" /> Pengelola</h3>
                                        <ul className="space-y-3">
                                            {lab.pengelola.map((p, i) => (
                                                <li key={i} className="rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-900/50">
                                                    <span className="font-medium">{p.user.nama_lengkap}</span>
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
                                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                                        <SearchInput
                                            value={searchAlat}
                                            onChange={setSearchAlat}
                                            placeholder="Cari alat..."
                                            className="sm:max-w-xs"
                                        />
                                        <Select
                                            options={statusAlatOptions}
                                            value={statusAlat}
                                            onChange={(e) => { setStatusAlat(e.target.value); setPageAlat(1); }}
                                            className="w-full sm:w-44"
                                        />
                                    </div>
                                    <Tooltip content={viewAlat === 'grid' ? 'Tampilan List' : 'Tampilan Grid'}>
                                        <button
                                            onClick={() => setViewAlat(viewAlat === 'grid' ? 'list' : 'grid')}
                                            className="rounded-lg border border-slate-300 bg-white p-2.5 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                            aria-label={viewAlat === 'grid' ? 'Tampilan List' : 'Tampilan Grid'}
                                        >
                                            {viewAlat === 'grid' ? <List className="h-5 w-5" /> : <Grid3X3 className="h-5 w-5" />}
                                        </button>
                                    </Tooltip>
                                </div>
                                {kategoriOptions.length > 0 && (
                                    <div className="mb-4 flex flex-wrap gap-2">
                                        <button onClick={() => { setSelectedKategori(''); setPageAlat(1); }} className={`rounded-full px-3 py-1 text-xs font-medium ${selectedKategori === '' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>Semua Kategori</button>
                                        {kategoriOptions.map((k) => (
                                            <button key={k} onClick={() => { setSelectedKategori(k); setPageAlat(1); }} className={`rounded-full px-3 py-1 text-xs font-medium ${selectedKategori === k ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{k}</button>
                                        ))}
                                    </div>
                                )}
                                {filteredAlats.length === 0 ? (
                                    <div className="rounded-2xl border border-slate-200/80 bg-white py-16 text-center dark:border-slate-800/80 dark:bg-slate-900">
                                        <SearchX className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-700" />
                                        <p className="mt-4 text-slate-500 dark:text-slate-400">Tidak ada alat yang cocok.</p>
                                        <Button onClick={() => { setSearchAlat(''); setStatusAlat(''); setSelectedKategori(''); setPageAlat(1); }} className="mt-4">Reset Filter</Button>
                                    </div>
                                ) : (
                                    <>
                                        {viewAlat === 'grid' ? (
                                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                                {pagedAlats.map((a) => (
                                                    <CardWithBackground
                                                        key={a.id}
                                                        href={`/alat/${a.slug}`}
                                                        image={a.foto_utama ? `/storage/${a.foto_utama}` : null}
                                                        alt={a.nama}
                                                        title={a.nama}
                                                        subtitle={a.kategori_alat?.nama ?? 'Umum'}
                                                        badge={<Badge variant={alatStatusMap[a.status]?.variant ?? 'neutral'}>{alatStatusMap[a.status]?.label ?? a.status}</Badge>}
                                                        footer={
                                                            <>
                                                                <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">{a.stok_tersedia} tersedia</span>
                                                                <span className="text-slate-500 dark:text-slate-400">{kondisiAlatMap[a.kondisi] ?? a.kondisi}</span>
                                                            </>
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {pagedAlats.map((a) => (
                                                    <CardWithBackground
                                                        key={a.id}
                                                        href={`/alat/${a.slug}`}
                                                        image={a.foto_utama ? `/storage/${a.foto_utama}` : null}
                                                        alt={a.nama}
                                                        title={a.nama}
                                                        subtitle={a.kategori_alat?.nama ?? 'Umum'}
                                                        badge={<Badge variant={alatStatusMap[a.status]?.variant ?? 'neutral'}>{alatStatusMap[a.status]?.label ?? a.status}</Badge>}
                                                        horizontal
                                                        footer={
                                                            <>
                                                                <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">{a.stok_tersedia} tersedia</span>
                                                                <span className="text-slate-500 dark:text-slate-400">{kondisiAlatMap[a.kondisi] ?? a.kondisi}</span>
                                                            </>
                                                        }
                                                    >
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">{a.kode}</p>
                                                    </CardWithBackground>
                                                ))}
                                            </div>
                                        )}
                                        {filteredAlats.length > perPageAlat && (
                                            <div className="mt-6 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                                                <span>Menampilkan {((pageAlat - 1) * perPageAlat) + 1}-{Math.min(pageAlat * perPageAlat, filteredAlats.length)} dari {filteredAlats.length} alat</span>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => setPageAlat((p) => Math.max(1, p - 1))} disabled={pageAlat === 1} className="rounded-lg border border-slate-300 bg-white p-2 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-800"><ChevronLeft className="h-4 w-4" /></button>
                                                    <span className="min-w-[2rem] text-center">{pageAlat} / {totalAlatPages}</span>
                                                    <button onClick={() => setPageAlat((p) => Math.min(totalAlatPages, p + 1))} disabled={pageAlat === totalAlatPages} className="rounded-lg border border-slate-300 bg-white p-2 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-800"><ChevronRight className="h-4 w-4" /></button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'galeri' && (
                            <div>
                                {galeri.length === 0 ? (
                                    <p className="text-center text-slate-500 dark:text-slate-400">Belum ada galeri.</p>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {galeri.map((g: any, idx: number) => (
                                            <button
                                                key={g.id}
                                                type="button"
                                                onClick={() => setLightboxIndex(idx)}
                                                className="overflow-hidden rounded-2xl border border-slate-200/80 text-left dark:border-slate-800/80"
                                            >
                                                <ImageWithFallback src={`/storage/${g.file}`} alt={g.judul} className="h-56 w-full object-cover transition hover:scale-105" />
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
                                        <a key={d.id} href={`/storage/${d.file}`} target="_blank" rel="noreferrer" download className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-900 dark:hover:bg-slate-800">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-indigo-600" />
                                                <span className="font-medium">{d.judul}</span>
                                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs uppercase text-slate-600 dark:bg-slate-800">{dokumenJenisMap[d.jenis] ?? d.jenis}</span>
                                            </div>
                                            <Download className="h-4 w-4 text-slate-400" />
                                        </a>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'tata-tertib' && (
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                                <h3 className="mb-4 flex items-center gap-2 font-semibold"><BookOpen className="h-5 w-5 text-indigo-600" /> Tata Tertib Laboratorium</h3>
                                {tataTertibs.length === 0 ? (
                                    <p className="text-slate-500 dark:text-slate-400">Tata tertib belum tersedia.</p>
                                ) : (
                                    <ol className="list-decimal space-y-2 pl-5">
                                        {tataTertibs.map((t: any) => (
                                            <li key={t.id} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-900 dark:bg-slate-900/50 dark:text-slate-100">
                                                <span className="whitespace-pre-wrap">{t.isi}</span>
                                            </li>
                                        ))}
                                    </ol>
                                )}
                            </div>
                        )}

                        {activeTab === 'jadwal' && (
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                                <h3 className="mb-4 font-semibold">Jadwal Peminjaman</h3>
                                <Calendar events={events} statusOptions={statusOptions} height="500px" showFilters={events.length > 0} />
                            </div>
                        )}
                    </div>

                    <Lightbox
                        images={galleryImages}
                        initialIndex={lightboxIndex ?? 0}
                        open={lightboxIndex !== null}
                        onClose={() => setLightboxIndex(null)}
                    />

                    <aside className="space-y-6">
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                            <h3 className="mb-4 font-semibold">Kontak & Jam Operasional</h3>
                            <ul className="space-y-4 text-sm">
                                <li className="flex items-start gap-3"><MapPin className="h-4 w-4 text-indigo-600" /> <span className="text-slate-600 dark:text-slate-300">{lab.lokasi}</span></li>
                                <li className="flex items-start gap-3"><Clock className="h-4 w-4 text-indigo-600" /> <span className="text-slate-600 dark:text-slate-300">{lab.jam_buka?.slice(0, 5)} - {lab.jam_tutup?.slice(0, 5)}</span></li>
                                <li className="flex items-start gap-3"><CalendarDays className="h-4 w-4 text-indigo-600" /> <span className="text-slate-600 dark:text-slate-300">{lab.hari_operasional?.join(', ')}</span></li>
                                <li className="flex items-start gap-3"><Mail className="h-4 w-4 text-indigo-600" /> <a href={`mailto:${lab.email}`} className="text-indigo-600 hover:underline">{lab.email}</a></li>
                                <li className="flex items-start gap-3"><Phone className="h-4 w-4 text-indigo-600" /> <a href={`tel:${lab.telepon}`} className="text-indigo-600 hover:underline">{lab.telepon}</a></li>
                            </ul>
                            {auth?.user?.active_role === 'mahasiswa' && (
                                <Link href={`/dashboard/mahasiswa/peminjaman/baru?laboratorium_id=${lab.id}`} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
                                    <Pin className="h-4 w-4" /> Pinjam Alat di Lab Ini
                                </Link>
                            )}
                            <Link href="/laboratorium" className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                                <ArrowLeft className="h-4 w-4" /> Kembali
                            </Link>
                        </div>
                    </aside>
                </div>
            </section>
        </>
    );
}

function InfoItem({ label, value }: { label: string; value: string | number | null }) {
    return (
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
            <p className="font-medium text-slate-900 dark:text-slate-100">{value ?? '-'}</p>
        </div>
    );
}
