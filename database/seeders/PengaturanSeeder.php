<?php

namespace Database\Seeders;

use App\Models\Pengaturan;
use Illuminate\Database\Seeder;

class PengaturanSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // Umum
            ['grup' => 'umum', 'key' => 'nama_aplikasi', 'value' => 'ChemLOS'],
            ['grup' => 'umum', 'key' => 'nama_institusi', 'value' => 'Departemen Teknik Kimia, Fakultas Teknik, Universitas Indonesia'],
            ['grup' => 'umum', 'key' => 'deskripsi_aplikasi', 'value' => 'Chemical Laboratory Online System - Sistem manajemen inventaris, peminjaman, pengembalian, dan pemeliharaan alat laboratorium terintegrasi.'],
            ['grup' => 'umum', 'key' => 'email_kontak', 'value' => 'chemlos@che.ui.ac.id'],
            ['grup' => 'umum', 'key' => 'nomor_whatsapp_admin', 'value' => '6281234567890'],
            ['grup' => 'umum', 'key' => 'alamat_institusi', 'value' => 'Departemen Teknik Kimia, Fakultas Teknik, Universitas Indonesia, Kampus UI Depok, Depok 16424'],
            ['grup' => 'umum', 'key' => 'jam_operasional', 'value' => 'Senin - Jumat, 08.00 - 16.00 WIB'],
            ['grup' => 'umum', 'key' => 'social_facebook', 'value' => ''],
            ['grup' => 'umum', 'key' => 'social_instagram', 'value' => ''],
            ['grup' => 'umum', 'key' => 'social_youtube', 'value' => ''],
            ['grup' => 'umum', 'key' => 'social_twitter', 'value' => ''],

            // Branding
            ['grup' => 'branding', 'key' => 'logo_aplikasi', 'value' => ''],
            ['grup' => 'branding', 'key' => 'favicon', 'value' => ''],
            ['grup' => 'branding', 'key' => 'primary_color', 'value' => '#4f46e5'],
            ['grup' => 'branding', 'key' => 'secondary_color', 'value' => '#7c3aed'],

            // Email
            ['grup' => 'email', 'key' => 'mail_mailer', 'value' => 'smtp'],
            ['grup' => 'email', 'key' => 'mail_host', 'value' => '127.0.0.1'],
            ['grup' => 'email', 'key' => 'mail_port', 'value' => '1025'],
            ['grup' => 'email', 'key' => 'mail_username', 'value' => ''],
            ['grup' => 'email', 'key' => 'mail_password', 'value' => ''],
            ['grup' => 'email', 'key' => 'mail_encryption', 'value' => 'null'],
            ['grup' => 'email', 'key' => 'mail_from_address', 'value' => 'noreply@chemlos.che.ui.ac.id'],
            ['grup' => 'email', 'key' => 'mail_from_name', 'value' => 'ChemLOS'],

            // Keamanan
            ['grup' => 'keamanan', 'key' => 'recaptcha_enabled', 'value' => '0'],
            ['grup' => 'keamanan', 'key' => 'recaptcha_site_key', 'value' => ''],
            ['grup' => 'keamanan', 'key' => 'recaptcha_secret_key', 'value' => ''],
            ['grup' => 'keamanan', 'key' => 'max_login_attempts', 'value' => '5'],
            ['grup' => 'keamanan', 'key' => 'lockout_minutes', 'value' => '15'],

            // Legal
            ['grup' => 'legal', 'key' => 'syarat_ketentuan', 'value' => "Syarat dan Ketentuan ChemLOS:\n1. Pengguna wajib menggunakan data identitas asli.\n2. Pengguna bertanggung jawab penuh atas alat yang dipinjam.\n3. Pelanggaran dapat mengakibatkan pemblokiran akun.\n4. Peminjaman wajib mengikuti prosedur persetujuan yang berlaku."],
            ['grup' => 'legal', 'key' => 'kebijakan_privasi', 'value' => "Kebijakan Privasi ChemLOS:\n1. Data pribadi hanya digunakan untuk keperluan peminjaman alat laboratorium.\n2. Kami tidak membagikan data pengguna kepada pihak ketiga tanpa izin.\n3. Pengguna dapat meminta penghapusan data sesuai ketentuan yang berlaku.\n4. Aktivitas pengguna tercatat dalam audit log untuk keperluan keamanan."],

            // Denda
            ['grup' => 'denda', 'key' => 'denda_per_hari', 'value' => '50000'],
            ['grup' => 'denda', 'key' => 'denda_per_jam', 'value' => '0'],
            ['grup' => 'denda', 'key' => 'toleransi_keterlambatan_menit', 'value' => '30'],
            ['grup' => 'denda', 'key' => 'maksimal_denda', 'value' => '500000'],
            ['grup' => 'denda', 'key' => 'blokir_pinjaman_jika_denda', 'value' => '1'],
            ['grup' => 'denda', 'key' => 'denda_rusak_ringan', 'value' => '50000'],
            ['grup' => 'denda', 'key' => 'denda_rusak_berat', 'value' => '500000'],
            ['grup' => 'denda', 'key' => 'denda_hilang', 'value' => '500000'],

            // Peminjaman
            ['grup' => 'peminjaman', 'key' => 'batas_waktu_persetujuan_jam', 'value' => '24'],
            ['grup' => 'peminjaman', 'key' => 'maksimal_durasi_hari', 'value' => '7'],
            ['grup' => 'peminjaman', 'key' => 'minimal_durasi_hari', 'value' => '1'],
            ['grup' => 'peminjaman', 'key' => 'maksimal_alat_per_peminjaman', 'value' => '5'],
            ['grup' => 'peminjaman', 'key' => 'maksimal_peminjaman_aktif', 'value' => '3'],
            ['grup' => 'peminjaman', 'key' => 'wajib_upload_jsa', 'value' => '1'],
            ['grup' => 'peminjaman', 'key' => 'wajib_dosen_pembimbing', 'value' => '1'],

            // Tentang
            ['grup' => 'tentang', 'key' => 'tagline', 'value' => 'Sistem informasi peminjaman dan manajemen inventaris alat laboratorium terintegrasi.'],
            ['grup' => 'tentang', 'key' => 'visi', 'value' => 'Menjadikan peminjaman alat laboratorium lebih transparan, efisien, dan terukur.'],
            ['grup' => 'tentang', 'key' => 'misi', 'value' => "1. Memudahkan civitas akademika mengakses alat laboratorium secara online.\n2. Meningkatkan akuntabilitas penggunaan dan pemeliharaan alat.\n3. Mendukung transparansi jadwal, stok, dan status alat laboratorium."],

            // Notifikasi
            ['grup' => 'notifikasi', 'key' => 'email_enabled', 'value' => '1'],
            ['grup' => 'notifikasi', 'key' => 'whatsapp_enabled', 'value' => '0'],
            ['grup' => 'notifikasi', 'key' => 'whatsapp_provider', 'value' => 'stub'],
            ['grup' => 'notifikasi', 'key' => 'whatsapp_api_key', 'value' => ''],
            ['grup' => 'notifikasi', 'key' => 'whatsapp_base_url', 'value' => ''],
            ['grup' => 'notifikasi', 'key' => 'whatsapp_sender', 'value' => ''],
            ['grup' => 'notifikasi', 'key' => 'reminder_h1_serah_terima', 'value' => '1'],
            ['grup' => 'notifikasi', 'key' => 'reminder_h_serah_terima', 'value' => '1'],
            ['grup' => 'notifikasi', 'key' => 'reminder_h2_pengembalian', 'value' => '1'],
            ['grup' => 'notifikasi', 'key' => 'reminder_h1_pengembalian', 'value' => '1'],
            ['grup' => 'notifikasi', 'key' => 'reminder_h_pengembalian', 'value' => '1'],
            ['grup' => 'notifikasi', 'key' => 'notifikasi_keterlambatan', 'value' => '1'],
            ['grup' => 'notifikasi', 'key' => 'notifikasi_realtime_enabled', 'value' => '1'],
            ['grup' => 'notifikasi', 'key' => 'polling_interval_detik', 'value' => '30'],

            // Template notifikasi (email/WA)
            ['grup' => 'notifikasi', 'key' => 'template_email_umum', 'value' => 'Halo {{nama}}, {{pesan}}. Lihat detail di {{link_detail}}.'],
            ['grup' => 'notifikasi', 'key' => 'template_whatsapp_umum', 'value' => 'Halo {{nama}}, {{pesan}}. Lihat detail di {{link_detail}}.'],
            ['grup' => 'notifikasi', 'key' => 'template_email_peminjaman', 'value' => 'Halo {{nama}}, terkait peminjaman: {{pesan}}. Silakan buka {{link_detail}} untuk detail lebih lanjut.'],
            ['grup' => 'notifikasi', 'key' => 'template_whatsapp_peminjaman', 'value' => 'Halo {{nama}}, terkait peminjaman: {{pesan}}. Lihat detail di {{link_detail}}.'],
            ['grup' => 'notifikasi', 'key' => 'template_email_pengingat_serah_terima', 'value' => 'Halo {{nama}}, pengingat serah terima: {{pesan}}. Lihat detail di {{link_detail}}.'],
            ['grup' => 'notifikasi', 'key' => 'template_whatsapp_pengingat_serah_terima', 'value' => 'Halo {{nama}}, pengingat serah terima: {{pesan}}. Lihat detail di {{link_detail}}.'],
            ['grup' => 'notifikasi', 'key' => 'template_email_pengingat_pengembalian', 'value' => 'Halo {{nama}}, pengingat pengembalian: {{pesan}}. Lihat detail di {{link_detail}}.'],
            ['grup' => 'notifikasi', 'key' => 'template_whatsapp_pengingat_pengembalian', 'value' => 'Halo {{nama}}, pengingat pengembalian: {{pesan}}. Lihat detail di {{link_detail}}.'],
            ['grup' => 'notifikasi', 'key' => 'template_email_peminjaman_terlambat', 'value' => 'Halo {{nama}}, peminjaman terlambat: {{pesan}}. Segera lakukan pengembalian. Lihat detail di {{link_detail}}.'],
            ['grup' => 'notifikasi', 'key' => 'template_whatsapp_peminjaman_terlambat', 'value' => 'Halo {{nama}}, peminjaman terlambat: {{pesan}}. Segera kembalikan alat. Lihat detail di {{link_detail}}.'],
            ['grup' => 'notifikasi', 'key' => 'template_email_pengguna', 'value' => 'Halo {{nama}}, status akun Anda: {{status}}. {{pesan}}. Lihat detail di {{link_detail}}.'],
            ['grup' => 'notifikasi', 'key' => 'template_whatsapp_pengguna', 'value' => 'Halo {{nama}}, status akun Anda: {{status}}. {{pesan}}. Lihat detail di {{link_detail}}.'],
            ['grup' => 'notifikasi', 'key' => 'template_email_kerusakan', 'value' => 'Halo {{nama}}, laporan kerusakan: {{pesan}}. Lihat detail di {{link_detail}}.'],
            ['grup' => 'notifikasi', 'key' => 'template_whatsapp_kerusakan', 'value' => 'Halo {{nama}}, laporan kerusakan: {{pesan}}. Lihat detail di {{link_detail}}.'],
            ['grup' => 'notifikasi', 'key' => 'template_email_maintenance', 'value' => 'Halo {{nama}}, informasi maintenance: {{pesan}}. Lihat detail di {{link_detail}}.'],
            ['grup' => 'notifikasi', 'key' => 'template_whatsapp_maintenance', 'value' => 'Halo {{nama}}, info maintenance: {{pesan}}. Lihat detail di {{link_detail}}.'],

            // Template tambahan untuk kebutuhan spesifik
            ['grup' => 'notifikasi', 'key' => 'template_email_verifikasi', 'value' => 'Halo {{nama}}, silakan verifikasi email Anda untuk melanjutkan proses pendaftaran. {{pesan}}. Lihat detail di {{link_detail}}.'],
            ['grup' => 'notifikasi', 'key' => 'template_email_persetujuan', 'value' => 'Halo {{nama}}, akun Anda telah disetujui. {{pesan}}. Silakan login untuk mulai menggunakan sistem.'],
            ['grup' => 'notifikasi', 'key' => 'template_email_penolakan', 'value' => 'Halo {{nama}}, akun Anda ditolak. {{pesan}}. Hubungi admin untuk informasi lebih lanjut.'],
            ['grup' => 'notifikasi', 'key' => 'template_email_peminjaman_selesai', 'value' => 'Halo {{nama}}, peminjaman telah selesai: {{pesan}}. Lihat detail di {{link_detail}}.'],
            ['grup' => 'notifikasi', 'key' => 'template_whatsapp_pengingat', 'value' => 'Halo {{nama}}, pengingat: {{pesan}}. Lihat detail di {{link_detail}}.'],
        ];

        foreach ($settings as $setting) {
            Pengaturan::setValue($setting['grup'], $setting['key'], $setting['value']);
        }
    }
}
