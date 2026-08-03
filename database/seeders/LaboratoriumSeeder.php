<?php

namespace Database\Seeders;

use App\Models\Laboratorium;
use App\Models\LaboratoriumDokumen;
use App\Models\LaboratoriumGaleri;
use App\Models\LaboratoriumTataTertib;
use Database\Seeders\Helpers\DemoAssetHelper;
use Illuminate\Database\Seeder;

class LaboratoriumSeeder extends Seeder
{
    public function run(): void
    {
        $labs = [
            [
                'nama' => 'Lab. Bioproses',
                'kode' => 'LAB-BIO',
                'slug' => 'lab-bioproses',
                'deskripsi' => 'Laboratorium untuk kegiatan proses biokimia, fermentasi, dan pengolahan produk hayati.',
                'lokasi' => 'Gedung K, Lantai 2, Ruang K-201',
                'gedung' => 'Gedung K',
                'lantai' => '2',
                'ruangan' => 'K-201',
                'kapasitas' => 30,
                'jam_buka' => '08:00:00',
                'jam_tutup' => '16:00:00',
                'hari_operasional' => ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
                'email' => 'lab.bioproses@che.ui.ac.id',
                'telepon' => '021-7867222',
                'status' => 'aktif',
            ],
            [
                'nama' => 'Lab. Rekayasa Produk Kimia',
                'kode' => 'LAB-RPK',
                'slug' => 'lab-rekayasa-produk-kimia',
                'deskripsi' => 'Laboratorium pengembangan produk kimia, formulasi, dan karakterisasi material.',
                'lokasi' => 'Gedung K, Lantai 2, Ruang K-205',
                'gedung' => 'Gedung K',
                'lantai' => '2',
                'ruangan' => 'K-205',
                'kapasitas' => 25,
                'jam_buka' => '08:00:00',
                'jam_tutup' => '16:00:00',
                'hari_operasional' => ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
                'email' => 'lab.rpk@che.ui.ac.id',
                'telepon' => '021-7867223',
                'status' => 'aktif',
            ],
            [
                'nama' => 'Lab. Teknologi Intensifikasi Proses',
                'kode' => 'LAB-TIP',
                'slug' => 'lab-teknologi-intensifikasi-proses',
                'deskripsi' => 'Laboratorium riset intensifikasi proses kimia dan reaktor mikro.',
                'lokasi' => 'Gedung K, Lantai 3, Ruang K-301',
                'gedung' => 'Gedung K',
                'lantai' => '3',
                'ruangan' => 'K-301',
                'kapasitas' => 20,
                'jam_buka' => '08:00:00',
                'jam_tutup' => '16:00:00',
                'hari_operasional' => ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
                'email' => 'lab.tip@che.ui.ac.id',
                'telepon' => '021-7867224',
                'status' => 'aktif',
            ],
            [
                'nama' => 'Lab. Sistem Proses dan Energi Berkelanjutan',
                'kode' => 'LAB-SPEB',
                'slug' => 'lab-sistem-proses-dan-energi-berkelanjutan',
                'deskripsi' => 'Laboratorium simulasi, optimasi proses, dan teknologi energi berkelanjutan.',
                'lokasi' => 'Gedung K, Lantai 3, Ruang K-305',
                'gedung' => 'Gedung K',
                'lantai' => '3',
                'ruangan' => 'K-305',
                'kapasitas' => 20,
                'jam_buka' => '08:00:00',
                'jam_tutup' => '16:00:00',
                'hari_operasional' => ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
                'email' => 'lab.speb@che.ui.ac.id',
                'telepon' => '021-7867225',
                'status' => 'aktif',
            ],
            [
                'nama' => 'Lab. Rekayasa Sistem Proses',
                'kode' => 'LAB-RSP',
                'slug' => 'lab-rekayasa-sistem-proses',
                'deskripsi' => 'Laboratorium perancangan sistem proses kimia, kontrol, dan instrumentasi.',
                'lokasi' => 'Gedung K, Lantai 3, Ruang K-309',
                'gedung' => 'Gedung K',
                'lantai' => '3',
                'ruangan' => 'K-309',
                'kapasitas' => 25,
                'jam_buka' => '08:00:00',
                'jam_tutup' => '16:00:00',
                'hari_operasional' => ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
                'email' => 'lab.rsp@che.ui.ac.id',
                'telepon' => '021-7867226',
                'status' => 'aktif',
            ],
        ];

        foreach ($labs as $index => $data) {
            $lab = Laboratorium::updateOrCreate(['kode' => $data['kode']], $data);

            $fotoUtama = DemoAssetHelper::image("demo/laboratorium/{$lab->slug}/utama.jpg", 1200, 800, $lab->nama);
            $lab->update(['foto_utama' => $fotoUtama]);

            for ($i = 1; $i <= 5; $i++) {
                LaboratoriumGaleri::updateOrCreate(
                    ['laboratorium_id' => $lab->id, 'file' => "demo/laboratorium/{$lab->slug}/galeri-{$i}.jpg"],
                    ['judul' => "Foto {$i} - {$lab->nama}", 'urutan' => $i]
                );
                DemoAssetHelper::image("demo/laboratorium/{$lab->slug}/galeri-{$i}.jpg", 1200, 800, "Galeri {$i}");
            }

            $dokumen = [
                ['judul' => 'SOP Umum Laboratorium', 'jenis' => 'sop'],
                ['judul' => 'Tata Tertib Laboratorium', 'jenis' => 'tata_tertib'],
                ['judul' => 'Denah dan Jalur Evakuasi', 'jenis' => 'lainnya'],
            ];

            foreach ($dokumen as $d) {
                $file = "demo/laboratorium/{$lab->slug}/dokumen-{$d['jenis']}.pdf";
                DemoAssetHelper::pdf($file, $d['judul'] . ' - ' . $lab->nama);
                LaboratoriumDokumen::updateOrCreate(
                    ['laboratorium_id' => $lab->id, 'judul' => $d['judul']],
                    ['jenis' => $d['jenis'], 'file' => $file]
                );
            }

            $tataTertib = [
                'Wajib menggunakan APD lengkap saat berada di laboratorium.',
                'Dilarang makan dan minum di area laboratorium.',
                'Wajib mencuci tangan sebelum dan sesudah praktikum.',
                'Laporkan segala insiden atau kecelakaan kepada laboran.',
                'Kembalikan alat ke tempat semula setelah penggunaan.',
                'Matikan alat dan sumber energi setelah selesai digunakan.',
                'Jangan membuang bahan kimia sembarangan ke saluran pembuangan.',
                'Ikuti prosedur SOP penggunaan alat dengan benar.',
                'Jaga kebersihan area kerja sebelum meninggalkan laboratorium.',
                'Dilarang membawa barang pribadi yang tidak diperlukan.',
            ];

            foreach ($tataTertib as $index => $isi) {
                LaboratoriumTataTertib::updateOrCreate(
                    ['laboratorium_id' => $lab->id, 'urutan' => $index + 1],
                    ['isi' => $isi]
                );
            }
        }
    }
}
