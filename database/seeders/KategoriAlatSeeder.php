<?php

namespace Database\Seeders;

use App\Models\KategoriAlat;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class KategoriAlatSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['nama' => 'Analisis dan Instrumentasi', 'deskripsi' => 'Alat analisis dan instrumentasi laboratorium.'],
            ['nama' => 'Reaktor dan Pencampur', 'deskripsi' => 'Reaktor, tangki, dan peralatan pencampur.'],
            ['nama' => 'Pemisahan dan Filtrasi', 'deskripsi' => 'Alat pemisahan, filtrasi, dan sentrifugasi.'],
            ['nama' => 'Pengukuran dan Kontrol', 'deskripsi' => 'Sensor, termokopel, flow meter, dan kontrol proses.'],
            ['nama' => 'Keamanan dan K3', 'deskripsi' => 'Alat keselamatan kerja, APD, dan deteksi gas.'],
            ['nama' => 'Material dan Bahan', 'deskripsi' => 'Gelas kimia dan peralatan umum laboratorium.'],
        ];

        foreach ($items as $item) {
            $slug = Str::slug($item['nama']);
            KategoriAlat::updateOrCreate(
                ['slug' => $slug],
                [
                    'nama' => $item['nama'],
                    'kode' => strtoupper(Str::substr(str_replace(' ', '', $item['nama']), 0, 5)),
                    'deskripsi' => $item['deskripsi'],
                    'status' => 'aktif',
                ]
            );
        }
    }
}
