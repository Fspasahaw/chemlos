<?php

namespace Database\Seeders;

use App\Models\Alat;
use App\Models\AlatDokumen;
use App\Models\AlatGaleri;
use App\Models\KategoriAlat;
use App\Models\Laboratorium;
use Database\Seeders\Helpers\DemoAssetHelper;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AlatSeeder extends Seeder
{
    public function run(): void
    {
        $labs = [
            'Lab. Bioproses' => 'BIO',
            'Lab. Rekayasa Produk Kimia' => 'RPK',
            'Lab. Teknologi Intensifikasi Proses' => 'TIP',
            'Lab. Sistem Proses dan Energi Berkelanjutan' => 'SPEB',
            'Lab. Rekayasa Sistem Proses' => 'RSP',
        ];

        $kategoriMap = [
            'Analisis dan Instrumentasi' => KategoriAlat::where('slug', 'analisis-dan-instrumentasi')->first()?->id,
            'Reaktor dan Pencampur' => KategoriAlat::where('slug', 'reaktor-dan-pencampur')->first()?->id,
            'Pemisahan dan Filtrasi' => KategoriAlat::where('slug', 'pemisahan-dan-filtrasi')->first()?->id,
            'Pengukuran dan Kontrol' => KategoriAlat::where('slug', 'pengukuran-dan-kontrol')->first()?->id,
            'Keamanan dan K3' => KategoriAlat::where('slug', 'keamanan-dan-k3')->first()?->id,
            'Material dan Bahan' => KategoriAlat::where('slug', 'material-dan-bahan')->first()?->id,
        ];

        $templates = [
            'Analisis dan Instrumentasi' => [
                ['nama' => 'Spektrofotometer UV-Vis', 'spesifikasi' => ['Merek' => 'Shimadzu', 'Model' => 'UV-1800', 'Rentang Gelombang' => '190-1100 nm', 'Resolusi' => '1 nm'], 'stok' => 1],
                ['nama' => 'pH Meter Digital', 'spesifikasi' => ['Merek' => 'Hach', 'Rentang' => '0-14 pH', 'Akurasi' => '±0.01 pH', 'Suhu' => '0-100 °C'], 'stok' => 4],
                ['nama' => 'HPLC System', 'spesifikasi' => ['Merek' => 'Agilent', 'Model' => '1260 Infinity II', 'Tekanan Maks' => '600 bar', 'Detektor' => 'DAD'], 'stok' => 1],
                ['nama' => 'TOC Analyzer', 'spesifikasi' => ['Merek' => 'Shimadzu', 'Rentang' => '4 ppb - 30000 ppm', 'Metode' => 'Combustion'], 'stok' => 1],
                ['nama' => 'Konduktivitas Meter', 'spesifikasi' => ['Merek' => 'Mettler Toledo', 'Rentang' => '0.01 µS/cm - 1000 mS/cm', 'Akurasi' => '±0.5%'], 'stok' => 3],
            ],
            'Reaktor dan Pencampur' => [
                ['nama' => 'Reaktor Batch 5 L', 'spesifikasi' => ['Volume' => '5 L', 'Material' => 'Stainless Steel 316', 'Pengaduk' => 'Rushton Turbine', 'Suhu Maks' => '200 °C'], 'stok' => 1],
                ['nama' => 'Reaktor Batch 10 L', 'spesifikasi' => ['Volume' => '10 L', 'Material' => 'Glass Lined', 'Pengaduk' => 'Pitched Blade', 'Suhu Maks' => '150 °C'], 'stok' => 1],
                ['nama' => 'Fermentor Bench Scale', 'spesifikasi' => ['Volume' => '7 L', 'Kontrol' => 'pH & DO', 'Sterilisasi' => 'In-situ', 'Aerasi' => '0-10 LPM'], 'stok' => 2],
                ['nama' => 'Reaktor Plug Flow', 'spesifikasi' => ['Volume' => '1 L', 'Material' => 'Borosilicate Glass', 'Diameter' => '2.5 cm', 'Panjang' => '2 m'], 'stok' => 1],
                ['nama' => 'Tangki Pengaduk Mekanik', 'spesifikasi' => ['Volume' => '50 L', 'Material' => 'SS 304', 'Pengaduk' => 'Anchor', 'Kecepatan' => '0-300 RPM'], 'stok' => 1],
            ],
            'Pemisahan dan Filtrasi' => [
                ['nama' => 'Filter Press Laboratorium', 'spesifikasi' => ['Ukuran' => '15 cm', 'Jumlah Plate' => '6', 'Tekanan Maks' => '5 bar', 'Material' => 'PP'], 'stok' => 2],
                ['nama' => 'Sentrifuge Benchtop', 'spesifikasi' => ['Merek' => 'Eppendorf', 'Kecepatan' => '15000 RPM', 'Kapasitas' => '6x50 mL', 'RCF' => '21000 xg'], 'stok' => 2],
                ['nama' => 'Kromatografi Kolom', 'spesifikasi' => ['Diameter' => '5 cm', 'Panjang' => '60 cm', 'Material' => 'Borosilicate Glass'], 'stok' => 2],
                ['nama' => 'Rotary Evaporator', 'spesifikasi' => ['Merek' => 'Buchi', 'Volume' => '1 L', 'Suhu' => '20-180 °C', 'Kecepatan' => '20-280 RPM'], 'stok' => 2],
                ['nama' => 'Ultrafiltrasi Unit', 'spesifikasi' => ['MWCO' => '10 kDa', 'Material Membran' => 'PES', 'Tekanan Maks' => '4 bar'], 'stok' => 1],
            ],
            'Pengukuran dan Kontrol' => [
                ['nama' => 'Termokopel Digital', 'spesifikasi' => ['Tipe' => 'K', 'Rentang' => '-200 s/d 1260 °C', 'Akurasi' => '±1.5 °C'], 'stok' => 5],
                ['nama' => 'Flow Meter Coriolis', 'spesifikasi' => ['Merek' => 'Endress+Hauser', 'Rentang' => '0.1 - 100 kg/h', 'Akurasi' => '±0.1%'], 'stok' => 1],
                ['nama' => 'Pressure Transmitter', 'spesifikasi' => ['Merek' => 'Wika', 'Rentang' => '0-10 bar', 'Output' => '4-20 mA'], 'stok' => 3],
                ['nama' => 'Level Sensor Ultrasonik', 'spesifikasi' => ['Rentang' => '0.3 - 5 m', 'Output' => '4-20 mA', 'Material' => 'PVDF'], 'stok' => 2],
                ['nama' => 'PID Controller', 'spesifikasi' => ['Merek' => 'Omron', 'Input' => 'Universal', 'Output' => 'Relay/SSR'], 'stok' => 3],
                ['nama' => 'Data Acquisition System', 'spesifikasi' => ['Channel' => '32 AI / 8 AO', 'Sampling' => '100 kS/s', 'Interface' => 'USB/Ethernet'], 'stok' => 1],
            ],
            'Keamanan dan K3' => [
                ['nama' => 'Gas Detector 4 in 1', 'spesifikasi' => ['Sensor' => 'O2, LEL, H2S, CO', 'Rentang' => '0-100% LEL', 'Alarm' => 'Visual & Audio'], 'stok' => 3],
                ['nama' => 'Fume Hood Portable', 'spesifikasi' => ['Dimensi' => '120x60x120 cm', 'Material' => 'PP', 'Exhaust' => '200 CFM'], 'stok' => 1],
                ['nama' => 'Safety Cabinet', 'spesifikasi' => ['Kapasitas' => '45 Gal', 'Material' => 'Steel', 'Vent' => '2x', 'Lock' => 'Paddle'], 'stok' => 2],
            ],
            'Material dan Bahan' => [
                ['nama' => 'Hot Plate Magnetic Stirrer', 'spesifikasi' => ['Merek' => 'Thermo Fisher', 'Suhu Maks' => '540 °C', 'Kecepatan' => '50-1500 RPM'], 'stok' => 5],
                ['nama' => 'Analytical Balance', 'spesifikasi' => ['Merek' => 'Mettler Toledo', 'Kapasitas' => '220 g', 'Akurasi' => '0.1 mg'], 'stok' => 2],
                ['nama' => 'Beaker Glass 250 mL', 'spesifikasi' => ['Material' => 'Borosilicate Glass', 'Volume' => '250 mL', 'Pack' => '12 pcs'], 'stok' => 10],
            ],
        ];

        $labSpecific = [
            'Lab. Bioproses' => ['Fermentor Bench Scale', 'pH Meter Digital', 'Konduktivitas Meter', 'Sentrifuge Benchtop', 'Hot Plate Magnetic Stirrer'],
            'Lab. Rekayasa Produk Kimia' => ['HPLC System', 'Reaktor Batch 10 L', 'Filter Press Laboratorium', 'Pressure Transmitter', 'Safety Cabinet'],
            'Lab. Teknologi Intensifikasi Proses' => ['Reaktor Plug Flow', 'Flow Meter Coriolis', 'Ultrafiltrasi Unit', 'Data Acquisition System', 'TOC Analyzer'],
            'Lab. Sistem Proses dan Energi Berkelanjutan' => ['Reaktor Batch 5 L', 'Termokopel Digital', 'Pressure Transmitter', 'Kromatografi Kolom', 'Rotary Evaporator'],
            'Lab. Rekayasa Sistem Proses' => ['Spektrofotometer UV-Vis', 'PID Controller', 'pH Meter Digital', 'Filter Press Laboratorium', 'Analytical Balance'],
        ];

        foreach ($labs as $labName => $prefix) {
            $lab = Laboratorium::where('nama', $labName)->first();
            if (! $lab) {
                continue;
            }

            $specificNames = $labSpecific[$labName] ?? [];
            $counter = 1;

            foreach ($specificNames as $templateName) {
                $template = null;
                foreach ($templates as $catName => $items) {
                    foreach ($items as $item) {
                        if ($item['nama'] === $templateName) {
                            $template = $item;
                            $template['kategori'] = $catName;
                            break 2;
                        }
                    }
                }

                if (! $template) {
                    continue;
                }

                $kode = 'ALAT-' . $prefix . '-' . str_pad((string) $counter, 3, '0', STR_PAD_LEFT);
                $slug = Str::slug($lab->slug . '-' . $template['nama'] . '-' . $counter);
                $stok = $template['stok'] ?? 1;

                $fotoUtama = DemoAssetHelper::image("demo/alat/{$slug}/utama.jpg", 800, 600, $template['nama']);

                $alat = Alat::updateOrCreate(
                    ['kode' => $kode],
                    [
                        'nama' => $template['nama'],
                        'slug' => $slug,
                        'laboratorium_id' => $lab->id,
                        'kategori_id' => $kategoriMap[$template['kategori']] ?? null,
                        'deskripsi' => $template['nama'] . ' milik ' . $labName . ' untuk keperluan praktikum dan penelitian.',
                        'spesifikasi' => $template['spesifikasi'] ?? [],
                        'kondisi' => 'baik',
                        'stok_total' => $stok,
                        'stok_tersedia' => $stok,
                        'stok_reserved' => 0,
                        'stok_dipinjam' => 0,
                        'stok_maintenance' => 0,
                        'persyaratan_khusus' => 'Wajib dalam kondisi bersih dan kering saat dikembalikan.',
                        'pelatihan_wajib' => in_array($template['kategori'], ['Analisis dan Instrumentasi', 'Pengukuran dan Kontrol'], true),
                        'foto_utama' => $fotoUtama,
                        'qr_kode_path' => DemoAssetHelper::qr("demo/alat/{$slug}/qr.png", url('/alat/' . $slug)),
                    ]
                );

                for ($i = 1; $i <= 3; $i++) {
                    AlatGaleri::updateOrCreate(
                        ['alat_id' => $alat->id, 'file' => "demo/alat/{$slug}/galeri-{$i}.jpg"],
                        ['judul' => "Foto {$i} - {$template['nama']}", 'urutan' => $i]
                    );
                    DemoAssetHelper::image("demo/alat/{$slug}/galeri-{$i}.jpg", 800, 600, "Galeri {$i}");
                }

                AlatDokumen::updateOrCreate(
                    ['alat_id' => $alat->id, 'judul' => 'Manual Penggunaan ' . $template['nama']],
                    ['jenis' => 'manual', 'file' => DemoAssetHelper::pdf("demo/alat/{$slug}/manual.pdf", 'Manual ' . $template['nama'])]
                );

                if ($alat->pelatihan_wajib) {
                    AlatDokumen::updateOrCreate(
                        ['alat_id' => $alat->id, 'judul' => 'SOP Penggunaan ' . $template['nama']],
                        ['jenis' => 'sop', 'file' => DemoAssetHelper::pdf("demo/alat/{$slug}/sop.pdf", 'SOP ' . $template['nama'])]
                    );
                }

                $counter++;
            }
        }
    }
}
