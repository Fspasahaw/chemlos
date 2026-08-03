<?php

namespace Database\Seeders;

use App\Models\ProgramStudi;
use Illuminate\Database\Seeder;

class ProgramStudiSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['nama' => 'Teknik Kimia', 'jenjang' => 'S1', 'kode' => '45201', 'status' => 'aktif', 'deskripsi' => 'Program Studi Sarjana Teknik Kimia, Fakultas Teknik, Universitas Indonesia.'],
            ['nama' => 'Teknik Kimia', 'jenjang' => 'S2', 'kode' => '45202', 'status' => 'aktif', 'deskripsi' => 'Program Studi Magister Teknik Kimia.'],
            ['nama' => 'Teknik Kimia', 'jenjang' => 'S3', 'kode' => '45203', 'status' => 'aktif', 'deskripsi' => 'Program Studi Doktor Teknik Kimia.'],
            ['nama' => 'Teknik Bioproses', 'jenjang' => 'S1', 'kode' => '45601', 'status' => 'aktif', 'deskripsi' => 'Program Studi Sarjana Teknik Bioproses.'],
            ['nama' => 'Teknik Bioproses', 'jenjang' => 'S2', 'kode' => '45602', 'status' => 'aktif', 'deskripsi' => 'Program Studi Magister Teknik Bioproses.'],
        ];

        foreach ($items as $item) {
            ProgramStudi::updateOrCreate(['kode' => $item['kode']], $item);
        }
    }
}
