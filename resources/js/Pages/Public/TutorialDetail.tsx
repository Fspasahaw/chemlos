import { Head, Link } from '@inertiajs/react';
import { Clock, FlaskConical, Home, Play } from 'lucide-react';
import { ImageWithFallback } from '../../Components/ImageWithFallback';
import { formatDate } from '../../lib/date';
import { videoJenisMap } from '../../lib/status';

interface Video { id: number; slug: string; judul: string; deskripsi: string; jenis: string; url: string | null; thumbnail: string | null; durasi: number | null; alat: { nama: string; slug: string } | null; created_at: string; }

export default function TutorialDetail({ video, related }: { video: Video; related: Video[] }) {
    const formatDurasi = (s: number | null) => s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : null;

    return (
        <>
            <Head title={video.judul} />
            <section className="bg-linear-to-br from-indigo-600 to-violet-700 py-16 text-white">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mb-3 flex items-center gap-2 text-sm text-white/80">
                        <Link href="/" className="flex items-center gap-1 hover:text-white hover:underline"><Home className="h-4 w-4" /> Beranda</Link>
                        <span>/</span>
                        <Link href="/tutorial" className="hover:text-white hover:underline">Tutorial</Link>
                        <span>/</span>
                        <span className="text-white">{video.judul}</span>
                    </div>
                    <h1 className="text-3xl font-bold md:text-4xl">{video.judul}</h1>
                    <p className="mt-3 text-white/90">{videoJenisMap[video.jenis] ?? video.jenis} {video.alat ? `— ${video.alat.nama}` : ''}</p>
                </div>
            </section>

            <section className="mx-auto max-w-5xl px-4 py-10">
                <div className="aspect-video w-full overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-800">
                    {video.url ? (
                        <iframe src={video.url} title={video.judul} className="h-full w-full" allowFullScreen />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            {video.thumbnail ? <ImageWithFallback src={`/storage/${video.thumbnail}`} alt={video.judul} className="h-full w-full object-cover" /> : <Play className="h-16 w-16 text-slate-400" />}
                        </div>
                    )}
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="rounded-full bg-indigo-100 px-3 py-1 font-medium text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300">{videoJenisMap[video.jenis] ?? video.jenis}</span>
                    {video.durasi && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatDurasi(video.durasi)}</span>}
                    <span>{formatDate(video.created_at)}</span>
                    {video.alat && <Link href={`/alat/${video.alat.slug}`} className="flex items-center gap-1 text-indigo-600 hover:underline"><FlaskConical className="h-4 w-4" /> {video.alat.nama}</Link>}
                </div>
                <p className="mt-6 whitespace-pre-line text-slate-600 dark:text-slate-300">{video.deskripsi}</p>

                {related.length > 0 && (
                    <div className="mt-12">
                        <h2 className="mb-4 text-xl font-bold">Video Terkait</h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {related.map((v) => (
                                <Link key={v.id} href={`/tutorial/${v.slug}`} className="overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 hover:shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
                                    <span className="text-xs font-medium text-indigo-600">{videoJenisMap[v.jenis] ?? v.jenis}</span>
                                    <h3 className="mt-1 font-medium">{v.judul}</h3>
                                    {v.durasi && <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock className="h-3 w-3" /> {formatDurasi(v.durasi)}</p>}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-12 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                    <h2 className="mb-4 text-xl font-bold">Jelajahi Lainnya</h2>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/tutorial" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Semua Video</Link>
                        <Link href="/tutorial?jenis=aplikasi" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Panduan Aplikasi</Link>
                        <Link href="/alat" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Katalog Alat</Link>
                        <Link href="/laboratorium" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Daftar Laboratorium</Link>
                    </div>
                </div>
            </section>
        </>
    );
}
