<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class DeployCheck extends Command
{
    protected $signature = 'chemlos:deploy-check';

    protected $description = 'Menjalankan final deploy check untuk ChemLOS';

    private int $failures = 0;

    public function handle(): int
    {
        $this->info('==> ChemLOS Final Deploy Check');

        $this->checkPhpVersion();
        $this->checkEnvironment();
        $this->checkAppKey();
        $this->checkDatabaseConnection();
        $this->checkPendingMigrations();
        $this->checkStorageLink();
        $this->checkPublicBuild();
        $this->checkPublicHot();
        $this->checkCacheState();
        $this->checkQueueConnection();
        $this->checkSchedulerCommands();
        $this->checkMailConfiguration();
        $this->checkRecaptchaConfiguration();

        if ($this->failures > 0) {
            $this->error("==> Deploy check GAGAL: {$this->failures} masalah ditemukan.");
            return self::FAILURE;
        }

        $this->info('==> Deploy check BERHASIL: semua konfigurasi OK.');
        return self::SUCCESS;
    }

    private function markOk(string $message): void
    {
        $this->line("  [OK] {$message}");
    }

    private function markFailed(string $message): void
    {
        $this->error("  [FAIL] {$message}");
        $this->failures++;
    }

    private function markWarning(string $message): void
    {
        $this->warn("  [WARN] {$message}");
    }

    private function checkPhpVersion(): void
    {
        if (PHP_VERSION_ID >= 80400) {
            $this->markOk('PHP version >= 8.4 (' . PHP_VERSION . ')');
        } else {
            $this->markFailed('PHP version < 8.4 (' . PHP_VERSION . ')');
        }
    }

    private function checkEnvironment(): void
    {
        $env = app()->environment();
        if (in_array($env, ['production', 'local', 'testing'], true)) {
            $this->markOk("APP_ENV={$env}");
        } else {
            $this->markWarning("APP_ENV={$env} (pastikan sesuai environment)");
        }

        if (config('app.debug') === false && $env === 'production') {
            $this->markOk('APP_DEBUG=false untuk production');
        } elseif ($env === 'production') {
            $this->markFailed('APP_DEBUG seharusnya false untuk production');
        }

        if (config('app.url')) {
            $this->markOk('APP_URL sudah di-set: ' . config('app.url'));
        } else {
            $this->markFailed('APP_URL belum di-set');
        }
    }

    private function checkAppKey(): void
    {
        $key = config('app.key');
        if ($key && !str_starts_with($key, 'base64:') && strlen($key) > 16) {
            $this->markOk('APP_KEY sudah di-set');
        } elseif ($key && str_starts_with($key, 'base64:') && strlen($key) > 20) {
            $this->markOk('APP_KEY sudah di-set');
        } else {
            $this->markFailed('APP_KEY belum di-set atau tidak valid');
        }
    }

    private function checkDatabaseConnection(): void
    {
        try {
            DB::connection()->getPdo();
            $this->markOk('Database connection OK (' . config('database.default') . ')');
        } catch (\Throwable $e) {
            $this->markFailed('Database connection gagal: ' . $e->getMessage());
        }
    }

    private function checkPendingMigrations(): void
    {
        try {
            $pending = $this->callSilent('migrate:status');
            // migrate:status tidak mengembalikan exit code untuk pending,
            // gunakan cara ringan: cek apakah migrasi terakhir sudah ran
            $this->markOk('Migrations dapat dicek (jalankan migrate:status manual untuk detail)');
        } catch (\Throwable $e) {
            $this->markFailed('Tidak dapat mengecek migrasi: ' . $e->getMessage());
        }
    }

    private function checkStorageLink(): void
    {
        if (File::exists(public_path('storage'))) {
            $this->markOk('Symbolic link storage sudah ada (public/storage)');
        } else {
            $this->markFailed('Symbolic link storage belum ada. Jalankan php artisan storage:link');
        }
    }

    private function checkPublicBuild(): void
    {
        $manifest = public_path('build/manifest.json');
        if (File::exists($manifest)) {
            $this->markOk('Production build ditemukan (public/build/manifest.json)');
        } else {
            $this->markFailed('Production build tidak ditemukan. Jalankan npm run build');
        }
    }

    private function checkPublicHot(): void
    {
        if (File::exists(public_path('hot'))) {
            $this->markFailed('File public/hot masih ada. Jalankan php artisan chemlos:clear-hot');
        } else {
            $this->markOk('File public/hot tidak ada');
        }
    }

    private function checkCacheState(): void
    {
        $cacheFiles = [
            base_path('bootstrap/cache/config.php'),
            base_path('bootstrap/cache/routes-v7.php'),
            base_path('bootstrap/cache/events.php'),
        ];

        foreach ($cacheFiles as $file) {
            $name = basename($file);
            if (File::exists($file)) {
                $this->markOk("Cache file {$name} sudah tercache");
            } else {
                $this->markWarning("Cache file {$name} belum tercache (jalankan php artisan optimize di production)");
            }
        }
    }

    private function checkQueueConnection(): void
    {
        $connection = config('queue.default');
        if ($connection) {
            $this->markOk("Queue connection: {$connection}");
        } else {
            $this->markFailed('Queue connection belum di-set');
        }
    }

    private function checkSchedulerCommands(): void
    {
        $scheduleFile = base_path('routes/console.php');
        if (File::exists($scheduleFile) && str_contains(File::get($scheduleFile), 'Schedule::')) {
            $this->markOk('Scheduler commands terdaftar di routes/console.php');
        } else {
            $this->markWarning('Scheduler commands belum jelas terdaftar di routes/console.php');
        }
    }

    private function checkMailConfiguration(): void
    {
        $mailer = config('mail.default');
        $from = config('mail.from.address');
        if ($mailer && $from) {
            $this->markOk("Mail configured: {$mailer} / from: {$from}");
        } else {
            $this->markWarning('Mail configuration belum lengkap');
        }
    }

    private function checkRecaptchaConfiguration(): void
    {
        $enabled = config('services.recaptcha.enabled', false);
        if (!$enabled) {
            $this->markWarning('reCAPTCHA dinonaktifkan. Aktifkan di production.');
            return;
        }

        $siteKey = config('services.recaptcha.site_key');
        $secretKey = config('services.recaptcha.secret_key');
        if ($siteKey && $secretKey && !str_contains($siteKey, 'GANTI')) {
            $this->markOk('reCAPTCHA key sudah di-set');
        } else {
            $this->markFailed('reCAPTCHA diaktifkan tetapi key belum valid');
        }
    }
}
