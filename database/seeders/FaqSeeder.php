<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        Faq::truncate();

        $faqs = [
            ['kategori' => 'Umum', 'pertanyaan' => 'Apa itu ChemLOS?', 'jawaban' => 'ChemLOS adalah sistem online untuk mengelola inventaris dan peminjaman alat laboratorium.', 'urutan' => 1],
            ['kategori' => 'Umum', 'pertanyaan' => 'Siapa yang dapat menggunakan ChemLOS?', 'jawaban' => 'Mahasiswa, dosen, laboran, kepala lab, admin, dan pimpinan Departemen Teknik Kimia FTUI.', 'urutan' => 2],
            ['kategori' => 'Akun dan Pendaftaran', 'pertanyaan' => 'Bagaimana cara mendaftar?', 'jawaban' => 'Klik Daftar, isi data, lalu verifikasi email. Akun akan ditinjau admin/laboran.', 'urutan' => 1],
            ['kategori' => 'Akun dan Pendaftaran', 'pertanyaan' => 'Mengapa akun saya ditolak?', 'jawaban' => 'Pastikan data identitas dan email institusi sesuai ketentuan.', 'urutan' => 2],
            ['kategori' => 'Peminjaman', 'pertanyaan' => 'Berapa lama peminjaman?', 'jawaban' => 'Durasi minimal 1 hari dan maksimal sesuai pengaturan sistem.', 'urutan' => 1],
            ['kategori' => 'Peminjaman', 'pertanyaan' => 'Apakah bisa meminjam banyak alat?', 'jawaban' => 'Ya, Anda dapat meminjam multi-alat dari satu laboratorium.', 'urutan' => 2],
            ['kategori' => 'Pelatihan', 'pertanyaan' => 'Apakah semua alat wajib pelatihan?', 'jawaban' => 'Hanya alat dengan persyaratan khusus yang mewajibkan pelatihan.', 'urutan' => 1],
            ['kategori' => 'Pengembalian', 'pertanyaan' => 'Bagaimana jika terlambat mengembalikan?', 'jawaban' => 'Denda sesuai kebijakan departemen akan dikenakan.', 'urutan' => 1],
            ['kategori' => 'Kontak', 'pertanyaan' => 'Bagaimana menghubungi admin?', 'jawaban' => 'Gunakan halaman Kontak atau kirim email ke chemlos@che.ui.ac.id.', 'urutan' => 1],
            ['kategori' => 'Kontak', 'pertanyaan' => 'Bagaimana menghubungi laboran?', 'jawaban' => 'Lihat detail laboratorium untuk informasi kontak pengelola.', 'urutan' => 2],
        ];

        foreach ($faqs as $faq) {
            Faq::create($faq);
        }
    }
}
