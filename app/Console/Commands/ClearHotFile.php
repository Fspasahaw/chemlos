<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ClearHotFile extends Command
{
    protected $signature = 'chemlos:clear-hot';

    protected $description = 'Menghapus file public/hot yang tersisa agar Laravel tidak merujuk Vite dev server';

    public function handle(): int
    {
        $hotPath = public_path('hot');

        if (File::exists($hotPath)) {
            File::delete($hotPath);
            $this->info('File public/hot berhasil dihapus.');
        } else {
            $this->info('Tidak ada file public/hot.');
        }

        return self::SUCCESS;
    }
}
