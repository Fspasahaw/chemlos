import { Head, router, usePage } from '@inertiajs/react';
import { Download, FileText, RotateCcw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '../Badge';
import { DatePicker } from '../DatePicker';
import Modal from '../Modal';
import { Pagination } from '../Pagination';
import { SearchInput } from '../SearchInput';
import { Select } from '../Select';
import { EmptyTable } from '../EmptyTable';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface Column {
    key: string;
    label: string;
}

interface FilterOptions {
    [key: string]: { [key: string]: string } | string[];
}

interface LaporanPageProps {
    jenis?: string;
    jenisList?: string[];
    label?: string;
    items: any;
    filters: Record<string, any>;
    columns: Column[];
    filterOptions: FilterOptions;
    exportUrl?: string;
    exportPdfUrl?: string;
    title?: string;
}

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
    diajukan: 'info',
    menunggu_dosen: 'warning',
    menunggu_laboran: 'warning',
    disetujui: 'info',
    berlangsung: 'info',
    selesai: 'success',
    terlambat: 'danger',
    ditolak: 'danger',
    dibatalkan: 'neutral',
    baik: 'success',
    rusak_ringan: 'warning',
    rusak_berat: 'danger',
    hilang: 'danger',
    aktif: 'success',
    nonaktif: 'neutral',
    tersedia: 'success',
    dipinjam: 'info',
    maintenance: 'warning',
    tidak_tersedia: 'neutral',
    approved: 'success',
    pending_email: 'warning',
    pending_approval: 'warning',
    rejected: 'danger',
    suspended: 'danger',
    dilaporkan: 'warning',
    dicek: 'info',
    diabaikan: 'neutral',
    dijadwalkan: 'info',
};

const STATUS_LABELS: Record<string, string> = {
    diajukan: 'Diajukan',
    menunggu_dosen: 'Menunggu Dosen',
    menunggu_laboran: 'Menunggu Laboran',
    disetujui: 'Disetujui',
    berlangsung: 'Berlangsung',
    selesai: 'Selesai',
    terlambat: 'Terlambat',
    ditolak: 'Ditolak',
    dibatalkan: 'Dibatalkan',
    baik: 'Baik',
    rusak_ringan: 'Rusak Ringan',
    rusak_berat: 'Rusak Berat',
    hilang: 'Hilang',
    aktif: 'Aktif',
    nonaktif: 'Nonaktif',
    tersedia: 'Tersedia',
    dipinjam: 'Dipinjam',
    maintenance: 'Maintenance',
    tidak_tersedia: 'Tidak Tersedia',
    approved: 'Aktif',
    pending_email: 'Belum Verifikasi Email',
    pending_approval: 'Menunggu Persetujuan',
    rejected: 'Ditolak',
    suspended: 'Dinonaktifkan',
    dilaporkan: 'Dilaporkan',
    dicek: 'Dicek',
    diabaikan: 'Diabaikan',
    dijadwalkan: 'Dijadwalkan',
    admin: 'Admin',
    pimpinan: 'Pimpinan',
    kepala_lab: 'Kepala Laboratorium',
    laboran: 'Laboran',
    dosen: 'Dosen',
    mahasiswa: 'Mahasiswa',
};

function badgeVariant(value: string): BadgeVariant {
    return STATUS_VARIANTS[String(value)] ?? 'neutral';
}

function statusLabel(value: string): string {
    return STATUS_LABELS[String(value)] ?? String(value);
}

function labelForJenis(jenis: string): string {
    const labels: Record<string, string> = {
        pengguna: 'Pengguna',
        laboratorium: 'Laboratorium',
        alat: 'Alat',
        kerusakan: 'Riwayat Kerusakan',
        maintenance: 'Maintenance',
        peminjaman: 'Peminjaman',
        pengembalian: 'Pengembalian',
        aktivitas: 'Audit Log / Aktivitas',
    };
    return labels[jenis] ?? 'Laporan';
}

function toSelectOptions(options: any): { value: string; label: string }[] {
    if (!options) return [];
    if (Array.isArray(options)) {
        return options.map((o) => (typeof o === 'string' ? { value: o, label: o } : { value: String(o.value ?? o.id ?? o), label: String(o.label ?? o.name ?? o) }));
    }
    return Object.entries(options).map(([value, label]) => ({ value, label: String(label) }));
}

export default function LaporanView({ title, base: baseProp }: { title?: string; base?: string }) {
    const {
        jenis,
        jenisList,
        items,
        filters,
        columns,
        filterOptions,
        exportUrl,
        exportPdfUrl,
    } = usePage().props as unknown as LaporanPageProps;

    const base = baseProp ?? (typeof window !== 'undefined' ? window.location.pathname : '');
    const [values, setValues] = useState<Record<string, any>>(() => ({ ...filters, jenis: jenis ?? '' }));

    useEffect(() => {
        setValues({ ...filters, jenis: jenis ?? '' });
    }, [filters, jenis]);

    const currentLabel = useMemo(() => labelForJenis(values.jenis || jenis || 'peminjaman'), [values.jenis, jenis]);
    const pageTitle = title ?? `Laporan ${currentLabel}`;

    const handleChange = (key: string, value: any) => {
        setValues((prev) => ({ ...prev, [key]: value }));
    };

    const buildQuery = (extra: Record<string, any> = {}) => {
        const query: Record<string, any> = { ...values, ...extra };
        const cleaned: Record<string, any> = {};
        Object.entries(query).forEach(([k, v]) => {
            if (v !== '' && v !== null && v !== undefined) {
                cleaned[k] = v;
            }
        });
        return cleaned;
    };

    const apply = () => {
        router.get(base, buildQuery(), { preserveState: true, preserveScroll: true });
    };

    const reset = () => {
        const jenisOnly = values.jenis ? { jenis: values.jenis } : {};
        router.get(base, jenisOnly, { preserveState: true, preserveScroll: true });
    };

    const changeJenis = (newJenis: string) => {
        router.get(base, { jenis: newJenis }, { preserveState: true, preserveScroll: true });
    };

    const exportLink = (url?: string) => {
        if (!url) return '#';
        const params = new URLSearchParams();
        Object.entries(buildQuery()).forEach(([k, v]) => params.append(k, String(v)));
        return `${url}?${params.toString()}`;
    };

    const labelMap: Record<string, string> = {
        search: 'Pencarian',
        status: 'Status',
        role: 'Peran',
        program_studi_id: 'Program Studi',
        laboratorium_id: 'Laboratorium',
        kategori_id: 'Kategori',
        kondisi: 'Kondisi',
        user: 'Pengguna',
        action: 'Aksi',
        tabel: 'Tabel',
        start: 'Dari Tanggal',
        end: 'Sampai Tanggal',
    };

    const renderFilterInput = (key: string) => {
        const value = values[key] ?? '';
        const label = labelMap[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

        // Select options keys in filterOptions may omit _id suffix
        const optionKey = key.replace('_id', '');
        const options = filterOptions?.[optionKey] ?? filterOptions?.[key];

        if (key === 'start' || key === 'end') {
            return (
                <div key={key}>
                    <DatePicker
                        label={key === 'start' ? 'Dari Tanggal' : 'Sampai Tanggal'}
                        value={value}
                        onChange={(e) => handleChange(key, e.target.value)}
                    />
                </div>
            );
        }

        if (options && (Array.isArray(options) || Object.keys(options).length > 0)) {
            const opts = [{ value: '', label: 'Semua' }, ...toSelectOptions(options)];
            return (
                <div key={key}>
                    <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">{label}</label>
                    <Select options={opts} value={value} onChange={(e) => handleChange(key, e.target.value)} />
                </div>
            );
        }

        return (
            <div key={key}>
                <SearchInput
                    value={value}
                    onChange={(v) => handleChange(key, v)}
                    placeholder={`Cari ${label.toLowerCase()}`}
                    className="w-full"
                />
            </div>
        );
    };

    const [detailRow, setDetailRow] = useState<Record<string, any> | null>(null);
    const detailOpen = detailRow !== null;

    const formatDetailValue = (value: any) => {
        const text = String(value ?? '-');
        if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
            try {
                const parsed = JSON.parse(text);
                return <pre className="overflow-auto rounded-lg bg-slate-100 p-2 text-xs dark:bg-slate-800">{JSON.stringify(parsed, null, 2)}</pre>;
            } catch {
                return text;
            }
        }
        return text;
    };

    const filterKeys = Object.keys(filters || {});

    return (
        <>
            <Head title={pageTitle} />
            <h1 className="mb-6 text-2xl font-bold">{pageTitle}</h1>

            <div className="mb-4 rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800/80 dark:bg-slate-900">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                    {jenisList && jenisList.length > 0 && (
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Jenis Laporan</label>
                            <Select
                                options={jenisList.map((j) => ({ value: j, label: labelForJenis(j) }))}
                                value={values.jenis || jenis}
                                onChange={(e) => changeJenis(e.target.value)}
                            />
                        </div>
                    )}

                    {filterKeys.map(renderFilterInput)}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={apply} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"><Search className="h-4 w-4" /> Terapkan</button>
                    <button onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"><RotateCcw className="h-4 w-4" /> Reset</button>
                    {exportUrl && <a href={exportLink(exportUrl)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"><Download className="h-4 w-4" /> Excel</a>}
                    {exportPdfUrl && <a href={exportLink(exportPdfUrl)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"><FileText className="h-4 w-4" /> PDF</a>}
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr>
                                {columns.map((col) => (
                                    <th key={col.key} className="whitespace-nowrap px-4 py-3 text-left font-semibold">{col.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {items?.data?.length === 0 && (
                                <EmptyTable colSpan={columns.length || 1} message="Tidak ada data." />
                            )}
                            {items?.data?.map((row: any, idx: number) => (
                                <tr
                                    key={idx}
                                    className="cursor-pointer border-t border-slate-200/80 hover:bg-slate-50 dark:border-slate-800/80 dark:hover:bg-slate-800/50"
                                    onClick={() => setDetailRow(row)}
                                >
                                    {columns.map((col) => {
                                        const val = row[col.key];
                                        const isStatus = ['status', 'kondisi', 'peran'].includes(col.key) || STATUS_VARIANTS[String(val)];
                                        return (
                                            <td key={col.key} className="px-4 py-3 align-top">
                                                {isStatus ? (
                                                    <Badge variant={badgeVariant(String(val))}>{statusLabel(String(val))}</Badge>
                                                ) : (
                                                    <span className="line-clamp-3">{String(val ?? '-')}</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination links={items?.links} from={items?.from} to={items?.to} total={items?.total} />

            <Modal
                open={detailOpen}
                onClose={() => setDetailRow(null)}
                title="Detail"
                size="lg"
            >
                <div className="space-y-3">
                    {detailRow && columns.map((col) => (
                        <div key={col.key}>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{col.label}</p>
                            <div className="mt-1 text-slate-800 dark:text-slate-200">
                                {formatDetailValue(detailRow[col.key])}
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>
        </>
    );
}
