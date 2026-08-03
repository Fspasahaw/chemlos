<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengaturan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BackupController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Pengaturan::class);

        $files = collect(Storage::files('backups'))
            ->filter(fn ($f) => str_ends_with($f, '.sql'))
            ->map(fn ($f) => [
                'name' => basename($f),
                'path' => $f,
                'size' => $this->humanSize(Storage::size($f)),
                'created_at' => date('Y-m-d H:i:s', Storage::lastModified($f)),
            ])
            ->sortByDesc('created_at')
            ->values();

        return Inertia::render('Dashboard/Admin/Backup/Index', [
            'files' => $files,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manage', Pengaturan::class);

        $exitCode = Artisan::call('chemlos:backup-database');

        if ($exitCode !== 0) {
            return back()->with('error', 'Backup gagal dibuat.');
        }

        $this->enforceBackupLimit();

        $latest = $this->latestBackup();
        activity()
            ->causedBy(Auth::user())
            ->performedOn(Pengaturan::first())
            ->withProperties(['file' => $latest])
            ->log('Backup database dibuat' . ($latest ? ": {$latest}" : ''));

        return back()->with('success', 'Backup berhasil dibuat.');
    }

    public function restore(Request $request)
    {
        $this->authorize('manage', Pengaturan::class);

        $request->validate([
            'file' => ['required', 'file', 'mimetypes:text/plain,application/octet-stream,application/sql', 'extensions:sql'],
        ]);

        $uploaded = $request->file('file');
        $tempPath = $uploaded->storeAs('backups', 'restore-' . now()->format('YmdHis') . '.sql');
        $fullTemp = Storage::path($tempPath);

        $db = config('database.connections.mysql.database');
        $user = config('database.connections.mysql.username');
        $pass = config('database.connections.mysql.password');
        $host = config('database.connections.mysql.host');

        $mysql = $this->findMysql();
        if (! $mysql) {
            Storage::delete($tempPath);
            return back()->with('error', 'Program mysql tidak ditemukan. Pastikan MySQL Client/XAMPP terinstall.');
        }

        $command = sprintf(
            '%s -h %s -u %s %s %s < %s',
            escapeshellarg($mysql),
            escapeshellarg($host),
            escapeshellarg($user),
            $pass ? '-p' . escapeshellarg($pass) : '',
            escapeshellarg($db),
            escapeshellarg($fullTemp)
        );

        exec($command, $output, $return);

        Storage::delete($tempPath);

        if ($return !== 0) {
            return back()->with('error', 'Restore gagal. Pastikan file SQL valid dan sesuai database.');
        }

        activity()
            ->causedBy(Auth::user())
            ->performedOn(Pengaturan::first())
            ->withProperties(['file' => $uploaded->getClientOriginalName()])
            ->log('Database direstore dari file upload');

        return back()->with('success', 'Database berhasil direstore.');
    }

    public function download(string $file)
    {
        $this->authorize('viewAny', Pengaturan::class);

        $path = 'backups/' . basename($file);
        abort_if(! Storage::exists($path), 404);

        return Storage::download($path);
    }

    public function destroy(string $file)
    {
        $this->authorize('manage', Pengaturan::class);

        $path = 'backups/' . basename($file);
        if (Storage::exists($path)) {
            Storage::delete($path);
        }

        return back()->with('success', 'Backup dihapus.');
    }

    private function latestBackup(): ?string
    {
        $files = collect(Storage::files('backups'))
            ->filter(fn ($f) => str_ends_with($f, '.sql') && str_starts_with(basename($f), 'backup-'))
            ->sortByDesc(fn ($f) => Storage::lastModified($f))
            ->values();

        return $files->first() ? basename($files->first()) : null;
    }

    private function enforceBackupLimit(int $limit = 10): void
    {
        $files = collect(Storage::files('backups'))
            ->filter(fn ($f) => str_ends_with($f, '.sql') && str_starts_with(basename($f), 'backup-'))
            ->sortByDesc(fn ($f) => Storage::lastModified($f))
            ->values();

        if ($files->count() > $limit) {
            $files->slice($limit)->each(fn ($f) => Storage::delete($f));
        }
    }

    private function humanSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $u = 0;
        while ($bytes >= 1024 && $u < count($units) - 1) {
            $bytes /= 1024;
            $u++;
        }
        return round($bytes, 2) . ' ' . $units[$u];
    }

    private function findMysql(): ?string
    {
        $candidates = [
            'mysql',
            'C:\\xampp\\mysql\\bin\\mysql.exe',
            'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe',
            'C:\\Program Files (x86)\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe',
        ];

        foreach ($candidates as $candidate) {
            if ($candidate === 'mysql') {
                exec('where mysql 2>nul', $output, $return);
                if ($return === 0 && isset($output[0])) {
                    return trim($output[0]);
                }
                continue;
            }
            if (file_exists($candidate)) {
                return $candidate;
            }
        }

        return null;
    }
}
