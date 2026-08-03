import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Download, HardDriveDownload, RotateCcw, Upload } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/Components/Card';
import { ConfirmDeleteButton } from '@/Components/ConfirmDeleteButton';
import Modal from '@/Components/Modal';
import { Tooltip } from '@/Components/Tooltip';
import { EmptyTable } from '../../../../Components/EmptyTable';

export default function Index() {
    const { files } = usePage().props as any;
    const { processing: backupProcessing, post } = useForm();
    const { data: restoreData, setData: setRestoreData, post: postRestore, processing: restoreProcessing, reset: resetRestore, errors: restoreErrors } = useForm({ file: null as File | null });
    const [restoreOpen, setRestoreOpen] = useState(false);

    const createBackup = () => post('/dashboard/admin/backup');

    const handleRestore = (e: React.FormEvent) => {
        e.preventDefault();
        postRestore('/dashboard/admin/backup/restore', {
            onSuccess: () => {
                setRestoreOpen(false);
                resetRestore();
            },
        });
    };

    return (
        <>
            <Head title="Backup Database" />
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Backup Database</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Maksimal 10 backup terbaru tersimpan.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setRestoreOpen(true)}
                        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                    >
                        <RotateCcw className="h-4 w-4" /> Restore
                    </button>
                    <button
                        onClick={createBackup}
                        disabled={backupProcessing}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-70"
                    >
                        <HardDriveDownload className="h-4 w-4" />
                        {backupProcessing ? 'Membuat Backup...' : 'Buat Backup Sekarang'}
                    </button>
                </div>
            </div>

            <Card>
                <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Nama File</th>
                                <th className="px-4 py-3 text-left font-semibold">Ukuran</th>
                                <th className="px-4 py-3 text-left font-semibold">Dibuat</th>
                                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.length === 0 ? (
                                <EmptyTable colSpan={4} message="Belum ada backup." />
                            ) : files.map((f: any) => (
                                <tr key={f.path} className="border-t border-slate-200/80 dark:border-slate-800/80">
                                    <td className="px-4 py-3 font-medium">{f.name}</td>
                                    <td className="px-4 py-3">{f.size}</td>
                                    <td className="px-4 py-3">{f.created_at}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Tooltip content="Unduh">
                                                <a href={`/dashboard/admin/backup/${encodeURIComponent(f.name)}/download`} className="inline-flex rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Unduh">
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </Tooltip>
                                            <ConfirmDeleteButton
                                                onDelete={() => router.delete(`/dashboard/admin/backup/${encodeURIComponent(f.name)}`)}
                                                description={`Hapus backup ${f.name}?`}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal open={restoreOpen} onClose={() => setRestoreOpen(false)} title="Restore Database">
                <form onSubmit={handleRestore} className="space-y-4">
                    <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
                        Perhatian: Restore akan menimpa seluruh data database saat ini dengan isi file SQL yang diupload.
                    </p>
                    <div>
                        <label className="mb-1 block text-sm font-medium">File SQL Backup</label>
                        <input
                            type="file"
                            accept=".sql"
                            onChange={(e) => setRestoreData('file', e.target.files?.[0] ?? null)}
                            className="w-full text-sm"
                        />
                        {restoreErrors.file && <p className="mt-1 text-xs text-rose-600">{restoreErrors.file}</p>}
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setRestoreOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Batal</button>
                        <button type="submit" disabled={restoreProcessing || !restoreData.file} className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-70"><Upload className="h-4 w-4" /> {restoreProcessing ? 'Merestore...' : 'Restore'}</button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
