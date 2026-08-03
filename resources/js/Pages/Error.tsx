import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ChevronLeft, FlaskConical, Home } from 'lucide-react';
import GuestLayout from '../Layouts/GuestLayout';

interface ErrorProps {
    status: number;
    message?: string;
}

const titles: Record<number, string> = {
    403: 'Akses Ditolak',
    404: 'Halaman Tidak Ditemukan',
    419: 'Sesi Kedaluwarsa',
    429: 'Terlalu Banyak Permintaan',
    500: 'Terjadi Kesalahan Server',
    503: 'Layanan Tidak Tersedia',
};

const descriptions: Record<number, string> = {
    403: 'Anda tidak memiliki izin untuk mengakses halaman ini.',
    404: 'Halaman yang Anda cari tidak ditemukan atau telah dipindahkan.',
    419: 'Sesi Anda telah kedaluwarsa. Silakan muat ulang halaman dan coba lagi.',
    429: 'Terlalu banyak permintaan. Silakan tunggu beberapa saat.',
    500: 'Maaf, terjadi kesalahan pada server. Silakan coba lagi nanti.',
    503: 'Layanan sedang tidak tersedia. Kami sedang melakukan pemeliharaan.',
};

export default function Error({ status, message }: ErrorProps) {
    const title = titles[status] || 'Terjadi Kesalahan';
    const desc = message || descriptions[status] || 'Maaf, terjadi kesalahan yang tidak terduga.';

    return (
        <>
            <Head title={title} />
            <div className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
                    <AlertTriangle className="h-10 w-10" />
                </div>
                <h1 className="mb-2 text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{status}</h1>
                <h2 className="mb-3 text-2xl font-bold text-slate-800 dark:text-slate-200">{title}</h2>
                <p className="mb-8 text-slate-600 dark:text-slate-400">{desc}</p>
                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition"
                    >
                        <Home className="h-4 w-4" />
                        Kembali ke Beranda
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Kembali
                    </button>
                </div>
                <div className="mt-10 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-500">
                    <FlaskConical className="h-4 w-4 text-indigo-600" />
                    <span>ChemLOS DTK FTUI</span>
                </div>
            </div>
        </>
    );
}

Error.layout = (page: React.ReactNode) => <GuestLayout>{page}</GuestLayout>;
