<?php

namespace Database\Seeders;

use App\Models\Alat;
use App\Models\VideoTutorial;
use Database\Seeders\Helpers\DemoAssetHelper;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class VideoTutorialSeeder extends Seeder
{
    public function run(): void
    {
        // 2 tutorial aplikasi
        $appTutorials = [
            ['judul' => 'Cara Mendaftar di ChemLOS', 'deskripsi' => 'Panduan lengkap pendaftaran akun mahasiswa dan dosen di ChemLOS.', 'durasi' => 180],
            ['judul' => 'Cara Mengajukan Peminjaman Alat', 'deskripsi' => 'Langkah-langkah mengajukan peminjaman alat laboratorium.', 'durasi' => 240],
        ];

        foreach ($appTutorials as $index => $t) {
            $slug = Str::slug('tutorial-aplikasi-' . $t['judul']);
            VideoTutorial::updateOrCreate(
                ['slug' => $slug],
                [
                    'judul' => $t['judul'],
                    'deskripsi' => $t['deskripsi'],
                    'jenis' => 'aplikasi',
                    'sumber' => 'youtube',
                    'url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                    'file' => null,
                    'thumbnail' => DemoAssetHelper::image("demo/tutorials/{$slug}.jpg", 640, 360, $t['judul']),
                    'durasi' => $t['durasi'],
                    'alat_id' => null,
                    'status' => 'aktif',
                ]
            );
        }

        // 3 tutorial alat (satu per laboratorium utama)
        $featuredAlats = Alat::with('laboratorium')->inRandomOrder()->limit(3)->get();

        foreach ($featuredAlats as $index => $alat) {
            $judul = "Panduan Penggunaan {$alat->nama}";
            $slug = Str::slug('tutorial-alat-' . $alat->kode);

            VideoTutorial::updateOrCreate(
                ['slug' => $slug],
                [
                    'judul' => $judul,
                    'deskripsi' => 'Video tutorial penggunaan dan perawatan ' . $alat->nama . ' di ' . $alat->laboratorium?->nama . '.',
                    'jenis' => 'alat',
                    'sumber' => 'youtube',
                    'url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                    'file' => null,
                    'thumbnail' => DemoAssetHelper::image("demo/tutorials/{$slug}.jpg", 640, 360, $alat->nama),
                    'durasi' => rand(120, 600),
                    'alat_id' => $alat->id,
                    'status' => 'aktif',
                ]
            );
        }
    }
}
