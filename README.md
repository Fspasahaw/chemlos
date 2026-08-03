# ChemLOS — Chemical Laboratory Operating System

Sistem manajemen peminjaman alat, laboratorium, perawatan alat, dan laporan untuk laboratorium kimia. Dibangun dengan Laravel, Inertia.js, React 19, dan Tailwind CSS v4.

## Fitur Utama

- Multi-peran: Admin, Pimpinan, Kepala Lab, Laboran, Dosen, Mahasiswa.
- Peminjaman alat dengan alur persetujuan dosen, kepala lab/laboran, serah terima, dan pengembalian.
- Pelacakan kerusakan dan maintenance alat dengan perpindahan stok otomatis.
- Laporan multi-jenis dengan ekspor Excel (Maatwebsite/Excel) dan PDF (DomPDF).
- Audit log aktivitas lengkap berbasis Spatie Activity Log.
- Notifikasi in-app, email, dan WhatsApp (template dari pengaturan).
- Backup database manual/otomatis dan restore.
- Kalender ketersediaan alat dan antarmuka multi-bahasa (ID/EN) serta dark mode.

## Prasyarat

- PHP 8.3+
- Composer 2+
- Node.js 20+
- MySQL/MariaDB (produksi) atau SQLite (pengujian)
- MySQL Client/XAMPP (untuk fitur backup/restore)

## Instalasi Lokal

```bash
cd laravel
cp .env.example .env
composer install
npm install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
npm run build
```

## Pengaturan Penting

Salin nilai dari `.env.example`, lalu sesuaikan:

- `DB_*` — koneksi database produksi.
- `MAIL_*` — pengaturan SMTP/mailer.
- `RECAPTCHA_ENABLED` — aktif/nonaktif reCAPTCHA.
- `VITE_BROADCAST_DRIVER` — pilih `null`, `pusher`, atau `reverb`.
- `QUEUE_CONNECTION` — `database` untuk produksi agar notifikasi diproses worker.

## Menjalankan Aplikasi

```bash
php artisan serve
npm run dev    # atau npm run build untuk produksi
```

Pastikan worker antrian dan scheduler aktif di produksi:

```bash
php artisan queue:work --sleep=3 --tries=3
php artisan schedule:run    # atau cron: * * * * * cd /path && php artisan schedule:run >> /dev/null 2>&1
```

## Akun Demo

Setelah `php artisan migrate --seed`, beberapa akun demo tersedia. Periksa seeder `DemoDataSeeder` atau dashboard admin untuk daftar pengguna yang dibuat.

## Perintah Khusus

```bash
php artisan chemlos:auto-cancel        # Batalkan peminjaman kadaluarsa
php artisan chemlos:send-reminders     # Kirim pengingat dan notifikasi keterlambatan
php artisan chemlos:backup-database    # Backup database ke storage/app/backups
```

## Pengujian

```bash
php artisan test
npm run build
```

Untuk visual regression lokal (memerlukan Google Chrome + Puppeteer):

```bash
php artisan serve --host=127.0.0.1 --port=8001
node tmp-visual-fase14.mjs
```

## Deployment

Lihat folder `deploy/` untuk konfigurasi:

- `nginx.conf` — virtual host Nginx dengan SSL, gzip, dan header keamanan.
- `apache.conf` — konfigurasi Apache.
- `chemlos-worker.service` — systemd worker antrian.
- `chemlos-scheduler.cron` — entry cron scheduler.
- `deploy.sh` / `deploy.ps1` — skrip deployment Linux/Windows.

Checklist produksi: `php artisan config:cache`, `route:cache`, `view:cache`, hapus `public/hot`, aktifkan SSL, worker, dan scheduler.

## Pengembangan Berbasis Fase

Proyek ini dibangun secara bertahap sesuai spesifikasi di `chemlos/spesifikasi/`:

- FASE 15 (Testing, Optimization, Deployment) berhasil menambahkan indeks DB, menambal kompatibilitas SQLite pada dashboard, mengirim notifikasi pada modul maintenance & kerusakan admin, serta menambah pengujian FASE 15.

## Lisensi

Proyek internal. Lisensi ditentukan oleh pemilik repositori.
