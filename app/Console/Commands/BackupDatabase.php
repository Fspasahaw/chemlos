<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class BackupDatabase extends Command
{
    protected $signature = 'chemlos:backup-database';

    protected $description = 'Membuat backup SQL database ke storage/app/backups';

    public function handle(): int
    {
        $db = config('database.connections.mysql.database');
        $user = config('database.connections.mysql.username');
        $pass = config('database.connections.mysql.password');
        $host = config('database.connections.mysql.host');
        $filename = 'backup-' . now()->format('Y-m-d-H-i-s') . '.sql';
        $dir = Storage::path('backups');
        $path = $dir . DIRECTORY_SEPARATOR . $filename;

        Storage::makeDirectory('backups');

        $mysqldump = $this->findMysqldump();

        if (! $mysqldump) {
            $this->error('mysqldump tidak ditemukan. Pastikan MySQL Client/XAMPP terinstall.');
            return self::FAILURE;
        }

        $command = sprintf(
            '%s -h %s -u %s %s %s > %s',
            escapeshellarg($mysqldump),
            escapeshellarg($host),
            escapeshellarg($user),
            $pass ? '-p' . escapeshellarg($pass) : '',
            escapeshellarg($db),
            escapeshellarg($path)
        );

        exec($command, $output, $return);

        if ($return !== 0) {
            if (file_exists($path)) {
                @unlink($path);
            }
            $this->error('Backup gagal.');
            return self::FAILURE;
        }

        $this->info("Backup tersimpan di {$path}");
        return self::SUCCESS;
    }

    private function findMysqldump(): ?string
    {
        $candidates = [
            'mysqldump',
            'C:\\xampp\\mysql\\bin\\mysqldump.exe',
            'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe',
            'C:\\Program Files (x86)\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe',
        ];

        foreach ($candidates as $candidate) {
            if ($candidate === 'mysqldump') {
                exec('where mysqldump 2>nul', $output, $return);
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
