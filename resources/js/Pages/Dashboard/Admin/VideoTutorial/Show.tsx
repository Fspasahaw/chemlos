import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Clock, FileVideo, Info, Package, Play, Video } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { ImageWithFallback } from '@/Components/ImageWithFallback';
import { Tabs } from '@/Components/Tabs';
import { formatDuration } from '@/lib/date';
import { videoJenisMap } from '@/lib/status';

const sumberLabel: Record<string, string> = {
    youtube: 'YouTube',
    url_eksternal: 'URL Eksternal',
    upload: 'Upload File',
};

export default function Show() {
    const { item } = usePage().props as any;
    const base = '/dashboard/admin/video-tutorial';
    const [tab, setTab] = useState('informasi');

    const tabs = [
        { key: 'informasi', label: 'Informasi', icon: Info },
        { key: 'video', label: 'Video', icon: Play },
        ...(item.jenis === 'alat' && item.alat ? [{ key: 'alat', label: 'Alat Terkait', icon: Package }] : []),
    ];

    const videoUrl = item.url ?? (item.file ? `/storage/${item.file}` : null);

    return (
        <>
            <Head title={`Video: ${item.judul}`} />
            <div className="mb-6">
                <Link href={base} className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400">
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Link>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Video className="h-7 w-7 text-indigo-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{item.judul}</h1>
                            <p className="text-sm text-slate-500">{item.slug}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant={item.status === 'aktif' ? 'success' : 'neutral'}>{item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}</Badge>
                        <Link href={`${base}/${item.id}/edit`}><Button size="sm" leftIcon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>}>Edit</Button></Link>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900">
                <Tabs tabs={tabs} active={tab} onChange={setTab} />

                <div className="p-6">
                    {tab === 'informasi' && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Jenis</p>
                                <p className="font-medium text-slate-900 dark:text-slate-100 capitalize">{videoJenisMap[item.jenis] ?? item.jenis}</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Sumber</p>
                                <p className="font-medium text-slate-900 dark:text-slate-100">{sumberLabel[item.sumber] ?? item.sumber}</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Durasi</p>
                                <p className="flex items-center gap-1 font-medium text-slate-900 dark:text-slate-100"><Clock className="h-4 w-4" /> {item.durasi ? formatDuration(item.durasi) : '-'}</p>
                            </div>
                            {item.alat && (
                                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Alat Terkait</p>
                                    <Link href={`/dashboard/admin/alat/${item.alat.id}`} className="font-medium text-indigo-600 hover:underline">{item.alat.nama}</Link>
                                </div>
                            )}
                            {item.deskripsi && (
                                <div className="md:col-span-2 rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Deskripsi</p>
                                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-900 dark:text-slate-100">{item.deskripsi}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {tab === 'video' && (
                        <div>
                            {!videoUrl ? (
                                <p className="text-center text-slate-500 dark:text-slate-400">Video belum tersedia.</p>
                            ) : (
                                <div className="space-y-4">
                                    {item.thumbnail ? (
                                        <div className="relative aspect-video w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                                            <ImageWithFallback src={`/storage/${item.thumbnail}`} alt={item.judul} className="h-full w-full object-cover" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20">
                                                <Play className="h-12 w-12 text-white opacity-90" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex h-48 w-full max-w-2xl items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50">
                                            <FileVideo className="h-12 w-12 text-slate-400" />
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                        {item.sumber === 'upload' && item.file && (
                                            <a href={`/storage/${item.file}`} target="_blank" rel="noreferrer">
                                                <Button leftIcon={<Play className="h-4 w-4" />}>Putar Video</Button>
                                            </a>
                                        )}
                                        {item.url && (
                                            <a href={item.url} target="_blank" rel="noreferrer">
                                                <Button leftIcon={<Play className="h-4 w-4" />}>Buka Sumber Video</Button>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {tab === 'alat' && item.alat && (
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{item.alat.nama}</h3>
                            <Link href={`/dashboard/admin/alat/${item.alat.id}`} className="mt-4 inline-block">
                                <Button size="sm" leftIcon={<Package className="h-4 w-4" />}>Lihat Alat</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
