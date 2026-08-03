<?php

namespace App\Console\Commands;

use App\Models\Alat;
use App\Models\Laboratorium;
use Database\Seeders\Helpers\DemoAssetHelper;
use Illuminate\Console\Command;

class RegenerateDemoImages extends Command
{
    protected $signature = 'demo:regenerate-images';

    protected $description = 'Regenerate demo placeholder images for existing alat and laboratorium';

    public function handle(): int
    {
        $disk = DemoAssetHelper::disk();

        foreach (Alat::all() as $alat) {
            $slug = $alat->slug;
            $base = "demo/alat/{$slug}";

            $fotoUtama = DemoAssetHelper::image("{$base}/utama.jpg", 800, 600, $alat->nama);
            $alat->update(['foto_utama' => $fotoUtama]);

            DemoAssetHelper::qr("{$base}/qr.png", url('/alat/' . $slug));

            for ($i = 1; $i <= 3; $i++) {
                DemoAssetHelper::image("{$base}/galeri-{$i}.jpg", 800, 600, $alat->nama);
            }

            $this->info("Regenerated images for alat: {$alat->nama}");
        }

        foreach (Laboratorium::all() as $lab) {
            $slug = $lab->slug;
            $base = "demo/laboratorium/{$slug}";

            $fotoUtama = DemoAssetHelper::image("{$base}/utama.jpg", 1200, 800, $lab->nama);
            $lab->update(['foto_utama' => $fotoUtama]);

            for ($i = 1; $i <= 5; $i++) {
                DemoAssetHelper::image("{$base}/galeri-{$i}.jpg", 1200, 800, $lab->nama);
            }

            $this->info("Regenerated images for lab: {$lab->nama}");
        }

        $this->info('Done.');

        return self::SUCCESS;
    }
}
