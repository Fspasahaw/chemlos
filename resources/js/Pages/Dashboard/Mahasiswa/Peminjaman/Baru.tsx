import { Head, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { CheckCircle, FlaskConical, Trash2 } from 'lucide-react';
import { Select } from '@/Components/Select';
import { Input } from '@/Components/Input';
import { NumberStepper } from '@/Components/NumberStepper';
import { useEffect, useState } from 'react';
import { DatePicker } from '@/Components/DatePicker';
import { TimePicker } from '@/Components/TimePicker';
import { FileUpload } from '@/Components/FileUpload';
import { Stepper } from '@/Components/Stepper';
import { SkeletonCard } from '@/Components/Skeleton';
import { ImageWithFallback } from '@/Components/ImageWithFallback';
import { Button } from '@/Components/Button';
import { Textarea } from '@/Components/Textarea';
import { useRecaptcha } from '@/Hooks/useRecaptcha';
import { formatDate } from '../../../../lib/date';
import { kondisiAlatMap } from '../../../../lib/status';

interface Lab { id: number; nama: string; slug: string; }
interface Dosen { id: number; nama_lengkap: string; email: string; }
interface ToolOption {
    id: number;
    nama: string;
    kode: string;
    stok_tersedia: number;
    stok_total: number;
    kondisi: string;
    foto_utama?: string;
    kategori_alat?: { nama: string };
}

interface SelectedTool {
    alat_id: number;
    nama: string;
    kode: string;
    stok: number;
    jumlah: number;
}

interface FormData {
    laboratorium_id: string;
    dosen_pembimbing_id: string;
    tujuan: string;
    tanggal_mulai: string;
    jam_mulai: string;
    tanggal_selesai: string;
    jam_selesai: string;
    file_jsa: File | null;
    alat: { alat_id: number; jumlah: number }[];
    recaptcha_token?: string;
}

export default function Baru() {
    const { labs, dosens, step, labId, tools: initialTools, recaptcha } = usePage().props as any;
    const { getToken } = useRecaptcha(recaptcha?.enabled ? recaptcha?.site_key : undefined);
    const [currentStep, setCurrentStep] = useState<number>(Number(step) || 1);
    const [selectedLab, setSelectedLab] = useState<number | ''>(labId ? Number(labId) : '');
    const [tools, setTools] = useState<ToolOption[]>(initialTools || []);
    const [toolsLoading, setToolsLoading] = useState(false);
    const [selectedTools, setSelectedTools] = useState<SelectedTool[]>([]);

    const form = useForm<FormData>({
        laboratorium_id: labId ? String(labId) : '',
        dosen_pembimbing_id: '',
        tujuan: '',
        tanggal_mulai: '',
        jam_mulai: '08:00',
        tanggal_selesai: '',
        jam_selesai: '17:00',
        file_jsa: null,
        alat: [],
    });

    useEffect(() => {
        if (selectedLab && tools.length === 0) {
            setToolsLoading(true);
            axios
                .get(`/dashboard/mahasiswa/peminjaman/cari-alat?laboratorium_id=${selectedLab}`)
                .then((r) => setTools(r.data?.alat ?? []))
                .finally(() => setToolsLoading(false));
        }
    }, [selectedLab]);

    const submitLab = () => {
        if (!selectedLab) return;
        router.post('/dashboard/mahasiswa/peminjaman/pilih-lab', { laboratorium_id: selectedLab }, {
            onSuccess: () => {},
            onFinish: () => {},
        });
    };

    const addTool = (tool: ToolOption) => {
        if (selectedTools.some((t) => t.alat_id === tool.id)) return;
        setSelectedTools([...selectedTools, { alat_id: tool.id, nama: tool.nama, kode: tool.kode, stok: tool.stok_tersedia, jumlah: 1 }]);
    };

    const updateQty = (index: number, value: number) => {
        const copy = [...selectedTools];
        copy[index].jumlah = Math.min(Math.max(value, 1), copy[index].stok);
        setSelectedTools(copy);
    };

    const removeTool = (index: number) => {
        setSelectedTools(selectedTools.filter((_, i) => i !== index));
    };

    const submitTools = () => {
        if (selectedTools.length === 0) return;
        setCurrentStep(3);
    };

    const submit = async () => {
        const recaptchaToken = await getToken('peminjaman_buat');
        form.transform((data) => ({
            ...data,
            laboratorium_id: String(selectedLab),
            alat: selectedTools.map((t) => ({ alat_id: t.alat_id, jumlah: t.jumlah })),
            recaptcha_token: recaptchaToken ?? '',
        }));
        form.post('/dashboard/mahasiswa/peminjaman', { forceFormData: true });
    };

    const steps = [
        { key: '1', label: 'Pilih Lab', description: 'Pilih laboratorium' },
        { key: '2', label: 'Pilih Alat', description: 'Pilih alat yang dibutuhkan' },
        { key: '3', label: 'Detail', description: 'Isi detail peminjaman' },
        { key: '4', label: 'Konfirmasi', description: 'Review dan ajukan' },
    ];

    const selectedLabName = labs.find((l: Lab) => l.id === Number(selectedLab))?.nama ?? '-';
    const selectedDosenName = dosens.find((d: Dosen) => String(d.id) === form.data.dosen_pembimbing_id)?.nama_lengkap ?? '-';

    return (
        <>
            <Head title="Ajukan Peminjaman" />
            <h1 className="mb-6 text-2xl font-bold">Ajukan Peminjaman Baru</h1>
            <Stepper
                steps={steps}
                activeKey={String(currentStep)}
                onChange={(key) => {
                    const step = Number(key);
                    if (step < currentStep) setCurrentStep(step);
                }}
                className="mb-8"
            />

            {currentStep === 1 && (
                <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                    <h2 className="font-semibold">Pilih Laboratorium</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {labs.map((lab: Lab) => (
                            <button key={lab.id} onClick={() => setSelectedLab(lab.id)} className={`rounded-2xl border p-5 text-left transition ${selectedLab === lab.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200/80 hover:bg-slate-50 dark:border-slate-800/80 dark:hover:bg-slate-800'}`}>
                                <p className="font-semibold">{lab.nama}</p>
                            </button>
                        ))}
                    </div>
                    {form.errors.laboratorium_id && <p className="text-sm text-red-500">{form.errors.laboratorium_id}</p>}
                    <div className="flex justify-end">
                        <Button onClick={submitLab} disabled={!selectedLab} rightIcon={<CheckCircle className="h-4 w-4" />}>Lanjut</Button>
                    </div>
                </div>
            )}

            {currentStep === 2 && (
                <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                    <h2 className="font-semibold">Pilih Alat dari {selectedLabName}</h2>
                    {selectedTools.length > 0 && (
                        <div className="space-y-2">
                            {selectedTools.map((t, idx) => (
                                <div key={t.alat_id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                                    <span className="flex-1 text-sm font-medium">{t.nama}</span>
                                    <NumberStepper min={1} max={t.stok} value={t.jumlah} onChange={(v) => updateQty(idx, v)} size="sm" className="w-28" />
                                    <button onClick={() => removeTool(idx)} className="rounded-lg p-1 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                                </div>
                            ))}
                        </div>
                    )}
                    {toolsLoading ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonCard key={i} lines={2} className="h-32" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {tools.map((tool: ToolOption) => (
                                <button key={tool.id} onClick={() => addTool(tool)} disabled={selectedTools.some((t) => t.alat_id === tool.id)} className={`rounded-2xl border border-slate-200/80 p-4 text-left transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800/80 dark:hover:bg-slate-800 ${selectedTools.some((t) => t.alat_id === tool.id) ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                                    <div className="flex items-start gap-3">
                                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                                            {tool.foto_utama ? <ImageWithFallback src={`/storage/${tool.foto_utama}`} alt={tool.nama} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400"><FlaskConical className="h-5 w-5" /></div>}
                                        </div>
                                        <div>
                                            <p className="font-medium">{tool.nama}</p>
                                            <p className="text-xs text-slate-500">{tool.kategori_alat?.nama} | Tersedia: {tool.stok_tersedia} / {tool.stok_total}</p>
                                            <p className="text-xs text-slate-500">Kondisi: {kondisiAlatMap[tool.kondisi] ?? tool.kondisi}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                    {form.errors.alat && <p className="text-sm text-red-500">{form.errors.alat}</p>}
                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setCurrentStep(1)}>Kembali</Button>
                        <Button onClick={submitTools} disabled={selectedTools.length === 0} rightIcon={<CheckCircle className="h-4 w-4" />}>Lanjut</Button>
                    </div>
                </div>
            )}

            {currentStep === 3 && (
                <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                    <h2 className="font-semibold">Detail Peminjaman</h2>
                    <div>
                        <Select
                            label="Dosen Pembimbing *"
                            value={form.data.dosen_pembimbing_id}
                            onChange={(e) => form.setData('dosen_pembimbing_id', e.target.value)}
                            required
                            options={[
                                { value: '', label: 'Pilih Dosen' },
                                ...dosens.map((d: Dosen) => ({ value: String(d.id), label: d.nama_lengkap })),
                            ]}
                        />
                        {form.errors.dosen_pembimbing_id && <p className="text-sm text-red-500">{form.errors.dosen_pembimbing_id}</p>}
                    </div>
                    <Textarea
                        label="Tujuan *"
                        value={form.data.tujuan}
                        onChange={(e) => form.setData('tujuan', e.target.value)}
                        required
                        rows={3}
                        error={form.errors.tujuan}
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                        <DatePicker label="Tanggal Mulai *" value={form.data.tanggal_mulai} onChange={(e) => form.setData('tanggal_mulai', e.target.value)} required error={form.errors.tanggal_mulai} />
                        <TimePicker label="Jam Mulai *" value={form.data.jam_mulai} onChange={(e) => form.setData('jam_mulai', e.target.value)} required error={form.errors.jam_mulai} />
                        <DatePicker label="Tanggal Selesai *" value={form.data.tanggal_selesai} onChange={(e) => form.setData('tanggal_selesai', e.target.value)} required error={form.errors.tanggal_selesai} />
                        <TimePicker label="Jam Selesai *" value={form.data.jam_selesai} onChange={(e) => form.setData('jam_selesai', e.target.value)} required error={form.errors.jam_selesai} />
                    </div>
                    <FileUpload
                        label="File JSA (PDF, maks 15MB)"
                        value={form.data.file_jsa}
                        onChange={(file) => form.setData('file_jsa', file)}
                        accept=".pdf"
                        maxSizeMB={15}
                        error={form.errors.file_jsa}
                        hint="Unggah JSA untuk peminjaman alat berisiko"
                    />
                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setCurrentStep(2)}>Kembali</Button>
                        <Button onClick={() => setCurrentStep(4)} disabled={!form.data.dosen_pembimbing_id || !form.data.tujuan || !form.data.tanggal_mulai || !form.data.tanggal_selesai} rightIcon={<CheckCircle className="h-4 w-4" />}>Lanjut</Button>
                    </div>
                </div>
            )}

            {currentStep === 4 && (
                <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900">
                    <h2 className="font-semibold">Konfirmasi Peminjaman</h2>
                    <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Laboratorium:</span> {selectedLabName}</p>
                        <p><span className="font-medium">Dosen Pembimbing:</span> {selectedDosenName}</p>
                        <p><span className="font-medium">Tujuan:</span> {form.data.tujuan}</p>
                        <p><span className="font-medium">Waktu:</span> {formatDate(form.data.tanggal_mulai)} {form.data.jam_mulai} s/d {formatDate(form.data.tanggal_selesai)} {form.data.jam_selesai}</p>
                        <p><span className="font-medium">File JSA:</span> {form.data.file_jsa ? (form.data.file_jsa as File).name : '-'}</p>
                        <p className="font-medium">Alat Dipinjam:</p>
                        <ul className="list-disc pl-5">{selectedTools.map((t) => <li key={t.alat_id}>{t.nama} x {t.jumlah}</li>)}</ul>
                    </div>
                    {form.errors.alat && <p className="text-sm text-red-500">{form.errors.alat}</p>}
                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setCurrentStep(3)}>Kembali</Button>
                        <Button onClick={submit} isLoading={form.processing} leftIcon={<CheckCircle className="h-4 w-4" />}>Ajukan</Button>
                    </div>
                </div>
            )}
        </>
    );
}
