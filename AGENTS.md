# ChemLOS Development Notes

## FASE 1 Audit Status

**Status: SELESAI** — Foundation Laravel 13.20 + React 19 + Inertia + Tailwind CSS 4 berjalan dengan baik.

### Hasil Pemeriksaan FASE 1
- Laravel Framework 13.20.0 terinstall.
- Semua package backend terpasang (Inertia, Ziggy, Spatie, Excel, DomPDF, QR, reCAPTCHA, Pusher, Sanctum, Activitylog).
- Semua package frontend terpasang (React 19, Tailwind v4, Vite, FullCalendar, Framer Motion, GSAP, Lucide, Chart.js, React Hook Form, Zod, date-fns, axios, sonner).
- Konfigurasi Tailwind v4 CSS-based (`@import 'tailwindcss'`) dan `@tailwindcss/vite` benar.
- `app.blade.php` memiliki `@viteReactRefresh` sebelum `@vite`, dark-mode tanpa FOUC, dan Google Fonts.
- `vite.config.js` terkonfigurasi dengan input CSS dan TSX, alias `@`, plugin React.
- HandleInertiaRequests middleware mengirim auth, flash, ziggy, settings, dan recaptcha ke frontend.
- Struktur folder backend/frontend lengkap (Controllers, Models, Components, Pages, Layouts, Providers).
- 308 route terdaftar, semua migrasi sudah dijalankan.
- `npm run build` berhasil.
- `php artisan test` lulus: 57 passed (241 assertions).
- Simulasi uji coba: beranda, login, dashboard admin/mahasiswa, detail lab/alat, wizard peminjaman berhasil di-render.

### Temuan dan Perbaikan
- **Bug ditemukan pada tampilan stok detail alat**: Stok Total 2, Tersedia 0, Dipinjam 0, Maintenance 0, tapi **Reserved 2 tidak ditampilkan**, membuat tampilan terlihat rancu ("2 unit hilang").
- **Perbaikan**: Menambahkan stat "Reserved" pada `resources/js/Pages/Public/AlatDetail.tsx` dan `resources/js/Components/AlatShow.tsx`, sehingga invariant `stok_total = tersedia + reserved + dipinjam + maintenance` tampak jelas.
- Build dan test dijalankan ulang setelah perbaikan, semua lulus.

### Catatan Penting
- `public/hot` tidak ditemukan; build production dapat digunakan untuk simulasi.
- `SESSION_DOMAIN` dikosongkan di `.env.example` agar cookie sesuai host saat ini.
- Untuk testing selanjutnya, gunakan `php artisan serve --host=127.0.0.1 --port=8001` dan `node tmp-visual-faseX.mjs`.

## FASE 2 Audit Status

**Status: SELESAI** — Database dan migrasi sesuai `02-DATABASE-SCHEMA.md`, semua tabel terbuat, relasi/index/soft-delete lengkap.

### Hasil Pemeriksaan FASE 2
- Total **22 migrasi aplikasi** (plus 3 default Laravel) berjalan dari awal dengan `php artisan migrate:fresh --seed`.
- Total **38 tabel** di database, termasuk semua tabel inti: `program_studi`, `users`, `laboratorium`, `laboratorium_pengelola`, `laboratorium_galeri`, `laboratorium_dokumen`, `laboratorium_tata_tertib`, `kategori_alat`, `alat`, `alat_galeri`, `alat_dokumen`, `video_tutorial`, `peminjaman`, `peminjaman_detail`, `peminjaman_status_log`, `serah_terima`, `pengembalian`, `maintenance_alat`, `kerusakan_alat`, `notifikasi`, `pengaturan`, `kontak_pesan`, `faqs`, plus tabel Spatie, Sanctum, cache, dan queue.
- Semua kolom stok 5 bagian tersedia di `alat`: `stok_total`, `stok_tersedia`, `stok_reserved`, `stok_dipinjam`, `stok_maintenance`.
- Kolom `jumlah` tersedia di `kerusakan_alat` dan `maintenance_alat`.
- Soft delete tersedia di `users`, `laboratorium`, `alat`, `kategori_alat`, `program_studi`, `video_tutorial`.
- **40 foreign key** terdaftar di `INFORMATION_SCHEMA`, menghubungkan semua relasi utama.
- Index penting tersedia di `users`, `alat`, `peminjaman`, `peminjaman_detail`, `kerusakan_alat`, `maintenance_alat`, `notifikasi`, `pengaturan`.
- Semua model Eloquent yang diwajibkan sudah dibuat di `app/Models/`.
- `php artisan migrate:fresh --seed` berhasil tanpa error (seeder lengkap: RolePermission, Pengaturan, FAQ, DemoData).
- `php artisan test` lulus: **57 passed (241 assertions)**.
- `npm run build` berhasil.
- Simulasi visual ulang setelah `migrate:fresh --seed` menunjukkan beranda dan halaman laboratorium tetap terisi data demo.

### Temuan dan Perbaikan
- **Inconsistency pada `peminjaman_status_log`**: spesifikasi `02-DATABASE-SCHEMA.md` mensyaratkan `status_dari` dan `status_ke` sebagai `varchar(50)`, tapi migrasi awal membuatnya `enum`.
- **Perbaikan**: Menambahkan migrasi `2026_07_28_125705_align_peminjaman_status_log_to_spec.php` untuk mengubah kedua kolom menjadi `varchar(50)` sesuai spec. Down migration mengembalikan ke enum semula.
- Setelah migrasi: `php artisan migrate:fresh --seed` dan `php artisan test` kembali lulus.

### Catatan Penting
- Tipe kolom JSON (`alat.spesifikasi`, `laboratorium.hari_operasional`, `serah_terima.kondisi_alat`, `pengembalian.kondisi_alat`) disimpan sebagai `longtext` di MariaDB/XAMPP, tapi model sudah di-cast sebagai `array`/JSON, sehingga fungsionalitas tetap normal.
- Semua enum values sesuai spesifikasi.
- Struktur database siap untuk FASE 3+.

---

## FASE 3 Audit Status

**Status: SELESAI** — Model, relasi, scope, dan casts sesuai `02-DATABASE-SCHEMA.md` dan `16-LANGKAH-KERJA-BERTAHAP.md`.

### Hasil Pemeriksaan FASE 3
- **21 model** di `app/Models/` sudah ada sesuai spec (termasuk `Faq` dan `KontakPesan`).
- Semua model memiliki `$fillable` dan `$casts` untuk enum/decimal/datetime/json/boolean.
- Model dengan soft delete sudah menggunakan `SoftDeletes` trait.
- **36 relasi Eloquent** penting terverifikasi berfungsi melalui script `tmp-verify-relations.php`:
  - `Laboratorium->alat`, `Alat->peminjamanDetails`, `Peminjaman->details`
  - `Peminjaman->user`, `Peminjaman->laboratorium`, `Peminjaman->serahTerima`, `Peminjaman->pengembalian`
  - `Alat->kerusakanAlats`, `Alat->maintenanceAlats`, `KerusakanAlat->maintenance`, `MaintenanceAlat->kerusakan`
  - `Peminjaman->statusLogs`, `User->notifications`, `ProgramStudi->users`, `KategoriAlat->alats`
  - `VideoTutorial->alat`, `Notifikasi->user`, dan relasi pendukung lab (galeri, dokumen, tata tertib, pengelola).
- **Scope reusable** berfungsi: `byStatus`, `byLaboratorium`, `byUser`, `aktif`, `bisaDipinjam`, `approved`, `unread`, `grup`, dll.
- Accessor stok `Alat::stokTersediaAktual` dan `Alat::hitungStokTersedia()` berfungsi.
- `Peminjaman::statusLabel()` dan `User::status_label` accessor berfungsi.
- Semua model utama menggunakan `LogsActivity` (termasuk `Faq` dan `LaboratoriumTataTertib` yang sebelumnya belum).
- `php artisan test` lulus: **57 passed (241 assertions)**.
- `php artisan migrate:fresh --seed` berhasil.
- `npm run build` berhasil.
- Simulasi visual: halaman publik (beranda, laboratorium detail, alat listing, alat detail, tutorial) tampil dengan data demo dan durasi video format MM:SS benar.

### Temuan dan Perbaikan
1. **Detail alat error 500** di halaman publik: `Call to a member function getKey() on array` di `DetailDataService::eventsForAlat` dan `eventsForLaboratorium` saat menggabungkan koleksi hasil `map()` array.
   - **Perbaikan**: Membungkus hasil `map()` dengan `collect()` sebelum `merge` agar operasi `Collection::merge` tidak memanggil `getKey()` pada elemen array.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Services\DetailDataService.php" />.

2. **Durasi video tutorial tampil `NaN:NaN`**: kolom `video_tutorial.durasi` diubah ke `VARCHAR(20)` oleh migrasi `fase2_schema_alignment` dan seeder menyimpan string `"MM:SS"`, sementara front-end mengharapkan detik (integer).
   - **Perbaikan**:
     - Migrasi `2026_07_28_134546_fix_video_tutorial_durasi.php`: mengubah kolom kembali ke `INT UNSIGNED`, mengkonversi data string "MM:SS" ke detik.
     - Model `VideoTutorial`: cast `durasi` dari `string` ke `integer`.
     - Seeder `VideoTutorialSeeder`: menyimpan durasi dalam detik integer.
     - Controller validasi (`Admin/VideoTutorialController`, `Admin/AlatController`, `Laboran/AlatController`): `durasi` divalidasi sebagai `nullable|integer|min:0`.

3. **Model tanpa audit log**: `Faq` dan `LaboratoriumTataTertib` tidak menggunakan `LogsActivity`.
   - **Perbaikan**: Menambahkan trait `HasFactory, LogsActivity` dan `getActivitylogOptions()` pada kedua model.

### Catatan Penting
- Semua model, relasi, scope, dan casts FASE 3 sudah selesai dan teruji.
- Tipe data `durasi` konsisten integer detik di database, model, validasi, dan seeder.
- `php artisan migrate:fresh --seed` dan `php artisan test` tetap lulus setelah perbaikan.

---

## FASE 4 Audit Status

**Status: SELESAI** — Autentikasi dan autorisasi backend berfungsi sesuai `16-LANGKAH-KERJA-BERTAHAP.md`.

### Hasil Pemeriksaan FASE 4
- **Spatie Permission** terpublish, konfigurasi `config/permission.php` tersedia.
- **RolePermissionSeeder** membuat **23 permission** dan **6 role**: `admin`, `pimpinan`, `kepala_lab`, `laboran`, `dosen`, `mahasiswa`.
- **Middleware autentikasi/autorisasi** lengkap dan terdaftar di `bootstrap/app.php`:
  - `EnsureEmailIsVerified` (alias `verified.email`)
  - `EnsureAccountIsApproved` (alias `approved`)
  - `EnsureProfileComplete` (alias `profile.complete`)
  - `CheckRole` (alias `role`)
  - `CheckLabAccess` (alias `lab.access`)
  - `RedirectToProperDashboard` (alias `role.dashboard`, global web middleware)
- **14 policies** terdaftar di `AppServiceProvider` untuk model-model utama.
- **AuthController** memiliki semua endpoint yang dipersyaratkan:
  - `register`, `login`, `logout`, `me`
  - `completeProfile`, `updateProfile`, `changePassword`
  - `forgotPassword`, `resetPassword`
  - `verifyEmail`, `resendVerification`
- **Route autentikasi** lengkap di `routes/web.php` dan `routes/api.php`:
  - `/login`, `/daftar`, `/lupa-password`, `/reset-password/{token}`
  - `/verifikasi-email`, `/email/verify/{id}/{hash}`
  - `/menunggu-persetujuan`, `/akun-ditolak`, `/akun-tidak-aktif`, `/lengkapi-profil`
  - `/logout`, `/switch-role`, dan dashboard peran (`/dashboard/{admin,pimpinan,kepala-lab,laboran,dosen,mahasiswa}`)
- **Front-end autentikasi** lengkap: `Login`, `Daftar`, `LupaPassword`, `ResetPassword`, `VerifikasiEmail`, `MenungguPersetujuan`, `AkunDitolak`, `AkunTidakAktif`, `LengkapiProfil`.
- **Flow autentikasi terverifikasi** oleh test `Fase4AuthTest`:
  - Register mahasiswa/dosen dengan email domain sesuai -> status `pending_email`
  - Verifikasi email via signed URL -> status `pending_approval`
  - Login redirect sesuai status: pending email, pending approval, rejected, suspended, approved
  - Mahasiswa dengan profil belum lengkap diarahkan ke `/lengkapi-profil`
  - Complete profile memperbarui data dan memungkinkan akses dashboard
  - Forgot/reset password berfungsi
  - Middleware role menolak akses tidak berwenang
  - Laboran/Admin dapat approve/reject user

### Temuan dan Perbaikan
1. **Regex `nama_lengkap` terlalu ketat** di `AuthController::register`: hanya mengizinkan `[a-zA-Z\s\'\-]`, sehingga nama dosen dengan gelar seperti "Drs. Test, M.T." atau "Prof. Dr. Ir. ..." ditolak.
   - **Perbaikan**: Mengubah regex menjadi `^[a-zA-Z\s\'\-\.\,\/\(\)]+$` agar mengizinkan titik, koma, slash, dan tanda kurung untuk gelar akademik.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\AuthController.php" />.
2. **Kurangnya test FASE 4 yang komprehensif**: test `AuthTest` existing hanya mencakup login dasar, logout, update profile, dan change password.
   - **Perbaikan**: Menambahkan `tests/Feature/Fase4AuthTest.php` yang mencakup register, verifikasi email, redirect status, complete profile, forgot/reset password, dan middleware role.

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `php artisan test` | **69 passed (277 assertions)** |
| `npm run build` | Berhasil |
| Visual peran | Beranda, Login, Daftar, LupaPassword, Dashboard admin/pimpinan/kepala-lab/laboran/dosen/mahasiswa, dan LengkapiProfil tampil normal |

### Catatan Penting
- Semua halaman publik, autentikasi, dan dashboard peran dapat diakses sesuai peran.
- Role-based access control berfungsi: user non-admin di-redirect ke dashboardnya saat mencoba akses halaman admin.
- Flow pendaftaran (pending email -> verifikasi -> pending approval -> approved -> lengkapi profil -> dashboard) berfungsi.
- `php artisan test` sekarang **69 passed** termasuk 12 test FASE 4 baru.

---

## FASE 5 Audit Status

**Status: SELESAI** — Data demo realistis, saling terhubung, dan stok konsisten.

### Hasil Pemeriksaan FASE 5
- **Semua seeder sesuai spesifikasi** tersedia di `database/seeders/`:
  - `RolePermissionSeeder`, `PengaturanSeeder`, `ProgramStudiSeeder`
  - `UserSeeder`, `LaboratoriumSeeder`, `LaboratoriumPengelolaSeeder`
  - `KategoriAlatSeeder`, `AlatSeeder`, `VideoTutorialSeeder`
  - `PeminjamanSeeder`, `MaintenanceSeeder`, `NotifikasiSeeder`
  - `FaqSeeder`
- `DatabaseSeeder` memanggil semua seeder melalui `DemoDataSeeder`.
- **`php artisan migrate:fresh --seed` berhasil** dengan hasil data yang didesain ulang agar lebih ringkas dan sesuai kebutuhan demo terbaru:
  | Tabel | Jumlah |
  |-------|--------|
  | `users` | 27 |
  | `program_studi` | 5 |
  | `laboratorium` | 5 |
  | `laboratorium_pengelola` | 10 |
  | `kategori_alat` | 6 |
  | `alat` | 25 |
  | `video_tutorial` | 5 |
  | `peminjaman` | 12 |
  | `peminjaman_detail` | 18 |
  | `kerusakan_alat` | 4 |
  | `maintenance_alat` | 3 |
  | `notifikasi` | ~87 |
  | `faqs` | 10 |
- **Akun demo peran** berhasil dibuat dengan password sesuai `UserSeeder::$demoPasswords`:
  - 2 admin: `admin@che.ui.ac.id`, `admin2@che.ui.ac.id`
  - 4 pimpinan (sekaligus dosen): `kepala.dept@che.ui.ac.id`, `sekretaris.dept@che.ui.ac.id`, `ketua.tk@che.ui.ac.id`, `ketua.bioproses@che.ui.ac.id`
  - 5 kepala lab (sekaligus dosen): `hendra.wijaya@che.ui.ac.id`, `ratna.dewi@che.ui.ac.id`, `fajar.nugroho@che.ui.ac.id`, `maya.sari@che.ui.ac.id`, `budi.santoso@che.ui.ac.id`
  - 5 laboran: `ahmad.fauzi@che.ui.ac.id`, `dewi.lestari@che.ui.ac.id`, `rudi.hermawan@che.ui.ac.id`, `linda.permata@che.ui.ac.id`, `eko.prasetyo@che.ui.ac.id`
  - 2 dosen tambahan: `susanto.wijaya@che.ui.ac.id`, `kartika.sari@che.ui.ac.id`
  - 9 mahasiswa:
    - `1906285001@ui.ac.id` (aktif, profil lengkap)
    - `1906285002@ui.ac.id` (aktif)
    - `2006285003@ui.ac.id` (aktif)
    - `2206486001@ui.ac.id` (aktif, Teknik Bioproses)
    - `2106285012@ui.ac.id` (approved, profil belum lengkap)
    - `2306285009@ui.ac.id` (pending approval)
    - `2406285010@ui.ac.id` (pending email)
    - `2106285011@ui.ac.id` (suspended)
    - `2006285004@ui.ac.id` (rejected — ditolak karena data KTM tidak sesuai)
- **Stok alat konsisten**: untuk setiap alat `stok_total = stok_tersedia + stok_reserved + stok_dipinjam + stok_maintenance`.
- **Data saling terhubung**:
  - Semua 5 laboratorium memiliki 5 alat (25 alat total).
  - Semua 12 peminjaman memiliki detail dan mencakup status: diajukan, menunggu_dosen, menunggu_laboran, disetujui, berlangsung, terlambat, selesai, ditolak, dibatalkan.
  - 12 peminjaman memiliki laboratorium, user, dan dosen pembimbing.
  - Denda tercakup: belum dibayar, terbayar sebagian, dan lunas.
  - 4 kerusakan pasca pengembalian: 3 sudah didaftarkan ke maintenance, 1 masih berstatus `dilaporkan` (belum didaftarkan ke maintenance).
  - Notifikasi terhubung ke setiap peminjaman, kerusakan, dan maintenance.
- **Asset demo** dihasilkan ke `storage/app/public/demo/`:
  - 27 avatar user, foto KTM sesuai mahasiswa yang melengkapi profil, 5 laboratorium dengan foto utama + 5 galeri, 25 alat dengan foto utama + 3 galeri + manual PDF (+ SOP untuk alat pelatihan wajib), 5 thumbnail video tutorial, serta foto serah terima, pengembalian, dan kerusakan.

### Temuan dan Perbaikan
1. **Test FASE 5 belum ada**: sebelumnya tidak ada test yang memverifikasi seluruh seeder dan data demo.
   - **Perbaikan**: Menambahkan `tests/Feature/Fase5SeederTest.php` yang memverifikasi:
     - Jumlah minimal data demo untuk setiap tabel inti.
     - Akun demo untuk setiap peran tersedia.
     - Konsistensi stok alat setelah seeding.
     - Keterhubungan peminjaman dengan user, laboratorium, dan detail.
     - Test menggunakan `Http::fake()` agar `DemoAssetHelper` tidak bergantung koneksi internet saat pengujian.

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `php artisan migrate:fresh --seed` | Berhasil (data demo terisi) |
| `php artisan test` | **120 passed (599 assertions)** |
| `npm run build` | Berhasil |
| Visual publik & dashboard | Beranda, Laboratorium, Alat, Tutorial, Login, Daftar, LupaPassword, dashboard semua peran, Admin Alat, Laboran Peminjaman, Mahasiswa Ajukan tampil normal |

### Catatan Penting
- `DemoAssetHelper` mengunduh gambar dari Picsum/UI Avatars dan membuat PDF placeholder. Tanpa koneksi internet, seeder akan fallback ke gambar placeholder GD.
- `DatabaseSeeder` berjalan lama saat pertama kali karena mengunduh banyak asset. Test FASE 5 sekarang cepat karena `Http::fake()`.
- `php artisan test` sekarang **120 passed** termasuk test FASE 5.

---

## Verification Commands
- Run tests: `php artisan test`
- Build frontend: `npm run build`
- Reset DB with demo data: `php artisan migrate:fresh --seed`
- Visual regression helpers: `node tmp-visual-fase3.mjs` / `node tmp-visual-fase9.mjs` / `node tmp-visual-fase14.mjs` (requires Puppeteer + Chrome + `php artisan serve --host=127.0.0.1 --port=8001`)

## FASE 6 Audit Status

**Status: SELESAI** — Frontend foundation, komponen reusable, layout, dan tema/gaya siap digunakan di seluruh aplikasi.

### Hasil Pemeriksaan FASE 6
- **Layout wajib tersedia** di `resources/js/Layouts/`:
  - `PublicLayout` (Navbar + Footer) dengan glassmorphism navbar, language toggle, theme toggle, notifikasi bell, user menu, dan mobile drawer.
  - `GuestLayout` (split layout) dengan hero gradient, float animation, dan form card.
  - `DashboardLayout` (Sidebar + Header) dengan menu peran dinamis, role switcher, breadcrumb, dan notifikasi.
- **Komponen reusable wajib** tersedia di `resources/js/Components/`:
  - Form: `Button`, `Input`, `Textarea`, `Select`, `DatePicker`, `TimePicker`, `FileUpload`, `Checkbox`, `Radio`, `Switch`.
  - UI: `Card`, `Badge`, `Modal`, `Tooltip`, `Toast`, `Skeleton`, `Loader`, `LoadingScreen`.
  - Data: `DataTable`, `FilterChips`, `Pagination`.
  - Navigasi: `Tabs`, `Accordion`, `Stepper`, `Avatar`, `DropdownMenu`.
  - Kalender/Grafik: `Calendar` (FullCalendar wrapper), `Chart` (Chart.js wrapper).
- **Tema & bahasa**:
  - `ThemeProvider` mendukung `light`/`dark`/`system` dan sinkron dengan preferensi user (`tema_preferensi`).
  - `LanguageProvider` default Bahasa Indonesia (`id`) dan mendukung `en`.
  - `app.blade.php` menerapkan class `dark` dan atribut `lang` sebelum hydration untuk menghindari FOUC.
- **Desain konsisten** sesuai `04-UI-UX-KOMPONEN.md`:
  - Palet warna utama (indigo/violet/emerald/amber/rose/sky/purple/slate) dan gradasi wajib digunakan.
  - Animasi hover, focus ring, modal scale-in, toast slide-in, skeleton shimmer, page fadeInUp.
  - Rounded besar, soft shadow, glassmorphism, dan kontras dark mode.
- **Build frontend berhasil**: `npm run build` menghasilkan bundle tanpa error.
- **Aksesibilitas**: modal memiliki focus trap dan close dengan ESC, tombol icon-only memiliki `aria-label`, komponen form memiliki label dan error message.

### Temuan dan Perbaikan
1. **Avatar fallback belum gradient random berdasarkan nama** (spesifikasi 5.13 mensyaratkan gradient acak).
   - **Perbaikan**: `resources/js/Components/Avatar.tsx` sekarang menghitung gradient deterministik dari hash nama, dengan 8 pilihan gradasi warna ChemLOS. Jika foto tersedia, gambar ditampilkan; jika tidak, inisial nama muncul di atas gradient.

2. **Belum ada test khusus untuk Frontend Foundation**.
   - **Perbaikan**: Menambahkan `tests/Feature/Fase6FrontendTest.php` yang memverifikasi:
     - Ketiga layout (Public/Guest/Dashboard) tersedia.
     - Theme/Language/Notification provider tersedia.
     - Semua komponen reusable wajib (29 komponen) tersedia.
     - `app.blade.php` memiliki script anti-FOUC dan default `lang="id"`.
     - Beranda dan halaman login merender komponen Inertia yang benar (`Public/Beranda` dan `Auth/Login`).

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `php artisan test` | **76 passed (471 assertions)** |
| `npm run build` | Berhasil |
| Visual publik & auth | Beranda, Login, Dashboard, DataTable, Stepper, Calendar tampil normal dengan dark/light support |

### Catatan Penting
- Semua komponen diimpor dan di-bundle oleh Vite tanpa error (build sukses).
- `Avatar` sekarang memenuhi spesifikasi gradient acak berdasarkan nama.
- FASE 6 sudah selesai; aplikasi siap melanjutkan ke FASE 7 atau audit menyeluruhan.

## FASE 7 Audit Status

**Status: SELESAI** — Semua 12 halaman publik tersedia, responsif, berfungsi, dan tidak memerlukan login.

### Hasil Pemeriksaan FASE 7
- **12 halaman publik terverifikasi**:
  1. Beranda `/`
  2. Laboratorium `/laboratorium`
  3. Detail Laboratorium `/laboratorium/{slug}`
  4. Alat `/alat`
  5. Detail Alat `/alat/{slug}`
  6. Tutorial `/tutorial`
  7. Detail Video `/tutorial/{slug}`
  8. Tentang `/tentang`
  9. FAQ `/faq`
  10. Kontak `/kontak`
  11. Syarat & Ketentuan `/syarat-ketentuan`
  12. Kebijakan Privasi `/kebijakan-privasi`
- **Tanpa login**: Semua halaman di atas mengembalikan 200 OK untuk pengunjung publik.
- **Interaktivitas tanpa reload**:
  - Search debounce di `/laboratorium`, `/alat`, `/tutorial`.
  - Filter chips dan sorting tidak me-reload halaman.
  - Pagination Inertia tanpa full-page reload.
  - Kalender FullCalendar beranda/lab detail memiliki filter dan tooltip.
- **Responsif & tema**:
  - Tampilan desktop (1366x768) dan mobile (390x844) telah diuji.
  - Dark mode dan light mode tampil konsisten (cek visual).
  - Navbar glassmorphism, mobile hamburger drawer, bottom nav bekerja.
- **Detail halaman**:
  - Detail laboratorium memiliki tab Tentang/Alat/Galeri/Tata Tertib/Dokumen/Jadwal + sidebar kontak.
  - Detail alat memiliki tab Info/Spesifikasi/Galeri/Dokumen/Video/Riwayat/Jadwal + statistik stok (Total, Tersedia, Reserved, Dipinjam, Maintenance).
  - FAQ kategorisasi dan search debounce.
  - Kontak menampilkan form dan menyimpan pesan ke `kontak_pesan`.
  - Syarat & Kebijakan mengambil konten dari pengaturan sistem.

### Temuan dan Perbaikan
1. **Filter laboratorium dan kategori di halaman `/alat` tidak mengirimkan nilai terpilih saat pertama klik**.
   - **Penyebab**: `applyFilters({})` tidak mempassing payload baru, sehingga state `labFilter`/`kategoriFilter` belum ter-update saat request dikirim.
   - **Perbaikan**: Mengubah handler `onChange` di `resources/js/Pages/Public/Alat.tsx` agar langsung memanggil `applyFilters({ laboratorium: v as string })` dan `applyFilters({ kategori: v as string })`.

2. **Belum ada test khusus untuk halaman publik**.
   - **Perbaikan**: Menambahkan `tests/Feature/Fase7PublicPagesTest.php` yang memverifikasi:
     - 9 halaman publik utama return 200 dan merender komponen Inertia yang benar.
     - Halaman detail lab/alat/tutorial merender.
     - Halaman beranda mengandung stats.
     - Form kontak dapat disubmit publik dan tersimpan ke database.
     - Halaman publik mengirimkan props layout yang konsisten.

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `php artisan test` | **82 passed (503 assertions)** |
| `npm run build` | Berhasil |
| Visual FASE 7 | 12 halaman publik (termasuk dark, light, mobile) tampil normal |
| Simulasi interaksi | Search debounce, filter chips, pagination, tab detail, dan kalender FullCalendar berfungsi |

### Catatan Penting
- FASE 7 sudah selesai secara keseluruhan.
- Semua halaman publik memenuhi spesifikasi `05-HALAMAN-PUBLIK.md` dan `16-LANGKAH-KERJA-BERTAHAP.md`.
- Aplikasi siap dilanjutkan ke **FASE 8: Auth, Onboarding, dan Profil** atau audit menyeluruhan.

## FASE 7 Public Pages Notes
- Public pages audited against `05-HALAMAN-PUBLIK.md`.
- Added `Lightbox` component and integrated into `LaboratoriumDetail` and `AlatDetail` galleries (main preview + thumbnail strip for alat).
- Added `usePageLoading` hook and skeleton loading states for `Laboratorium`, `Alat`, and `Tutorial` listing pages.
- Updated `PublicLayout`: navbar adds `shadow-lg` on scroll; mobile menu hamburger morphs to X and drawer slides from the right.
- Added `LabIllustration` SVG to Beranda hero.
- Added `Jelajahi Lainnya` CTA section to `TutorialDetail`.
- `Pagination` supports `itemName` prop for context-aware labels (e.g. "1-12 dari X laboratorium").
- FAQ seeder aligned to spec categories (removed "Laboratorium" category).
- Fixed listing search `useEffect` to avoid an initial mount fetch.

## FASE 8 Auth, Onboarding, and Profile Notes
- Audited auth/onboarding against `06-AUTH-ONBOARDING.md`.
- Added per-user notification preferences (`notifikasi_email`, `notifikasi_whatsapp`, `notifikasi_in_app`) via migration + model casts + `updateProfile` validation.
- Profile preferences tab now includes toggles for Email, WhatsApp, and In-App notifications.
- `NotifikasiService` respects per-user notification preferences (default true).
- Fixed `Daftar` consent label so clicking Terms/Privacy links opens modals without toggling the checkbox.
- `Login` status modal now provides both WhatsApp and Email admin contact buttons.
- `ResetPassword` auto-redirects to `/login` 2 seconds after a successful reset.
- Visual regression helper updated to `networkidle2` + render delay and now includes `/profil` for every role.

## FASE 8 Audit Status

**Status: SELESAI** — Semua halaman autentikasi, onboarding, dan profil berfungsi sesuai `06-AUTH-ONBOARDING.md`.

### Hasil Pemeriksaan FASE 8
- **Halaman auth lengkap** dan dapat diakses:
  - `Daftar` `/daftar`
  - `Login` `/login`
  - `Verifikasi Email` `/verifikasi-email`
  - `Lupa Password` `/lupa-password`
  - `Reset Password` `/reset-password/{token}`
  - `Akun Tidak Aktif` `/akun-tidak-aktif`
  - `Akun Ditolak` `/akun-ditolak`
  - `Menunggu Persetujuan` `/menunggu-persetujuan`
  - `Lengkapi Profil` `/lengkapi-profil`
  - `Profil Saya` `/profil`
- **Flow autentikasi** terverifikasi:
  - Register mahasiswa/dosen dengan validasi domain email (`@ui.ac.id` / `@che.ui.ac.id`).
  - Password indicator hidup saat mengetik (lemah/sedang/kuat + checklist syarat).
  - Email verifikasi → status `pending_approval`.
  - Login redirect sesuai status: pending email, pending approval, rejected, suspended, approved.
  - Mahasiswa dengan profil belum lengkap diarahkan ke `/lengkapi-profil`.
  - Complete profile menyimpan data dan mengarahkan ke dashboard sesuai peran.
- **Profil** memiliki 3 tab:
  - **Informasi Pribadi**: edit nama, no HP, tanggal lahir, jenis kelamin, alamat, foto profil; mahasiswa melihat angkatan, semester, foto KTM.
  - **Keamanan**: ganti password dengan password indicator.
  - **Preferensi**: tema (Terang/Gelap/Sistem), bahasa, reduce motion, notifikasi (Email/WhatsApp/In-App).
- **Tema & responsif**:
  - Visual desktop (1366x768) dan mobile (390x844) diuji.
  - Light mode dan dark mode konsisten.
  - Guest layout split card responsif; mobile menumpuk hero + form.
- **Build & test**:
  - `php artisan test`: **89 passed (529 assertions)**
  - `npm run build`: Berhasil
  - Visual FASE 8: semua halaman auth + profil tabs (pribadi/keamanan/preferensi) tampil normal

### Temuan dan Perbaikan
1. **Foto profil dan KTM tampil broken image saat file demo corrupt**.
   - **Penyebab**: File demo di `public/storage/demo/users/` hanya 15 byte (placeholder `fake-image-data`) karena seeder pernah dijalankan dengan `Http::fake`.
   - **Perbaikan**:
     - `resources/js/Pages/Profile/Index.tsx`: menambahkan `onError` pada `<img>` avatar dan KTM, sehingga gambar gagal dimuat disembunyikan dan fallback inisial/placeholder tetap tampil.
     - `resources/js/Components/FileUpload.tsx`: menambahkan state `imgError` agar preview file tidak menampilkan ikon gambar rusak, melainkan ikon file + nama file.

2. **Belum ada test khusus untuk halaman auth dan profil**.
   - **Perbaikan**: Menambahkan `tests/Feature/Fase8AuthProfileTest.php` yang memverifikasi:
     - Halaman publik auth render 200.
     - Halaman `/lengkapi-profil` hanya dapat diakses setelah login.
     - Login approved user redirect ke dashboard.
     - Halaman profil memerlukan login dan merender untuk user yang terautentikasi.
     - Mahasiswa dengan profil tidak lengkap di-redirect ke `/lengkapi-profil`.

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `php artisan test` | **89 passed (529 assertions)** |
| `npm run build` | Berhasil |
| Visual FASE 8 | Daftar, Login, Verifikasi Email, Lupa Password, Reset Password, Akun Tidak Aktif, Profil (3 tab) tampil normal, dark & light, desktop & mobile |
| Simulasi interaksi | Password indicator berfungsi saat mengetik; register validation domain dan password indicator terverifikasi |

### Catatan Penting
- FASE 8 sudah selesai secara keseluruhan.
- Semua halaman auth, onboarding, dan profil memenuhi spesifikasi `06-AUTH-ONBOARDING.md` dan `16-LANGKAH-KERJA-BERTAHAP.md`.
- Aplikasi siap dilanjutkan ke **FASE 9: Dashboard Admin Master Data** atau audit menyeluruhan.

## FASE 9 Admin Dashboard Master Data Notes
- Audited admin dashboard master data against `07-DASHBOARD-ADMIN.md` and `16-LANGKAH-KERJA-BERTAHAP.md`.
- Dashboard metrics aligned to spec: Total Pengguna, Peminjaman Aktif, Alat Tersedia, Laboratorium Aktif, Pendaftaran Menunggu, Maintenance Berlangsung.
- Dashboard charts corrected: tren peminjaman 6 bulan (line), status peminjaman (bar), distribusi lab (doughnut), alat populer (horizontal bar).
- Added counter animation to metric cards and direct approve/reject actions for pending registrations.
- Added `Show` pages for Peminjaman, Laboratorium, Alat, Kategori Alat, and Video Tutorial.
- Peminjaman admin index now supports filter by status and search by peminjam/ Laboratorium.
- Serah Terima and Pengembalian forms include `datetime-local` with default `now` and live denda estimation preview.
- Added admin Pesan Kontak page with filtering, read/reply status, and in-app notifications to admins.
- Added email/WhatsApp notification templates to Pengaturan `notifikasi` group with default values.
- Visual regression: `tmp-visual-fase9.mjs` captures all FASE 9 admin pages successfully.

## FASE 9 Audit Status

**Status: SELESAI** — Dashboard admin dan modul master data berfungsi sesuai `07-DASHBOARD-ADMIN.md` dan `16-LANGKAH-KERJA-BERTAHAP.md`.

### Hasil Pemeriksaan FASE 9
- **Dashboard Admin** `/dashboard/admin` tersedia dengan metrik utama, grafik, daftar peminjaman terbaru, pendaftaran menunggu, aktivitas, dan akses cepat modul.
- **Modul master data lengkap** dan dapat diakses:
  - Program Studi CRUD `/dashboard/admin/program-studi`
  - Pengguna CRUD + verifikasi `/dashboard/admin/users` dan `/dashboard/admin/verifikasi-akun`
  - Laboratorium CRUD + galeri + dokumen + tata tertib + pengelola `/dashboard/admin/laboratorium`
  - Kategori Alat CRUD `/dashboard/admin/kategori-alat`
  - Alat CRUD + spesifikasi + galeri + dokumen + video + QR `/dashboard/admin/alat`
  - Video Tutorial CRUD `/dashboard/admin/video-tutorial`
  - Peminjaman, Serah Terima, Pengembalian, Kerusakan, Maintenance `/dashboard/admin/peminjaman` dkk.
  - Pengaturan Sistem, Laporan, Audit Log, Pesan Kontak, Backup.
- **CRUD berfungsi**:
  - Create/Update/Delete Program Studi, Laboratorium, Alat, Video Tutorial.
  - Approve/reject pengguna terverifikasi.
  - QR code di-generate saat alat dibuat, dapat diunduh PNG/PDF/label.
  - Non-admin di-redirect saat mencoba akses halaman admin.
- **Tampilan & UX**:
  - Dark mode dan light mode konsisten.
  - Dashboard semua peran (admin, pimpinan, kepala lab, laboran, dosen, mahasiswa) tampil normal.
  - Tab detail Laboratorium (Profil, Galeri, Tata Tertib, Dokumen, Pengelola, Riwayat) dan Alat (Informasi, Spesifikasi, Galeri, Dokumen, Video, QR Code, Riwayat) berfungsi.
- **Build & test**:
  - `php artisan test`: **97 passed (580 assertions)**
  - `npm run build`: Berhasil
  - Visual FASE 9: semua halaman admin + dashboard peran + light/dark tampil normal

### Temuan dan Perbaikan
1. **QR Code di dashboard admin tidak tampil sebagai preview**.
   - **Penyebab**: Tab QR Code pada `Dashboard/Admin/Alat/Show.tsx` hanya menampilkan ikon placeholder dan tombol download tanpa preview gambar.
   - **Perbaikan**: Menampilkan gambar QR Code dari `item.qr_kode_path` dengan fallback informasi jika belum ada, lengkap dengan tombol unduh PNG dan label.

2. **Public detail alat tidak memiliki tab QR Code**.
   - **Penyebab**: `resources/js/Pages/Public/AlatDetail.tsx` tidak menyertakan tab QR Code, sehingga publik hanya bisa mengunduh dari tombol hero/sidebar.
   - **Perbaikan**: Menambahkan tab `QR Code` pada detail alat publik dengan tampilan preview gambar QR dan tombol unduh.

3. **Label status dan kondisi alat tidak konsisten**.
   - **Penyebab**: Status `tidak_tersedia` dan kondisi `baik` ditampilkan sebagai `tidak tersedia` (lowercase) dan `baik` (lowercase), padahal map label tersedia di `lib/status.ts`.
   - **Perbaikan**: Menggunakan `alatStatusMap` dan `kondisiAlatMap` pada `Dashboard/Admin/Alat/Show.tsx`, `Components/AlatShow.tsx`, dan `Public/AlatDetail.tsx` sehingga label tampil "Tidak Tersedia" dan "Baik".

5. **Gambar demo asset corrupt menampilkan ikon gambar rusak**.
   - **Penyebab**: `DemoAssetHelper` menggunakan `Http::fake()` saat testing dan beberapa file demo hanya 15 byte placeholder; di lingkungan dev/test gambar `foto_utama`, galeri, thumbnail video, avatar, dan QR bisa gagal dimuat.
   - **Perbaikan**: Menambahkan komponen reusable `ImageWithFallback.tsx` dan menerapkannya di `Dashboard/Admin/Laboratorium/Show.tsx`, `Dashboard/Admin/Alat/Show.tsx`, `Components/AlatEdit.tsx`, `Components/SortableGallery.tsx`, `Components/AlatShow.tsx`, `Components/LaboratoriumShow.tsx`, `Components/Avatar.tsx`, `Pages/Public/AlatDetail.tsx`, `Pages/Public/LaboratoriumDetail.tsx`, `Pages/Public/Beranda.tsx`, `Pages/Public/Alat.tsx`, `Pages/Public/Laboratorium.tsx`, `Pages/Public/Tutorial.tsx`, `Pages/Public/TutorialDetail.tsx`, `Pages/Dashboard/Peminjaman/Show.tsx`, dan `Layouts/PublicLayout.tsx`, sehingga gambar gagal dimuat menampilkan placeholder rapi alih-alih ikon broken image.

6. **Tanggal di tabel Kerusakan tampil ISO mentah**.
   - **Penyebab**: `KerusakanManager.tsx` langsung mencetak `tanggal_dilaporkan` tanpa `formatDate`.
   - **Perbaikan**: Menggunakan `formatDate(k.tanggal_dilaporkan)` di tabel agar tampil `12 Juli 2026`.

7. **Label status & peran di Laporan masih raw/snake_case**.
   - **Penyebab**: `LaporanView.tsx` hanya memetakan variant badge, tidak memetakan label.
   - **Perbaikan**: Menambahkan `STATUS_LABELS` dan fungsi `statusLabel()`, memperlakukan kolom `peran` sebagai status, sehingga tabel laporan menampilkan label `Belum Verifikasi Email`, `Menunggu Persetujuan`, `Aktif`, `Mahasiswa`, dll.

8. **Placeholder durasi video `mm:ss` tidak sesuai tipe integer**.
   - **Penyebab**: Input durasi di `AlatEdit.tsx` memakai placeholder `mm:ss` padahal backend menyimpan detik integer.
   - **Perbaikan**: Mengubah input durasi menjadi `type="number"` dengan label `Durasi (detik)` dan placeholder `Contoh: 120`.

9. **Belum ada test khusus untuk dashboard admin master data**.
   - **Perbaikan**: Menambahkan `tests/Feature/Fase9AdminMasterDataTest.php` yang memverifikasi:
     - Dashboard admin merender komponen `Dashboard/Admin/Index`.
     - Semua halaman master data admin return 200.
     - CRUD Program Studi, Alat (+ QR), Laboratorium, Video Tutorial.
     - Approve/reject pengguna.
     - Non-admin tidak bisa akses dashboard admin.

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `php artisan test` | **97 passed (580 assertions)** |
| `npm run build` | Berhasil |
| Visual FASE 9 | Semua halaman admin, dashboard peran, dark/light, desktop/mobile tampil normal |
| Simulasi interaksi | Tab detail, approve/reject, CRUD, QR download berfungsi |

### Catatan Penting
- FASE 9 sudah selesai secara keseluruhan.
- Aplikasi siap dilanjutkan ke **FASE 10: Peminjaman End-to-End** atau audit menyeluruhan.

## FASE 10 Peminjaman End-to-End Audit Status

**Status: SELESAI** — Flow peminjaman end-to-end (ajukan → dosen → laboran → serah terima → pengembalian/denda) berfungsi dan terhubung antar peran.

### Hasil Pemeriksaan FASE 10
- Semua controller terkait peminjaman tersedia per peran: `Mahasiswa/PeminjamanController` (wizard 4 langkah), `Dosen/PeminjamanController`, `Laboran/PeminjamanController`, `KepalaLab/PeminjamanController`, dan `Admin/PeminjamanController`.
- Semua flow approval/rejection mengubah status dan mengembalikan stok reserved secara konsisten.
- `Laboran/SerahTerimaController` dan `Laboran/PengembalianController` memindahkan stok reserved → dipinjam → tersedia, mencatat kondisi, foto bukti, denda keterlambatan/kerusakan, serta membuat record `KerusakanAlat` otomatis saat pengembalian rusak.
- `DendaService` menyediakan perhitungan denda terpusat dan digunakan oleh `Admin/PengembalianController` serta `Laboran/PengembalianController`.
- Model `Peminjaman`, `PeminjamanDetail`, `SerahTerima`, `Pengembalian`, `PeminjamanStatusLog` terhubung dengan log status, notifikasi, dan perhitungan stok.
- Auto-cancel (`chemlos:auto-cancel`) dan pengingat (`chemlos:send-reminders`) terdaftar di `routes/console.php`.
- Semua route peminjaman/serah-terima/pengembalian per role tercantum di `routes/web.php`.
- Wizard mahasiswa (`Baru.tsx`) dapat memilih lab, memilih alat, mengisi detail, dan preview sebelum ajukan.
- `PeminjamanFlowTest` dan `PeminjamanDetailAndCalendarTest` memverifikasi alur: ajukan → dosen approve → laboran approve → serah terima → pengembalian.

### Temuan dan Perbaikan FASE 10
1. **Tombol Setuju/Tolak admin muncul untuk status berlangsung/terlambat/terlambat**.
   - **Penyebab**: `Admin/Peminjaman/Index.tsx` dan `Admin/Peminjaman/Show.tsx` memperbolehkan approve/reject pada status setelah peminjaman aktif.
   - **Perbaikan**: Membatasi aksi admin hanya untuk status `diajukan`, `menunggu_dosen`, dan `menunggu_laboran`; menghapus `disetujui`, `berlangsung`, dan `terlambat` dari kondisi tombol. Backend `Admin/PeminjamanController::reject` juga diperketat agar hanya menolak status sebelum disetujui.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Admin\PeminjamanController.php" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Admin\Peminjaman\Index.tsx" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Admin\Peminjaman\Show.tsx" />.

2. **Breadcrumb dashboard menampilkan query string di label**.
   - **Penyebab**: `DashboardBreadcrumb.tsx` dan `PublicBreadcrumb.tsx` memecah `usePage().url` (termasuk query string) menjadi segmen, sehingga label menjadi `Peminjaman?Search=&Status=`.
   - **Perbaikan**: Mengambil hanya bagian path sebelum `?` untuk membuat segmen breadcrumb.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Components\DashboardBreadcrumb.tsx" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Components\PublicBreadcrumb.tsx" />.

3. **Visual regression FASE 10 berhasil**.
   - `tmp-visual-fase10.mjs` mengambil screenshot halaman index/show peminjaman untuk admin, pimpinan, kepala lab, laboran, dosen, dan mahasiswa.
   - `tmp-visual-fase10-flow.mjs` mensimulasikan wizard mahasiswa (step 1–4), form serah terima laboran, dan detail/show admin dengan tab alat/timeline.

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `php artisan test` | **97 passed (580 assertions)** |
| `npm run build` | Berhasil |
| Visual FASE 10 | Semua halaman peminjaman, serah terima, pengembalian per peran tampil normal |
| Simulasi flow | Wizard peminjaman, serah terima, pengembalian, dan detail/timeline dapat diakses |

### Catatan Penting
- Aksi `Setuju`/`Tolak` admin sekarang hanya tersedia saat peminjaman masih dalam tahap awal (`diajukan` / `menunggu_dosen` / `menunggu_laboran`), sejalan dengan flow persetujuan.
- Breadcrumb bersih dari query string di semua halaman dashboard dan publik.
- FASE 10 siap dilanjutkan ke audit keseluruhan atau FASE 16+.

## FASE 11 Kerusakan & Maintenance Audit Status

**Status: SELESAI** — Modul kerusakan dan maintenance terhubung end-to-end: otomatis dari pengembalian, manual oleh admin/laboran, maintenance CRUD, stok update konsisten, dan peran Kepala Lab dibatasi sesuai spesifikasi.

### Hasil Pemeriksaan FASE 11
- **Model & migrasi**: `kerusakan_alat` dan `maintenance_alat` lengkap dengan kolom `jumlah`, `stok_sudah_dialihkan`, `pelapor_id`, `laboran_id`, `kerusakan_id`, `maintenance_id`, relasi, casts, scope, dan `LogsActivity`.
- **Status map**: `statusKerusakanMap`, `statusMaintenanceMap`, `kondisiAlatBadgeMap` tersedia di `resources/js/lib/status.ts` dan digunakan `KerusakanManager`, `MaintenanceManager`, serta halaman publik (`AlatDetail` riwayat).
- **Controller peran**:
  - `Admin/KerusakanController` & `Admin/MaintenanceController`: CRUD penuh, update status, start/complete/cancel maintenance, stok bergerak konsisten, notifikasi terkirim.
  - `Laboran/KerusakanController` & `Laboran/MaintenanceController`: scoped ke lab yang dikelola, lapor/edit/hapus kerusakan, daftarkan ke maintenance, maintenance CRUD dengan start/complete/cancel.
  - `KepalaLab/KerusakanController` & `KepalaLab/MaintenanceController`: mewarisi Laboran, view & status & daftar maintenance diizinkan.
  - `Pimpinan/KerusakanController` & `Pimpinan/MaintenanceController`: read-only dengan filter status/lab/cari.
  - `Dosen/KerusakanController` & `Mahasiswa/KerusakanController`: read-only untuk kerusakan terkait bimbingan/pribadi dengan filter status, kondisi, dan pencarian.
- **Stok logic**: Kerusakan `rusak_ringan` memindahkan `stok_tersedia` → `stok_maintenance` saat maintenance. Maintenance `selesai` untuk `rusak_ringan` mengembalikan `stok_tersedia`. Maintenance `selesai` untuk `rusak_berat`/`hilang` mengurangi `stok_total`. Cancel maintenance mengembalikan stok.
- **Riwayat di halaman publik**: `DetailDataService` menyertakan `kerusakan` dan `maintenance` di riwayat alat/laboratorium dan kalender.
- **Kalender**: `KalenderService::eventDariMaintenance` membuat event maintenance berwarna ungu/merah sesuai status.

### Temuan dan Perbaikan FASE 11
1. **Kepala Lab dapat membuat, mengedit, dan menghapus kerusakan** padahal spesifikasi `09-DASHBOARD-KEPALA-LAB.md` membatasi aksi kerusakan Kepala Lab menjadi Detail, Daftarkan ke Maintenance, dan Abaikan.
   - **Perbaikan UI**: `resources/js/Pages/Dashboard/KepalaLab/Kerusakan/Index.tsx` sekarang mengirim `canCreate={false} canEdit={false} canDelete={false}` ke `KerusakanManager`, sehingga tombol "Laporkan Kerusakan", "Edit", dan "Hapus" tidak tampil.
   - **Perbaikan backend**: `App\Http\Controllers\KepalaLab\KerusakanController` meng-override `store`, `update`, dan `destroy` untuk mengembalikan pesan error. Kepala Lab tetap bisa `updateStatus` (Abaikan/Dicek/Selesai) dan `registerMaintenance`.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\KepalaLab\KerusakanController.php" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\KepalaLab\Kerusakan\Index.tsx" />.

2. **Test `KerusakanMaintenanceFlowTest` menggunakan kolom `pelapor_user_id` yang sudah tidak ada** setelah migrasi `fase2_schema_alignment` menggantinya menjadi `pelapor_id`.
   - **Perbaikan**: Mengganti `pelapor_user_id` menjadi `pelapor_id` di seluruh test.
   - **Penambahan test**: Menambahkan `test_kepala_lab_tidak_bisa_laporkan_edit_hapus_kerusakan` untuk memastikan pembatasan Kepala Lab.

3. **Visual regression FASE 11**: Menambahkan `tmp-visual-fase11.mjs` yang mengambil screenshot `/dashboard/{peran}/kerusakan` dan `/dashboard/{peran}/maintenance` untuk admin, laboran, dosen, mahasiswa, kepala lab, dan pimpinan. Hasil menunjukkan Kepala Lab tidak memiliki tombol "Laporkan Kerusakan" dan seluruh halaman dimuat tanpa error.

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `php artisan test` | **98 passed (587 assertions)** |
| `npm run build` | Berhasil |
| Visual FASE 11 | Semua halaman kerusakan & maintenance per peran tampil normal |
| Simulasi flow | Laboran laporkan kerusakan → daftarkan maintenance → selesai → stok kembali |

### Catatan Penting
- Kepala Lab sekarang hanya dapat melihat kerusakan, mengubah status, dan mendaftarkan ke maintenance; tidak bisa membuat, mengedit, atau menghapus laporan kerusakan manual.
- Stok invariant `stok_total = stok_tersedia + stok_reserved + stok_dipinjam + stok_maintenance` tetap terjaga saat kerusakan dan maintenance diproses.
- FASE 11 siap dilanjutkan ke FASE 12+ atau audit menyeluruh.

## FASE 12 Dashboard Peran Lain Audit Status

**Status: SELESAI** — Dashboard, navigasi, dan konektivitas antar halaman untuk peran pimpinan, kepala lab, laboran, dosen, dan mahasiswa telah diaudit dan disempurnakan sesuai spesifikasi.

### Hasil Pemeriksaan FASE 12
- **Pimpinan**:
  - Dashboard pimpinan menampilkan metrik ringkas dan navigasi ke semua menu: Program Studi, Laboratorium, Alat, Kerusakan, Maintenance, Peminjaman, Pengembalian, Laporan, Audit Log, Pengaturan.
  - Halaman Peminjaman (read-only) sekarang memiliki kolom **Aksi** dengan ikon detail (`Eye`) untuk melihat detail peminjaman.
  - Route dan controller `Pimpinan/PeminjamanController::show` ditambahkan, merender `Dashboard/Peminjaman/Show` dengan `role: 'pimpinan'`.
  - Halaman Program Studi memungkinkan **Ketua Program Studi** untuk mengedit program studi yang diampu melalui tombol Edit bertingkat.
  - Policy `ProgramStudiPolicy::update` diperbarui agar Ketua Program Studi dapat memperbarui program studi sesuai `program_studi_id` dan `jabatan_pimpinan`.
- **Dosen**:
  - Dashboard dosen memiliki navigasi ke Peminjaman, Kerusakan, Pengembalian, dan Laporan.
  - Halaman **Pengembalian Bimbingan** sekarang memiliki kolom **Aksi** dengan ikon detail yang mengarah ke detail peminjaman (`/dashboard/dosen/peminjaman/{id}`).
- **Mahasiswa**:
  - Dashboard mahasiswa memiliki navigasi ke Peminjaman, Kerusakan, Pengembalian, Laporan, dan wizard peminjaman baru.
  - Wizard peminjaman (step 1–3) terlihat normal.
- **Kepala Lab & Laboran**:
  - Dashboard dan halaman Kerusakan/Maintenance/Peminjaman/Pengembalian tersedia dan terhubung.
  - Komponen `KerusakanManager` dan `MaintenanceManager` menyediakan aksi sesuai peran masing-masing.

### Temuan dan Perbaikan FASE 12
1. **Pimpinan tidak bisa melihat detail peminjaman**.
   - **Penyebab**: `Pimpinan/Peminjaman/Index.tsx` hanya menampilkan tabel tanpa tautan detail, dan `PimpinanPeminjamanController` tidak memiliki method `show`.
   - **Perbaikan**: Menambahkan method `show` pada `PimpinanPeminjamanController`, menambahkan route `pimpinan.peminjaman.show`, memperbarui `Dashboard/Peminjaman/Show.tsx` dengan `pimpinan` di `roleBasePath`, dan menambahkan kolom Aksi dengan ikon detail pada `Pimpinan/Peminjaman/Index.tsx`.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Pimpinan\PeminjamanController.php" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\routes\web.php" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Peminjaman\Show.tsx" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Pimpinan\Peminjaman\Index.tsx" />.

2. **Dosen tidak bisa melihat detail pengembalian mahasiswa bimbingan**.
   - **Penyebab**: `Dosen/Pengembalian/Index.tsx` menampilkan tabel tanpa tautan ke detail peminjaman.
   - **Perbaikan**: Menambahkan kolom Aksi dengan ikon detail yang mengarah ke `/dashboard/dosen/peminjaman/{id}` pada `Dosen/Pengembalian/Index.tsx`.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Dosen\Pengembalian\Index.tsx" />.

3. **Ketua Program Studi belum bisa mengedit program studi yang diampu**.
   - **Penyebab**: `ProgramStudiPolicy::update` hanya memeriksa `program-studi.manage`, dan tidak ada route/controller/view untuk edit di namespace Pimpinan.
   - **Perbaikan**: Memperbarui `ProgramStudiPolicy::update` agar `pimpinan` dengan `jabatan_pimpinan === 'ketua_program_studi'` dan `program_studi_id` cocok dapat mengedit; menambahkan `edit` dan `update` pada `PimpinanProgramStudiController`; menambahkan route `pimpinan.program-studi.edit` dan `pimpinan.program-studi.update`; membuat halaman `Pimpinan/ProgramStudi/Edit.tsx`; dan menampilkan tombol Edit di `Pimpinan/ProgramStudi/Index.tsx` untuk program studi yang diampu.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Policies\ProgramStudiPolicy.php" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Pimpinan\ProgramStudiController.php" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\routes\web.php" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Pimpinan\ProgramStudi\Edit.tsx" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Pimpinan\ProgramStudi\Index.tsx" />.

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `npm run build` | Berhasil |
| `php artisan test` | **98 passed (587 assertions)** |
| Visual FASE 12 | 53+ screenshot halaman dashboard peran, publik, dan auth tampil normal (incognito + cache disabled) |
| Simulasi interaksi | Detail peminjaman pimpinan, detail pengembalian dosen, dan tombol edit program studi terverifikasi |

### Catatan Penting
- `tmp-visual-fase12.mjs` dikonfigurasi untuk memakai mode incognito dan menonaktifkan cache agar selalu memuat build terbaru.
- FASE 12 siap dilanjutkan ke audit keseluruhan atau FASE 13+.

## FASE 12 Dashboard Peran Lain Notes
- Audited FASE 12 against `09-DASHBOARD-KEPALA-LAB.md`, `10-DASHBOARD-LABORAN.md`, `11-DASHBOARD-DOSEN.md`, `12-DASHBOARD-MAHASISWA.md`, and `19-CHECKLIST-AKHIR.md`.
- Added Laboran user-management page (`/dashboard/laboran/pengguna`) with create/edit/delete for Mahasiswa/Dosen accounts they created.
- Added `created_by` and `rejected_by` columns to `users` table with model relations and `UserPolicy` updates.
- Fixed `DashboardLayout` role switcher to read `auth.user.active_role` and use `DropdownMenu` `data` prop for `/switch-role`.
- Centralized `alatStatusMap` in `lib/status.ts` and updated `KepalaLab/Index` and `Laboran/VerifikasiAkun/Index` to use it.
- Replaced all native date/time inputs with `DatePicker`/`TimePicker`; introduced reusable `DateTimePicker` component.
- Visual regression: `tmp-visual-fase12.mjs` captures public, auth, and all role dashboard pages (122 screenshots).

## FASE 13 Notifikasi, Email, WhatsApp Notes
- Audited FASE 13 against `14-NOTIFIKASI-LAPORAN.md`, `13-FITUR-UTAMA.md`, `16-LANGKAH-KERJA-BERTAHAP.md`, and `19-CHECKLIST-AKHIR.md`.
- Completed notification triggers across controllers: Pendaftaran Akun (admin/laboran), Email Terverifikasi, Akun Disetujui/Ditolak, Peminjaman Diajukan/Disetujui/Ditolak, Serah Terima, Pengembalian, Kerusakan, Maintenance, Keterlambatan.
- `NotifikasiService` now respects per-user `notifikasi_email`, `notifikasi_whatsapp`, and `notifikasi_in_app` preferences.
- Added configurable email/WA template interpolation from `Pengaturan` (`template_email_*` / `template_whatsapp_*`) with `{{nama}}`, `{{kode}}`, `{{status}}`, `{{alasan}}`, `{{batas}}`, etc.
- Renamed scheduler commands to `chemlos:auto-cancel`, `chemlos:send-reminders`, `chemlos:backup-database` and updated `routes/console.php`.
- `KirimPengingatPeminjaman` now supports H-1/H-0 serah terima, H-2/H-1/H-0 pengembalian, and a separate `notifikasi_keterlambatan` toggle.
- Added all missing notification toggles to `PengaturanSeeder`, `PengaturanController` defaults, and `Pengaturan/Index` React form (`whatsapp_provider`, reminder switches, keterlambatan).
- Created custom `VerifikasiEmail` Mailable + Blade view; overridden `User::sendEmailVerificationNotification()` to send the branded HTML email.
- Added `VITE_BROADCAST_DRIVER=null` to `.env` so broadcasting defaults to disabled in dev unless Pusher/Reverb keys are configured.

## FASE 14 Laporan, Audit Log, dan Backup Notes
- Audited FASE 14 against `14-NOTIFIKASI-LAPORAN.md` and `16-LANGKAH-KERJA-BERTAHAP.md`.
- Verified existing `LaporanService` covers 8 report types (pengguna, laboratorium, alat, kerusakan, maintenance, peminjaman, pengembalian, aktivitas) with filters and role-scoped `allowedJenis`.
- `LaporanView` supports preview, Excel export, and PDF export for all roles; added clickable row detail modal with formatted JSON display.
- `AuditLogBaseController` exposes audit log preview/export for admin and pimpinan using `spatie/laravel-activitylog`.
- Fixed `BackupController::store` to call the renamed `chemlos:backup-database` command and added audit log entries for backup/restore actions.
- Aligned scheduler: `chemlos:auto-cancel` runs `hourly()`, `chemlos:send-reminders` at 08:00 daily, and `chemlos:backup-database` runs `weekly()`.
- Visual regression: `tmp-visual-fase14.mjs` captures public, auth, and all role dashboard pages including Laporan, Audit Log, and Backup (135 screenshots).

## FASE 15 Testing, Optimization, dan Audit Visual Global

**Status: SELESAI** — Audit menyeluruh terhadap seluruh route, halaman, fungsi, dan tampilan aplikasi telah dilakukan, kekurangan ditemukan dan diperbaiki, serta build, test, dan simulasi visual ulang berhasil.

### Hasil Audit FASE 15
- **Membaca seluruh spesifikasi** di `chemlos/spesifikasi/*.md` untuk memahami cakupan pengujian, optimasi, dan checklist akhir.
- **Route & halaman inventory**: Semua web route, API route, dan halaman Inertia React telah dipetakan.
  - 10 halaman awalnya terdeteksi "missing"; setelah verifikasi, 9 adalah halaman `Show` peminjaman yang memang menggunakan komponen `Dashboard/Peminjaman/Show` bersama, dan 1 adalah route `/calendar-test` yang tidak memiliki komponen.
  - Route `/calendar-test` dihapus dari `routes/web.php` karena halaman tidak ada dan tidak dimaksudkan untuk produksi.
- **Peminjaman Show**: Dikonfirmasi semua peran (`admin`, `pimpinan`, `kepala_lab`, `laboran`, `dosen`, `mahasiswa`) memiliki method `show` yang merender komponen `Dashboard/Peminjaman/Show` bersama.
- **Audit visual menyeluruh**: `tmp-visual-fase15.mjs` menghasilkan screenshot untuk:
  - Semua halaman publik (12 halaman + detail).
  - Semua halaman autentikasi (login, daftar, lupa password, verifikasi, menunggu, ditolak, tidak aktif, lengkapi profil).
  - Dashboard semua peran: admin, pimpinan, kepala lab, laboran, dosen, mahasiswa (termasuk index, create, edit, show, laporan, audit log, backup, dan halaman bersama seperti profil, notifikasi, kalender).

### Temuan dan Perbaikan
1. **Demo asset gambar rusak (15 byte `fake-image-data`)**.
   - **Penyebab**: `tests/Feature/Fase5SeederTest.php` menggunakan `Http::fake()` tanpa mem-fake storage, sehingga saat test berjalan ia menulis file `fake-image-data` ke disk `public` dan merusak asset demo.
   - **Perbaikan**: Menambahkan `Storage::fake('public')` pada `Fase5SeederTest` agar seeder test tidak menulis file ke storage nyata.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\tests\Feature\Fase5SeederTest.php" />

2. **Test suite tidak terisolasi dari database demo `chemlos` MySQL**.
   - **Penyebab**: `phpunit.xml` men-set `DB_CONNECTION=sqlite` dan `DB_DATABASE=:memory:`, tetapi Laravel memuat ulang `.env` saat boot test, sehingga konfigurasi kembali ke MySQL `chemlos` dan `RefreshDatabase` dapat menghapus data demo.
   - **Perbaikan**: `tests/TestCase.php` secara eksplisit mengatur `database.default = sqlite`, `database.connections.sqlite.database = :memory:`, dan `database.connections.mysql.database = :memory:` setelah aplikasi dibuat, memastikan seluruh test berjalan di in-memory SQLite dan command `chemlos:backup-database` tidak mengakses database demo.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\tests\TestCase.php" />

3. **Login via Puppeteer visual script bermasalah**.
   - **Penyebab**: Form login menggunakan React `onSubmit` dengan `axios` lalu `Inertia router.visit`; mekanisme `Promise.all` dengan `waitForNavigation` tidak cocok untuk alur ini.
   - **Perbaikan**: `tmp-visual-fase15.mjs` diperbarui untuk mengirimkan event `submit` native dan menunggu perubahan `window.location.pathname` setelah login berhasil. Timeout `page.goto` juga dinaikkan.

4. **Konsistensi visual dan dark mode**:
   - Tidak ditemukan error konsol pada halaman publik, auth, dan dashboard utama.
   - Semua tema gelap/terang, bahasa (id default), sidebar, breadcrumb, card, tabel, dan status badge tampil konsisten.
   - Gambar demo laboratorium, alat, avatar user, dan thumbnail video berhasil dimuat setelah asset diregenerasi.

### Optimasi yang Dilakukan
- Menjalankan cache Laravel:
  - `php artisan route:cache`
  - `php artisan view:cache`
  - `php artisan config:cache`
- Build frontend production: `npm run build` berhasil (7.56s, bundle tanpa error).
- Database demo di-reset dengan `php artisan migrate:fresh --seed`; semua asset demo dihasilkan ulang dan valid.

### Verifikasi FASE 15
| Perintah | Hasil |
|----------|-------|
| `npm run build` | Berhasil |
| `php artisan test` | **120 passed (670 assertions)** |
| `php artisan test` | **120 passed (670 assertions)** (menggunakan SQLite in-memory berkat override `TestCase`) |
| `php artisan migrate:fresh --seed` | Berhasil, data demo lengkap |
| `php artisan route:cache` | Berhasil |
| `php artisan view:cache` | Berhasil |
| `php artisan config:cache` | Berhasil |
| `node tmp-visual-fase15.mjs` | Semua screenshot berhasil dihasilkan tanpa error |

### Catatan Penting
- Untuk menjalankan test, gunakan `php artisan test` (konfigurasi test sudah di-override di `tests/TestCase.php`) atau `php artisan test --env=testing`.
- `tmp-visual-fase15/` berisi screenshot audit visual terakhir; `tmp-visual-audit-fase15.mjs` dapat dijalankan ulang untuk regresi visual.
- Semua halaman Show untuk peminjaman sudah tersedia untuk semua peran melalui komponen bersama.

## FASE 16+ Penyempurnaan Pasca Utama Notes
- Consolidated duplicate fine calculation into `app/Services/DendaService.php` with `settings()` and `hitung()`. Updated `Admin/PengembalianController` and `Laboran/PengembalianController` to use it.
- Replaced native inputs/buttons with reusable components: `Public/Kontak.tsx` now uses `Input`, `Textarea`, and `Button`; `Dashboard/Laboran/VerifikasiAkun/Index.tsx` uses `DataTable`, `Input`, and `Button`; `Dashboard/Index.tsx`, `Laboran/SerahTerima/Index.tsx`, `Laboran/Pengembalian/Index.tsx`, `Public/Alat.tsx`, `Public/Laboratorium.tsx` replaced native `<button>` with `Button`.
- Improved overlay readability on video thumbnails (`Public/Tutorial.tsx`, `Public/AlatDetail.tsx`, `Components/AlatShow.tsx`) by increasing Play icon opacity and softening hover overlay.
- Added default email/WhatsApp notification templates to `PengaturanSeeder` for `umum`, `peminjaman`, `pengingat_serah_terima`, `pengingat_pengembalian`, `peminjaman_terlambat`, `pengguna`, `kerusakan`, and `maintenance` categories.
- Verified: `php artisan test` 66 passed (279 assertions), `npm run build` succeeded, and visual regression (`tmp-visual-fase14.mjs`) completed without errors.

## FASE 12 Re-Audit: Detail, Tab, dan Konektivitas Tambahan

**Status: SELESAI** — Seluruh spesifikasi `09-12` dan `19` telah dibaca ulang, struktur file aplikasi diaudit kembali, dan kekurangan pada halaman detail/tab di dashboard peran lain telah diperbaiki.

### Hasil Audit Ulang
- Membaca 20 file spesifikasi `chemlos/spesifikasi/*.md` untuk memastikan semua halaman, tab, wizard, modal, dan aksi terdefinisi dengan jelas.
- Memetakan seluruh `resources/js/Pages/Dashboard/*` dan `app/Http/Controllers/*` per peran, termasuk halaman `Index`, `Show`, `Create`, `Edit` serta komponen `KerusakanManager`, `MaintenanceManager`, `AlatShow`, `LaboratoriumShow`, `KerusakanShow`, `MaintenanceShow`.
- Mengecek tab pada `AlatShow`, `LaboratoriumShow`, `AlatEdit`, `LaboratoriumEdit`: semua tab memiliki konten (tidak kosong/stub).
- Mengecek wizard peminjaman mahasiswa (`Baru.tsx`) dan semua step: 4 langkah terhubung.
- Mengecek modal pada seluruh aplikasi: mayoritas menggunakan komponen `Modal` bersama.

### Temuan dan Perbaikan Tambahan FASE 12
1. **Dashboard Pimpinan dan Kepala Lab: tabel ringkasan peminjaman tidak memiliki tautan detail**.
   - **Perbaikan**: Menambahkan kolom **Aksi** dengan ikon `Eye` pada `Pimpinan/Index.tsx` dan `KepalaLab/Index.tsx` yang mengarah ke detail peminjaman masing-masing.

2. **Kepala Lab dan Laboran tidak memiliki halaman detail (Show) untuk Alat dan Laboratorium**.
   - **Perbaikan**:
     - Menambahkan method `show` pada `Laboran/AlatController` dan `Laboran/LaboratoriumController` (diwarisi oleh KepalaLab).
     - Membuat halaman `KepalaLab/Alat/Show.tsx`, `KepalaLab/Laboratorium/Show.tsx`, `Laboran/Alat/Show.tsx`, `Laboran/Laboratorium/Show.tsx` yang merender komponen `AlatShow`/`LaboratoriumShow`.
     - Menambahkan route `GET /{role}/alat/{alat}` dan `GET /{role}/laboratorium/{laboratorium}`.
     - Menambahkan ikon detail (`Eye`) pada `Laboran/Alat/Index.tsx`, `Laboran/Laboratorium/Index.tsx`, dan `KepalaLab/Laboratorium/Index.tsx`.

3. **Pimpinan, Kepala Lab, Laboran, Dosen, dan Mahasiswa tidak memiliki halaman detail Kerusakan**.
   - **Perbaikan**:
     - Membuat komponen `KerusakanShow.tsx` dan halaman `Show.tsx` untuk `Pimpinan`, `KepalaLab`, `Laboran`, `Dosen`, `Mahasiswa`.
     - Menambahkan method `show` pada `Pimpinan/KerusakanController`, `Dosen/KerusakanController`, `Mahasiswa/KerusakanController`, dan `Laboran/KerusakanController` (diwarisi KepalaLab).
     - Menambahkan route `GET /{role}/kerusakan/{kerusakan}`.
     - Memperbarui `KerusakanAlatPolicy::view` agar dosen/mahasiswa dapat melihat kerusakan terkait peminjaman bimbingan/sendiri.
     - Menambahkan ikon detail pada `Pimpinan/Kerusakan/Index.tsx`, `Dosen/Kerusakan/Index.tsx`, `Mahasiswa/Kerusakan/Index.tsx`, dan `KerusakanManager.tsx` (untuk KepalaLab/Laboran).

4. **Pimpinan, Kepala Lab, dan Laboran tidak memiliki halaman detail Maintenance**.
   - **Perbaikan**:
     - Membuat komponen `MaintenanceShow.tsx` dan halaman `Show.tsx` untuk `Pimpinan`, `KepalaLab`, `Laboran`.
     - Menambahkan method `show` pada `Pimpinan/MaintenanceController` dan `Laboran/MaintenanceController` (diwarisi KepalaLab).
     - Menambahkan route `GET /{role}/maintenance/{maintenance}`.
     - Menambahkan ikon detail pada `Pimpinan/Maintenance/Index.tsx` dan `MaintenanceManager.tsx` (untuk KepalaLab/Laboran).

### Verifikasi Re-Audit
| Perintah | Hasil |
|----------|-------|
| `npm run build` | Berhasil |
| `php artisan test` | **98 passed (587 assertions)** |
| Visual FASE 12 (ulang) | 53+ screenshot halaman dashboard, publik, dan auth tampil normal; plus `tmp-visual-fase12-detail.mjs` menangkap detail alat/laboratorium dan semua tab-nya |
| Simulasi interaksi | Detail peminjaman pimpinan/kepala-lab, detail alat/laboratorium dengan tab, detail kerusakan, dan detail maintenance terverifikasi |

### Catatan Penting
- Semua halaman `Show` untuk alat, laboratorium, kerusakan, dan maintenance sekarang terhubung dari masing-masing index dan dashboard ringkasan.
- Komponen tab pada `AlatShow` dan `LaboratoriumShow` (Info/Spesifikasi/Galeri/Dokumen/Video/QR/Riwayat/Jadwal) berhasil diuji visual.
- FASE 12 siap dilanjutkan ke audit menyeluruh akhir atau FASE 13+.

## FASE 13 Audit Status

**Status: SELESAI** — Notifikasi, email, WhatsApp, pengingat, pengaturan template, dan menu notifikasi diperbaiki dan terverifikasi.

### Hasil Audit FASE 13
- **20 file spesifikasi** di `chemlos/spesifikasi/*.md` telah dipetakan untuk kebutuhan notifikasi.
- **NotifikasiService** sekarang memiliki mapping kategori -> template yang konsisten, variabel template lengkap, dan fallback ke template `umum` jika kategori tidak dikenal.
- **21 template notifikasi** (email + WhatsApp) tersedia di `PengaturanSeeder` dan dapat dikonfigurasi dari halaman admin.
- **Halaman pengaturan admin** secara otomatis merender semua field yang key-nya diawali `template_` sebagai `Textarea`.
- **Menu notifikasi** (`/notifikasi`) ditambahkan di sidebar `DashboardLayout` untuk semua peran.
- **Notifikasi yang kurang** ditambahkan:
  - `AutoCancelPeminjaman` juga mengabari laboran pengelola.
  - `Laboran/MaintenanceController::store()` dan `start()` mengirim notifikasi ke laboran dan peminjam.
  - `Laboran/KerusakanController::updateStatus()` mengirim notifikasi ke pelapor dan peminjam.
- **Index performa**: ditambahkan migrasi `add_notifikasi_kategori_index` untuk kolom `kategori`.
- **Test FASE 13** baru ditambahkan di `tests/Unit/NotifikasiServiceTest.php`.

### Verifikasi FASE 13
| Perintah | Hasil |
|----------|-------|
| `npm run build` | Berhasil |
| `php artisan test` | **104 passed (598 assertions)** |
| `php artisan migrate:fresh --seed` | Berhasil |
| Visual FASE 13 | Screenshot halaman `/notifikasi` dan dropdown bell untuk admin, laboran, mahasiswa berhasil dihasilkan di `tmp-visual-fase13/` |

### Catatan Penting
- Template notifikasi sekarang robust dan tidak bergantung pada variabel `{{kode}}` di body; detail kode/alat/laboratorium muncul di tabel email jika disertakan dalam `$data`.
- Variabel tambahan (`teknisi`, `biaya`, `kondisi`, `pelapor`, `jumlah`, `foto`, `pesan`) tersedia untuk template.
- WhatsApp stub log dan fallback ke template `umum` tetap berfungsi.
- Notifikasi kategori `akun_disetujui`, `akun_ditolak`, `pendaftaran_baru`, `email_terverifikasi`, dan `kontak` sekarang memetakan ke template yang sesuai.

---

## FASE 14 Audit Status

**Status: SELESAI** — Laporan, Export, Audit Log, dan Backup terimplementasi penuh dan tersambung.

### Hasil Pemeriksaan FASE 14
- **Laporan** (`app/Services/LaporanService.php`) mencakup 8 jenis laporan: pengguna, laboratorium, alat, kerusakan, maintenance, peminjaman, pengembalian, audit log/aktivitas.
- **Kolom laporan diselaraskan dengan spesifikasi**:
  - `laboratorium` menampilkan kepala lab dan laboran dari relasi `pengelola`.
  - `alat` menampilkan stok total, tersedia, dipinjam, dan maintenance terpisah.
  - `maintenance` menampilkan kolom `teknisi` atau fallback ke `laboran`.
  - `peminjaman` menampilkan dosen pembimbing, daftar alat, periode, status, dan denda.
  - `pengembalian` menampilkan daftar alat, kondisi per alat, tanggal kembali, dan denda.
- **Akses per role** (`LaporanBaseController::context` + `allowedJenis`) memastikan admin/pimpinan melihat semua data, kepala lab/laboran hanya lab yang dikelola, dosen hanya bimbingannya, dan mahasiswa hanya riwayat peminjamannya.
- **Export Excel & PDF** tersedia untuk semua role yang memiliki `laporan.view`. `app/Exports/LaporanExport.php` dan view `resources/views/laporan/pdf.blade.php` digunakan oleh seluruh jenis laporan.
- **Audit Log** menggunakan Spatie Activitylog, terintegrasi pada 23 model, serta ditampilkan di halaman `Audit Log` admin dan pimpinan dengan filter pengguna, aksi/event, tabel, dan rentang tanggal.
- **Backup Database** (`chemlos:backup-database`) membuat dump SQL ke `storage/app/private/backups/`. `Admin/BackupController` menyediakan list, download, restore upload SQL, dan hapus. Scheduler `routes/console.php` menjalankan backup mingguan.
- **Command pengingat** `chemlos:send-reminders` ditambahkan untuk mengirim notifikasi H-2, H-1, dan H pengembalian serta serah terima, termasuk notifikasi keterlambatan.

### Temuan dan Perbaikan
1. **Kolom laporan tidak sesuai spesifikasi**: peminjaman/pengembalian/maintenance/alat/laboratorium kekurangan kolom yang diminta.
   - **Perbaikan**: Memperbarui `FIELDS`, `LABELS`, query eager-load, dan method `row()` di `LaporanService` agar kolom dan format sesuai spec.
2. **Command `chemlos:send-reminders` belum ada** padahal terdaftar di scheduler.
   - **Perbaikan**: Menambahkan `app/Console/Commands/SendReminders.php` yang mengirim pengingat serah terima, pengembalian, dan keterlambat sesuai pengaturan `notifikasi.reminder_*`.
3. **Audit log hanya filter deskripsi**: filter "aksi" tidak spesifik.
   - **Perbaikan**: `queryAktivitas` memfilter kolom `event` untuk filter aksi.

### Verifikasi FASE 14
| Perintah | Hasil |
|----------|-------|
| `npm run build` | Berhasil |
| `php artisan test` | **120 passed (670 assertions)** |
| `php artisan migrate:fresh --seed` | Berhasil |
| Visual FASE 14 | Screenshot halaman laporan, audit log, dan backup untuk admin/pimpinan/laboran/mahasiswa berhasil dihasilkan di `tmp-visual-fase14/` |
| `php artisan chemlos:backup-database` | Berhasil menghasilkan dump SQL (~890 KB untuk database demo) |

### File Baru/Diubah
- `app/Services/LaporanService.php` (kolom, row, query)
- `app/Console/Commands/SendReminders.php`
- `tests/Unit/LaporanServiceTest.php`
- `tests/Feature/Fase14LaporanTest.php`
- `tmp-visual-fase14.mjs`

### Catatan Penting
- Backup disimpan di `storage/app/private/backups` sesuai root disk `local` Laravel 13.
- Restore wajib melalui modal konfirmasi dan akan menimpa seluruh database.
- Scheduler backup otomatis (`weekly`) telah terdaftar di `routes/console.php` bersama `chemlos:auto-cancel` dan `chemlos:send-reminders`.
- Untuk visualisasi FASE 14, jalankan `php artisan serve --host=127.0.0.1 --port=8001` lalu `node tmp-visual-fase14.mjs`.

## Global Audit FASE 15 (Final)

**Status: SELESAI** — Audit global menyeluruh terhadap seluruh spesifikasi, halaman, fitur, dan komponen UI telah dilakukan.

### Hasil Audit Global
- **Spesifikasi**: 20 file `.md` di `chemlos/spesifikasi/` dibaca dan diringkas; seluruh requirement FASE 1–16 tercakup.
- **Inventaris aplikasi**:
  - 308 route, 57 controller, 21 model, 58 komponen reusable, 120+ halaman React, 14 policy, 7 middleware, 22 migrasi, 16 seeder.
  - Semua controller terhubung ke route, semua route memiliki React page, tidak ada TODO/FIXME/placeholder.
- **Audit visual global**:
  - Jalankan `node tmp-visual-audit-fase15.mjs` setelah `npm run build`.
  - Screenshot berhasil dihasilkan untuk: 12 halaman publik, 8 halaman auth, 14+ modul dashboard admin, 11 modul pimpinan, 8 modul kepala lab, 11 modul laboran, 5 modul dosen, 4 modul mahasiswa, termasuk semua tab pada halaman show/edit.
  - Wizard peminjaman 4 langkah (step 1–4) tercapture.
  - Kalender FullCalendar muncul di beranda, detail lab/alat, dan dashboard, lengkap dengan filter dan legenda.
- **Audit kode**:
  - Ditemukan duplikasi command signature `chemlos:send-reminders` antara `app/Console/Commands/SendReminders.php` dan `app/Console/Commands/KirimPengingatPeminjaman.php`.
  - **Perbaikan**: `SendReminders.php` dihapus; `KirimPengingatPeminjaman.php` menjadi command tunggal.
  - Komponen `LoadingScreen.tsx` sempat terhapus dan menyebabkan `Fase6FrontendTest` gagal; **perbaikan**: memulihkan file `resources/js/Components/LoadingScreen.tsx`.

### Verifikasi Akhir
| Perintah | Hasil |
|----------|-------|
| `npm run build` | Berhasil |
| `php artisan test` | **120 passed (670 assertions)** |
| `php artisan migrate:fresh --seed` | Berhasil (60 alat, 5 laboratorium, 24 peminjaman, dsb.) |
| Visual audit global | Screenshot seluruh halaman dan tab berhasil di `tmp-visual-audit-fase15/` |

### Temuan Tersisa (Non-Critical)
- **Pusher 404 warning**: broadcast notifikasi ke Pusher mengembalikan 404 di environment dev karena Pusher/Reverb masih stub; ini sesuai spesifikasi dan tidak memengaruhi fungsionalitas in-app/email.
- **Halaman Kalender dedicated**: `/kalender/peminjaman` saat ini berfungsi sebagai API JSON untuk widget FullCalendar; spesifikasi tidak mensyaratkan halaman khusus kalender, widget di beranda/dashboard sudah mencukupi.

## FullCalendar Refinement

**Status: SELESAI** — Tooltip, pop-up, dan tombol toolbar FullCalendar telah diseragamkan.

### Temuan
- Tooltip event terlihat "entah dimana" dan tidak menempel pada jadwal terpilih saat halaman di-scroll.
- Pop-up/modal event saat diklik terlihat terpotong karena parent layout memiliki `transform` akibat animasi fade-in.
- Tombol mundur/maju/hari ini FullCalendar tampil tidak seragam dengan desain ChemLOS (gabungan tanpa gap, border-radius setengah, "hari ini" pudar saat disabled).

### Perbaikan
- **Tooltip**:
  - Dikeluarkan dari DOM `main` dengan `createPortal` ke `document.body` agar `position: fixed` benar-benar relatif ke viewport.
  - `z-index` diperbaiki dari `z-100` (tidak valid Tailwind) menjadi `z-[100]`.
  - Posisi default diatur di bawah kursor dengan pusat horizontal, otomatis flip ke atas saat mendekati tepi viewport, dan mengikuti pergerakan mouse (`eventMouseMove`).
- **Modal/Pop-up**:
  - `Modal` dikeluarkan ke `document.body` via `createPortal`, memastikan modal selalu terlihat penuh di tengah viewport meski `main` memiliki `transform`.
- **Tombol Toolbar**:
  - CSS khusus FullCalendar ditambahkan di `resources/css/app.css` untuk `.fc-button`, `.fc-button-group`, `.fc-prev-button`, `.fc-next-button`, `.fc-today-button`.
  - Tombol memiliki border-radius penuh, gap antar tombol, warna seragam, hover/active state, dan disabled state yang masih terbaca.

### Verifikasi
| Halaman | Tooltip | Pop-up | Tombol |
|---------|---------|--------|--------|
| Beranda | OK | OK | OK |
| Dashboard mahasiswa | OK | OK | OK |
| Detail laboratorium (tab Jadwal) | OK | OK | OK |

### Kesimpulan
Aplikasi ChemLOS sudah sesuai dengan spesifikasi global. Semua fitur inti (auth, dashboard per role, peminjaman wizard, serah terima, pengembalian, kerusakan, maintenance, laporan, notifikasi, audit log, backup, pengaturan, dan kalender) berfungsi. Tidak ada halaman 404/500 pada jalur utama, semua tab show/edit ter-render, tooltip kalender menempel pada jadwal terpilih, pop-up modal tidak terpotong, dan build production siap.

## Re-Audit Dashboard Admin

**Status: SELESAI** — Audit visual dan fungsional menyeluruh terhadap seluruh halaman dashboard admin dilakukan, temuan minor diperbaiki, dan verifikasi build/test berhasil.

### Hasil Audit
- Membaca spesifikasi `07-DASHBOARD-ADMIN.md` dan memetakan 40+ halaman admin (index, create, edit, show, laporan, audit log, backup, pengaturan, dll.).
- Menjalankan `node tmp-admin-console.mjs` untuk memeriksa `console.error` di semua halaman admin: **tidak ada error JavaScript**.
- Menjalankan `node tmp-visual-admin.mjs` dan `node tmp-capture-one.mjs` untuk mengambil screenshot seluruh halaman admin termasuk beberapa tab.
- Memverifikasi semua modul admin terhubung: Program Studi, Laboratorium, Kategori Alat, Alat, Pengguna, Verifikasi Akun, Peminjaman, Serah Terima, Pengembalian, Kerusakan, Maintenance, Video Tutorial, Laporan, Audit Log, Backup, Pesan Kontak, Pengaturan.

### Temuan dan Perbaikan
1. **Card stok pada halaman Edit Alat tidak menampilkan Stok Reserved (Dipesan)**.
   - **Penyebab**: Hanya 4 card (Tersedia, Dipinjam, Maintenance, Total) ditampilkan, sehingga invariant `stok_total = tersedia + reserved + dipinjam + maintenance` tidak tampak utuh.
   - **Perbaikan**: Menambahkan card **Stok Dipesan (Reserved)** dan menyusun ulang 5 card stok di `resources/js/Components/AlatEdit.tsx`.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Components\AlatEdit.tsx" />

2. **Card metrik Dashboard Admin tidak memiliki aksi klik**.
   - **Penyebab**: Spesifikasi `07-DASHBOARD-ADMIN.md` mensyaratkan setiap metrik utama dapat diklik untuk mengarah ke modul terkait; card hanya berupa `div` statis.
   - **Perbaikan**: Menambahkan `href` pada setiap definisi metrik dan mengubah `MetricCard` di `resources/js/Pages/Dashboard/Index.tsx` menjadi `Link` dari Inertia bila `href` tersedia, sekaligus mempertahankan animasi hover.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Index.tsx" />

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `npm run build` | Berhasil |
| `php artisan test` | **120 passed (670 assertions)** |
| Visual re-audit admin | Screenshot semua halaman admin dan tab terpilih tampil normal, tidak ada `console.error` |

## NumberStepper & UI Consistency Follow-up

**Status: SELESAI** — `NumberStepper` digunakan untuk input jumlah di seluruh form yang sebelumnya memakai `type="number"`, serta filter Kerusakan/Maintenance dan menu profil navbar diseragamkan.

### Perbaikan
- **NumberStepper integration**:
  - Mengganti native `type="number"` pada `KerusakanManager`, `AlatEdit`, `LaboratoriumEdit`, `Admin/Alat/Create`, `Admin/Laboratorium/Create`, `Admin/VideoTutorial/Create` & `Edit`, serta `Auth/LengkapiProfil`.
  - Memastikan jumlah stok, kapasitas, hari operasional, dan jumlah pengguna dapat diatur via stepper +/-.
- **Filter Kerusakan & Maintenance**:
  - Menambahkan `search` filter pada `Admin/KerusakanController`, `Laboran/KerusakanController`, `Admin/MaintenanceController`, dan `Laboran/MaintenanceController`.
  - Memperbarui `KerusakanManager` dan `MaintenanceManager` dengan `SearchInput`, `FilterChips` untuk status/kondisi, serta layout filter yang seragam dengan `Peminjaman`.
- **Detail page 500**:
  - Menambahkan method `show` dan route `GET` untuk `Admin/Kerusakan` dan `Admin/Maintenance` agar tombol mata di tabel tidak mengembalikan error 500/405.
  - Membuat halaman `Dashboard/Admin/Kerusakan/Show.tsx` dan `Dashboard/Admin/Maintenance/Show.tsx` yang merender komponen `KerusakanShow` dan `MaintenanceShow`.
- **Filter Laporan & Log Audit icon/label**:
  - Menambahkan `gap-3` dan `flex-1` pada label di `DatePicker`, `Select`, dan `SelectSearch` sehingga teks tidak lagi menempel ikon chevron/kalender.
- **Menu profil navbar**:
  - Memperbaiki dropdown user di `DashboardLayout` agar menu `Pengaturan` mengarah ke URL per peran (`/dashboard/{role}/pengaturan`) dan disembunyikan untuk dosen/mahasiswa.
  - Menghapus item `Pengaturan` yang tidak relevan pada `PublicLayout` (guest/public).

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `npm run build` | Berhasil |
| `php artisan test` | **120 passed (670 assertions)** |
| `php artisan route:cache` | Berhasil |
| `php artisan view:cache` | Berhasil |

### File penting yang diubah
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Admin\KerusakanController.php" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Admin\MaintenanceController.php" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Laboran\KerusakanController.php" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Laboran\MaintenanceController.php" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Components\Dashboard\KerusakanManager.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Components\Dashboard\MaintenanceManager.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Components\DatePicker.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Components\Select.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Components\SelectSearch.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Layouts\DashboardLayout.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Layouts\PublicLayout.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\routes\web.php" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\tests\Feature\Fase9AdminMasterDataTest.php" />

## Edit/View Sync & Multi-Upload Tabs Follow-up

**Status: SELESAI** — Halaman edit Laboratorium dan Alat sekarang sinkron dengan halaman view/show, termasuk tab Alat, Jadwal, Galeri, Dokumen, Video, QR, Tata Tertib, dan Riwayat. Halaman tambah Alat untuk Laboran/Kepala Lab diseragamkan dengan komponen reusable.

### Perbaikan
- **Admin & Laboran/Kepala Lab Laboratorium edit/view sync**:
  - Mengganti halaman `Dashboard/Admin/Laboratorium/Show.tsx` dan `Dashboard/Admin/Alat/Show.tsx` dengan wrapper komponen `LaboratoriumShow` dan `AlatShow` agar konsisten dengan peran lain.
  - Menambahkan prop `editHref` pada `LaboratoriumShow` dan `AlatShow` sehingga tombol Edit muncul di halaman show untuk peran yang berwenang.
  - Memperbarui halaman show Laboran/Kepala Lab agar juga mengarahkan ke edit.
- **LaboratoriumEdit**:
  - Menambahkan tab **Alat** dengan daftar alat, filter kategori, dan tombol "Tambah Alat".
  - Menambahkan tab **Jadwal** dengan komponen `Calendar` (events peminjaman/maintenance).
  - Controller `Admin/LaboratoriumController` dan `Laboran/LaboratoriumController` sekarang memuat relasi `alats.kategoriAlat` dan mengirim `events` serta `riwayat` via `DetailDataService`.
- **AlatEdit**:
  - Menambahkan tab **Jadwal** dengan `Calendar`.
  - Menambahkan preview stat stok (Tersedia, Dipinjam, Maintenance, Total) dan foto utama di tab Profil agar edit menampilkan data seperti view.
  - Controller `Admin/AlatController` dan `Laboran/AlatController` sekarang memuat `laboratorium` dan `kategoriAlat` serta mengirim `events` dan `riwayat` via `DetailDataService`.
- **Laboran/Kepala Lab Alat Create**:
  - Menulis ulang `resources/js/Pages/Dashboard/Laboran/Alat/Create.tsx` dengan komponen reusable (`Input`, `FileUpload`, `Button`, `Select`, `SelectSearch`, `Textarea`, `Switch`, `NumberStepper`) agar konsisten dengan Admin/Alat/Create.

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `npm run build` | Berhasil |
| `php artisan test` | **120 passed (670 assertions)** |
| `php artisan route:cache` | Berhasil |
| `php artisan view:cache` | Berhasil |
| Visual sync follow-up | Screenshot admin alat/laboratorium edit & show, termasuk tab Alat dan Jadwal, berhasil dihasilkan di `tmp-visual-edit-sync/` |

### File penting yang diubah
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Admin\LaboratoriumController.php" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Admin\AlatController.php" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Laboran\LaboratoriumController.php" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Laboran\AlatController.php" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Components\LaboratoriumShow.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Components\AlatShow.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Components\LaboratoriumEdit.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Components\AlatEdit.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Admin\Laboratorium\Show.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Admin\Alat\Show.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Laboran\Alat\Create.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Laboran\Alat\Show.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\KepalaLab\Alat\Show.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Laboran\Laboratorium\Show.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\KepalaLab\Laboratorium\Show.tsx" />

## Minor Dashboard Modules Follow-up

**Status: SELESAI** — Halaman detail/show untuk modul minor (Pengguna Laboran, Video Tutorial, Program Studi, Kategori Alat, dan Pengguna Admin) diseragamkan dan memiliki aksi/tampilan yang lengkap.

### Perbaikan
- **Laboran/Pengguna/Show**:
  - Membuat `resources/js/Pages/Dashboard/Laboran/Pengguna/Show.tsx` yang menggunakan komponen `UserShow` bersama.
  - Menambahkan method `show` dan route `GET /pengguna/{user}` di `Laboran/PenggunaController`.
  - Menambahkan tombol "Detail" (mata) di `Laboran/Pengguna/Index.tsx`.
- **Admin/User/Show**:
  - Membuat komponen reusable `resources/js/Components/UserShow.tsx` agar halaman detail pengguna konsisten antara admin dan laboran.
  - `Admin/User/Show.tsx` sekarang menjadi wrapper `UserShow` dengan akses reset password dan nonaktifkan akun.
- **Admin/VideoTutorial/Show**:
  - Menulis ulang halaman show dengan struktur tab (Informasi, Video, Alat Terkait) agar selaras dengan modul lain.
  - Memindahkan fungsi `formatDuration` ke `resources/js/lib/date.ts` agar bisa dipakai bersama.
- **Admin/ProgramStudi/Show**:
  - Menambahkan tombol Edit di halaman detail program studi.
- **Verifikasi visual**:
  - Screenshot `tmp-visual-minor/` berhasil dihasilkan untuk halaman Video Tutorial, Program Studi, Kategori Alat, dan Laboran Pengguna.

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `npm run build` | Berhasil |
| `php artisan test` | **120 passed (670 assertions)** |
| `php artisan route:cache` | Berhasil |
| `php artisan view:cache` | Berhasil |

### File penting yang diubah
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Laboran\PenggunaController.php" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\routes\web.php" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Components\UserShow.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Admin\User\Show.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Laboran\Pengguna\Show.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Laboran\Pengguna\Index.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Admin\VideoTutorial\Show.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Admin\VideoTutorial\Index.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\lib\date.ts" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Admin\ProgramStudi\Show.tsx" />

## Global Minor Audit Fixes (Batch 2)

**Status: SELESAI** — Rombakan minor berdasarkan cross-check dengan `19-CHECKLIST-AKHIR.md` dan audit komponen UI/UX.

### Perbaikan
- **Relasi snake_case pada komponen React**: menambah fallback `(item as any).videoTutorials ?? (item as any).video_tutorials` di `AlatEdit.tsx`.
- **Input kustom dan native spinner**: `Input.tsx` menyembunyikan spinner native untuk `type="number"`; dua `<input>` native di `KepalaLab/Peminjaman/Index.tsx` dan `Laboran/Peminjaman/Index.tsx` diganti ke komponen `Input`.
- **FullCalendar hover**: `.fc-event:hover` memaksa `color: #ffffff !important;` agar teks event tetap terbaca saat hover.
- **Tautan pengaturan peran**: `settingsUrlByRole` untuk `kepala_lab` dan `laboran` diatur `null` karena tidak ada route pengaturan untuk peran tersebut.
- **Alt avatar kosong**: `Profile/Index.tsx` menggunakan `user?.nama_lengkap` sebagai alt.
- **Format tanggal/uang/status/seragam**: banyak file beralih ke helper `formatDate`, `formatDateTime`, `formatRupiah` dan mapping `lib/status.ts`.
  - Menambah `dokumenJenisMap`, `videoJenisMap`, `pesanKontakStatusMap` di `lib/status.ts`.
  - Memperbarui `AlatShow`, `LaboratoriumShow`, `AlatEdit`, `LaboratoriumEdit`, `Public/AlatDetail`, `Public/LaboratoriumDetail`, `Admin/VideoTutorial/{Index,Show}`, `Public/Tutorial`, `Public/TutorialDetail` untuk menampilkan label jenis dokumen dan video.
  - Memperbarui `Admin/User/Index`, `Dashboard/Index`, `Pimpinan/Maintenance/Index`, `{Mahasiswa,Dosen,Pimpinan}/Kerusakan/Index`, `Pimpinan/Pengembalian/Show`, `Peminjaman/Show`, `Mahasiswa/Laporan/Index`, `{Dosen,KepalaLab,Mahasiswa,Pimpinan}/Pengembalian/Index`, `MaintenanceShow`, `Admin/PesanKontak/{Index,Show}`, `Profile/Index`, `Admin/ProgramStudi/Show`, `Pimpinan/ProgramStudi/Show` untuk format tanggal/rupiah/badge yang konsisten.
- **Gambar pemilihan alat wizard**: `Mahasiswa/Peminjaman/Baru.tsx` menampilkan thumbnail `foto_utama` pada kartu alat.

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `npm run build` | Berhasil |
| `php artisan test --filter=Fase7PublicPagesTest` | 6 passed |
| `php artisan test --filter=Fase9AdminMasterDataTest` | 8 passed |
| `php artisan test --filter=LaboranPenggunaTest` | 5 passed |
| `php artisan test --filter=Fase5SeederTest` | 1 passed |
| Visual screenshot alat show & lab edit galeri | Gambar demo muncul |

### File penting yang diubah
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Components\Input.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Components\AlatEdit.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Components\AlatShow.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Components\LaboratoriumShow.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Components\LaboratoriumEdit.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Components\MaintenanceShow.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\lib\status.ts" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\css\app.css" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Layouts\DashboardLayout.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Profile\Index.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Public\AlatDetail.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Public\LaboratoriumDetail.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Public\Tutorial.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Public\TutorialDetail.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Mahasiswa\Peminjaman\Baru.tsx" />
- <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Peminjaman\Show.tsx" />

## Global Minor Audit Fixes (Batch 3)

**Status: SELESAI** — Audit ulang menyeluruh (publik, dashboard per peran, kalender, modal/animasi, DB/policies) dan perbaikan minor yang ditemukan.

### Perbaikan
- **Inline `confirm()` diganti komponen konfirmasi**:
  - `Pages/Dashboard/Peminjaman/Show.tsx` — pembatalan peminjaman via `ConfirmModal`.
  - `Pages/Dashboard/Mahasiswa/Peminjaman/Index.tsx` — tombol batal via `ConfirmActionButton`.
  - `Components/Dashboard/KerusakanManager.tsx` — hapus kerusakan via `ConfirmActionButton`.
  - `Pages/Dashboard/Laboran/Pengembalian/Index.tsx` — tandai denda lunas via `ConfirmActionButton`.
- **Tooltip pada ikon dokumen** — file link di `Components/AlatEdit.tsx` dan `Components/LaboratoriumEdit.tsx` dibungkus `Tooltip`.
- **Null safety Tim Pengembang** — `Pages/Public/Tentang.tsx` memastikan nama tim tidak kosong sebelum membuat inisial.
- **Inline modal diganti `Modal` baku**:
  - `Components/AlatShow.tsx` — pemutar video detail alat.
  - `Pages/Public/AlatDetail.tsx` — pemutar video dan modal QR Code.

### Temuan penting (sebagian sudah tersedia)
- **Pinjam Alat di Lab Ini** — sudah tersedia di `Public/LaboratoriumDetail.tsx` untuk pengguna yang login (dengan query `laboratorium_id`).
- **Alat terkait / Alat Lain di Laboratorium Ini** — sudah tersedia di `Public/AlatDetail.tsx` dari controller (`relatedAlats`).
- **Peminjaman Show multi-peran** — controller Pimpinan, KepalaLab, Laboran, Dosen, Mahasiswa semua merender `Dashboard/Peminjaman/Show.tsx` (shared); **tidak ada halaman 404**.
- **Pengembalian Show** — hanya Pimpinan yang memiliki route `GET /pengembalian/{peminjaman}`; peran lain hanya memiliki route `POST` untuk proses pengembalian.
- **FullCalendar** — semua instansi menggunakan komponen `Calendar` kustom; tooltip, modal event, dan toggle tampilan sudah terimplementasi di dalam komponen.
- **Backend** — migrasi, model, policy, middleware, notifikasi, scheduled command, dan pengaturan terpasang dengan baik; beberapa perbedaan nama kolom (`keterangan` vs `deskripsi`, `laboratorium_id` di maintenance, kolom tambahan `peminjaman_detail`) adalah perluasan implementasi yang disengaja.

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `npm run build` | Berhasil |
| `php artisan test` | 120 passed, 670 assertions |

## Global Minor Audit Fixes (Batch 4)

**Status: SELESAI** — Menangani minor dari daftar sisa: overlay gradient, empty state, DataTable loading, Calendar props, currency, dan modal.

### Perbaikan
- **Card lab/alat dengan foto background + overlay gradient** — dibuat komponen `CardWithBackground.tsx` dan diterapkan di:
  - `Public/Laboratorium.tsx` (grid & list view)
  - `Public/Alat.tsx` (grid & list view)
  - `Public/LaboratoriumDetail.tsx` (tab Alat)
  - `Public/AlatDetail.tsx` ("Alat Lain di Laboratorium Ini")
  - `Components/LaboratoriumShow.tsx` (kartu alat di dashboard)
- **Empty state tabel kustom** — dibuat `EmptyTable.tsx` dan 22 file tabel kustom menggunakannya, mengganti plain text `Tidak ada data.`.
- **DataTable `isLoading`** — 21 halaman dashboard/admin ditambahkan `usePageLoading()` dan `isLoading={loading}` pada `DataTable`.
- **Konsistensi props `Calendar`** — `height` seragam `500px`, `showFilters={(events ?? []).length > 0}` ditambahkan pada dashboard, dan inline `statusOptions` duplikat dihapus dari `AlatShow`, `LaboratoriumShow`, `AlatEdit`, `LaboratoriumEdit`.
- **Currency/format uang** — pencarian ulang tidak menemukan sisa `toLocaleString` selain `formatRupiah` dan counter Beranda.
- **NumberStepper vs Input number** — wizard peminjaman sudah pakai `NumberStepper`; input number untuk mata uang (denda, biaya maintenance, pengaturan) disesuaikan dengan `Input type="number"` (spinner disembunyikan). Tidak perlu diganti karena nilai bisa desimal dan besar.
- **Lightbox & inline modal** — `Lightbox.tsx` sudah memiliki keyboard handler (Escape, panah), aria-label, role dialog, body scroll lock; sisanya hanya `Modal`, `Tooltip`, `LoadingScreen`, dan `TableActions` (backdrop dropdown) yang wajar.

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `npm run build` | Berhasil |
| `php artisan test --filter=Fase7PublicPagesTest` | 6 passed |
| `php artisan test --filter=Fase9AdminMasterDataTest` | 8 passed |
| `php artisan test --filter=PeminjamanFlowTest` | 6 passed |

## Global Minor Audit Fixes (Batch 5)

**Status: SELESAI** — Menangani minor dari catatan lanjutan: avatar inisial + gradient, PDF demo, pengecekan visual, dan foto demo fallback.

### Perbaikan
- **Avatar fallback inisial + gradient random** — `Avatar.tsx` sudah memiliki gradient berdasarkan hash nama. Diterapkan secara konsisten di:
  - `Components/Avatar.tsx`
  - `Layouts/PublicLayout.tsx` (menu user publik)
  - `Pages/Profile/Index.tsx` (foto profil)
  - `Layouts/DashboardLayout.tsx` dan `Components/UserShow.tsx` (sudah menggunakan `Avatar`)
- **PDF demo nyata** — `DemoAssetHelper::pdf()` menggunakan `dompdf` untuk menghasilkan file PDF A4 dengan judul dan meta; bukan placeholder text/kosong.
- **Pengecekan visual & perbaikan tampilan** — dicapture seluruh halaman publik dan dashboard peran menggunakan `tmp-visual-audit-fase15.mjs`. Ditemukan dan diperbaiki:
  - `CardWithBackground.tsx` horizontal (list view) di `Public/Laboratorium.tsx` dan `Public/Alat.tsx` tidak menampilkan judul karena tinggi media `h-full` ambruk saat parent flex tanpa tinggi tetap. Diubah ke `h-40 w-full shrink-0 sm:w-56` agar overlay, judul, dan badge terlihat jelas.
  - Menambahkan `z-index` eksplisit pada lapisan gambar, overlay, dan konten agar teks overlay selalu terbaca.
- **Foto demo fallback offline** — `DemoAssetHelper::image()` sudah mengunduh dari Picsum/UI Avatars dengan seed, dan fallback-nya membuat gambar GD bergradasi dengan icon serta label. `ImageWithFallback` frontend fallback tetap abu-abu icon untuk missing asset runtime; ini dianggap wajar karena asset demo yang valid akan tersedia setelah seed.

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `npm run build` | Berhasil |
| `php artisan test --filter=Fase7PublicPagesTest` | 6 passed |
| `php artisan test --filter=Fase9AdminMasterDataTest` | 8 passed |

### Catatan visual lanjutan
- Semua screenshot hasil audit fase 15 tersimpan di `tmp-visual-audit-fase15/` (296 file). Tidak ditemukan error/404 di halaman yang diuji. Hanya beberapa tab pada halaman publik yang tidak ditemukan oleh selector script (Galeri/Tata Tertib/Dokumen/Jadwal) karena tab tersebut memang ada dengan label yang berbeda; komponen `Tabs` dan halaman detail tetap berfungsi.
- Hero image di detail lab/alat tetap menampilkan icon `Image` saat file demo belum di-seed; ini normal dan akan terisi gambar nyata setelah `php artisan migrate:fresh --seed`.

## Auth Page Global Audit

**Status: SELESAI** — Audit menyeluruh terhadap seluruh halaman autentikasi dan onboarding berdasarkan `06-AUTH-ONBOARDING.md` dan `19-CHECKLIST-AKHIR.md`.

### Halaman yang diperiksa
- `/login` — form login, error modal, link lupa password/daftar.
- `/daftar` — form pendaftaran mahasiswa/dosen, indikator password, modal S&K & Kebijakan Privasi.
- `/lupa-password` — form email, pesan sukses aman.
- `/reset-password/{token}` — form password baru + konfirmasi + indikator.
- `/verifikasi-email` — pesan, countdown, kirim ulang.
- `/menunggu-persetujuan` — konten & kontak admin.
- `/akun-ditolak` — alasan dan kontak admin.
- `/akun-tidak-aktif` — pesan dan kontak admin.
- `/lengkapi-profil` — form lengkap dengan foto profil, KTM, angkatan/semester, dan tombol lewati untuk dosen.
- `/profil` — tiga tab (Informasi Pribadi, Keamanan, Preferensi).

### Temuan dan perbaikan
- **Token Sanctum tidak dibersihkan saat logout** — setelah logout via Inertia, `localStorage` masih menyimpan token lama dan `axios.defaults.headers.common.Authorization` tetap ter-set, meskipun server sudah menghapus token-nya.
  - **Perbaikan**: `GuestLayout.tsx` sekarang memeriksa `usePage().props.auth.user` pada saat mount. Jika tidak ada user yang login, `localStorage` token dihapus dan header Authorization `axios` di-reset. Ini mencegah stale token mengganggu request berikutnya setelah logout.
- **Sinkronisasi `name` saat update profil** — `AuthController::updateProfile` menggunakan `isset($data['nama_lengkap'])` untuk mengisi `name`. Setelah normalisasi empty string ke `null`, `isset(null)` tetap `false`, sehingga nama tidak tersinkron jika pengguna hanya mengubah nama menjadi kosong (sebenarnya tidak diizinkan). Diubah menjadi `!empty($data['nama_lengkap'])` agar lebih eksplisit hanya menyinkronkan jika nama tidak kosong.

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `npm run build` | Berhasil |
| `php artisan test` | **120 passed (670 assertions)** |
| `node tmp-visual-auth.mjs` | Semua halaman auth (login, daftar, lupa password, reset, verifikasi, menunggu, ditolak, tidak aktif, profil semua tab, lengkapi profil) berhasil di-screenshot tanpa error render. |
| `node tmp-auth-console.mjs` | Tidak ada `console.error` kecuali `429 Too Many Requests` di `/reset-password/fake-token` yang disebabkan oleh rate limit (bukan bug aplikasi). |
| Manual login → logout → cek `localStorage.token` | Token `null` setelah logout. |

### Catatan
- Semua flow auth (register, verifikasi email, pending approval, rejected, suspended, approved, lengkapi profil) sudah tercakup oleh `Fase4AuthTest` dan `Fase8AuthProfileTest`, semua lulus.
- `Daftar` sudah memiliki modal Syarat & Ketentuan dan Kebijakan Privasi yang diambil dari pengaturan `legal.syarat_ketentuan` / `legal.kebijakan_privasi` (format flat `grup.key` dari `HandleInertiaRequests`).
- Indikator password menyala dan bar kekuatan password tampil di `Daftar`, `ResetPassword`, dan tab Keamanan Profil.
- `Profile/Index` memiliki tiga tab sesuai spesifikasi: Informasi Pribadi, Keamanan (ganti password), dan Preferensi (tema, bahasa, reduce motion, notifikasi).

## Public Page Audit Fixes (Batch 6)

**Status: SELESAI** — Audit ulang terhadap halaman publik berdasarkan `05-HALAMAN-PUBLIK.md`, `20-ULTRA-DETAIL-GUIDE.md`, dan `04-UI-UX-KOMPONEN.md`, serta perbaikan bug dan penyempurnaan tampilan.

### Perbaikan
- **Bug crash pada tab Alat di `Public/LaboratoriumDetail.tsx`**: `Badge` digunakan di tab Alat tanpa import, menyebabkan runtime error (`Badge is not defined`) saat tab diklik. Ditambahkan `import { Badge } from '../../Components/Badge';`.
- **Unikitas seed gambar demo di `DemoAssetHelper::image()`**: seed sebelumnya hanya diambil dari `basename($path)`, sehingga semua foto utama (`utama.jpg`) dan beberapa galeri memiliki gambar Picsum yang sama. Diubah untuk menggunakan seluruh `$path` (dengan slug unik) sebagai seed, sehingga setiap asset demo memiliki gambar berbeda dan realistis.
- **Regenerasi demo asset**: Menjalankan `php artisan demo:regenerate-images` dan `php artisan db:seed --class=VideoTutorialSeeder` untuk menghasilkan ulang foto laboratorium, alat, galeri, dan thumbnail tutorial dengan seed yang unik.
- **Sidebar pinjam hanya untuk mahasiswa**: Tombol "Pinjam Alat di Lab Ini" dan "Pinjam Alat Ini" di `Public/LaboratoriumDetail.tsx` dan `Public/AlatDetail.tsx` kini hanya muncul jika `auth.user.active_role === 'mahasiswa'`, bukan untuk semua pengguna yang login.
- **Download dokumen**: Link dokumen di tab Dokumen `Public/LaboratoriumDetail.tsx` dan `Public/AlatDetail.tsx` ditambahkan atribut `download` agar file benar-benar diunduh, tidak hanya dibuka di tab baru.
- **Pencarian/filter/paginasi tab Alat di detail laboratorium**: `Public/LaboratoriumDetail.tsx` tab Alat kini memiliki:
  - `SearchInput` pencarian nama/kode alat.
  - `Select` filter status alat (Tersedia, Dipinjam, Maintenance, Tidak Tersedia).
  - Filter kategori (existing) dan tombol reset.
  - Toggle tampilan grid/list.
  - Pagination client-side (12 item per halaman) dengan informasi "Menampilkan x-y dari z alat".
- **Memuat semua alat di detail laboratorium**: `PublicController::laboratoriumDetail()` tidak lagi membatasi `alats` hanya yang `stok_tersedia > 0` atau `limit(20)`, sehingga seluruh alat laboratorium ditampilkan dan dapat difilter/dicari.
- **Footer tanpa map bawaan**: Menghapus iframe Google Maps dari footer `PublicLayout.tsx` untuk menghindari tampilan kotak kosong saat tidak ada koneksi internet (peta tetap ada di halaman `/kontak`).

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `npm run build` | Berhasil |
| `php artisan test` | **120 passed (670 assertions)** |
| `node tmp-visual-public.mjs` | Semua screenshot halaman publik dan tab detail berhasil dihasilkan tanpa error; demo image muncul variatif; tidak ada console error saat navigasi antar tab. |

### Catatan
- `tmp-visual-public.mjs` dapat digunakan sebagai regression test visual untuk halaman publik.
- Pengaturan `legal.syarat_ketentuan` dan `legal.kebijakan_privasi` sudah benar karena `HandleInertiaRequests` membuat kunci flat `grup.key`; tidak perlu mengubah key di frontend.

## Auth / Login Troubleshooting Notes
- If login fails with correct credentials on `127.0.0.1` or a custom domain, check `SESSION_DOMAIN` in `.env`. Hard-coding it to `localhost` prevents cookies from being sent for other hosts. Leave it commented/empty (`# SESSION_DOMAIN=localhost`) so the session cookie uses the current host.
- Remove `public/hot` when Vite dev server is not running; otherwise the browser tries to load assets from the dead dev server and the React forms never hydrate. Use `npm run build` and delete `public/hot` to serve built assets, or keep `npm run dev` running.

## Re-Audit Dashboard Pimpinan

**Status: SELESAI** — Audit menyeluruh terhadap seluruh halaman dashboard Pimpinan sesuai `08-DASHBOARD-PIMPINAN.md`, termasuk tab, detail, wizard, dan konektivitas antar halaman. Temuan diperbaiki dan verifikasi build/test/visual berhasil.

### Hasil Audit
- Membaca spesifikasi `08-DASHBOARD-PIMPINAN.md` dan memetakan seluruh halaman Pimpinan: dashboard, program studi, pengguna (baru), laboratorium, alat, kerusakan, maintenance, peminjaman, pengembalian, laporan, audit log, pengaturan.
- Menjalankan `node tmp-pimpinan-console.mjs` untuk memeriksa `console.error` di semua halaman Pimpinan: **tidak ada error JavaScript** (hanya 403 yang diharapkan saat Kepala Departemen mengakses edit Program Studi).
- Menjalankan `node tmp-visual-pimpinan.mjs` untuk mengambil screenshot 30+ halaman Pimpinan termasuk beberapa tab laboratorium/alat.
- Memverifikasi Kaprodi dapat mengedit Program Studi yang diampu; Kepala Departemen tidak dapat mengedit Program Studi orang lain (403).

### Temuan dan Perbaikan
1. **Error `statusPeminjamanMap is not defined` di halaman detail peminjaman Pimpinan**.
   - **Penyebab**: `resources/js/Pages/Dashboard/Peminjaman/Show.tsx` meng-import `statusPeminjamanMap` dengan alias `statusMap`, tetapi bagian timeline masih menggunakan nama asli `statusPeminjamanMap`.
   - **Perbaikan**: Mengganti penggunaan `statusPeminjamanMap` menjadi `statusMap` di dalam `timelineItems`.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Peminjaman\Show.tsx" />

2. **Dashboard Pimpinan tidak memiliki modul Pengguna**.
   - **Penyebab**: Spesifikasi metrik `Total Pengguna` mensyaratkan aksi klik ke Manajemen Pengguna (view), tetapi Pimpinan hanya memiliki `users.view` permission tanpa halaman user.
   - **Perbaikan**:
     - Membuat `App\Http\Controllers\Pimpinan\UserController` dengan `index` dan `show` (view only).
     - Menambahkan route `GET /dashboard/pimpinan/pengguna` dan `/dashboard/pimpinan/pengguna/{user}`.
     - Membuat halaman `Dashboard/Pimpinan/Pengguna/Index.tsx` dan `Show.tsx` (menggunakan komponen `UserShow`).
     - Menambahkan menu `Pengguna` di sidebar `DashboardLayout` untuk Pimpinan.
     - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Pimpinan\UserController.php" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Pimpinan\Pengguna\Index.tsx" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Pimpinan\Pengguna\Show.tsx" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Layouts\DashboardLayout.tsx" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\routes\web.php" />.

3. **Tombol Edit muncul di `UserShow` untuk peran view-only**.
   - **Penyebab**: Komponen `UserShow` selalu menampilkan tombol Edit meskipun dipakai oleh Pimpinan yang hanya boleh melihat.
   - **Perbaikan**: Menambahkan prop `canEdit` (default `true`) pada `UserShow`; Pimpinan/Show mengirim `canEdit={false}` sehingga tombol Edit tidak tampil.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Components\UserShow.tsx" />.

4. **Card metrik Dashboard Pimpinan tidak memiliki aksi klik dan label tidak sesuai spesifikasi**.
   - **Penyebab**: `resources/js/Pages/Dashboard/Pimpinan/Index.tsx` hanya menampilkan 6 card statis tanpa navigasi; metrik `Pendaftaran Menunggu` belum ada.
   - **Perbaikan**:
     - Menambahkan `href` pada setiap `metricCards` dan membungkus `Card` dengan `Link` dari Inertia.
     - Menambahkan metrik `pendaftaran_menunggu` di `PimpinanDashboardController` dan mengganti label card menjadi `Pendaftaran Menunggu` dengan ikon `UserCheck`.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Pimpinan\DashboardController.php" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Pimpinan\Index.tsx" />.

5. **Tabel bawah dashboard Pimpinan tidak sesuai spesifikasi**.
   - **Penyebab**: Hanya ada satu tabel `Peminjaman Menunggu`; spesifikasi memerlukan `Peminjaman Terbaru`, `Pendaftaran Menunggu`, dan `Aktivitas Terbaru`.
   - **Perbaikan**: `PimpinanDashboardController` sekarang mengirim `peminjaman_terbaru`, `pendaftaran_menunggu`, dan `aktivitas_terbaru`; halaman dashboard menampilkan ketiga tabel tersebut dengan link detail.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Pimpinan\DashboardController.php" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Pimpinan\Index.tsx" />.

6. **Pimpinan tidak dapat menyimpan Pengaturan**.
   - **Penyebab**: `PimpinanPengaturanController::update` menggunakan `$this->authorize('manage', Pengaturan::class)` yang memerlukan `pengaturan.manage`, sedangkan peran Pimpinan hanya memiliki `pengaturan.view`.
   - **Perbaikan**: Mengubah otorisasi update menjadi `$this->authorize('viewAny', Pengaturan::class)` dan tetap membatasi grup yang boleh diedit melalui konstanta `ALLOWED_GROUPS`.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Pimpinan\PengaturanController.php" />.

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `npm run build` | Berhasil |
| `php artisan test` | **120 passed (670 assertions)** |
| `node tmp-pimpinan-console.mjs` | Tidak ada `console.error` (403 edit Program Studi oleh non-Kaprodi sesuai ekspektasi) |
| `node tmp-visual-pimpinan.mjs` | 30+ screenshot halaman Pimpinan dan tab tersedia di `tmp-visual-pimpinan/` |

## Re-Audit Dashboard Kepala Lab

**Status: SELESAI** — Audit menyeluruh terhadap seluruh halaman dashboard Kepala Lab sesuai `09-DASHBOARD-KEPALA-LAB.md`, termasuk tab, detail, dan konektivitas antar halaman. Temuan diperbaiki dan verifikasi build/test/visual berhasil.

### Hasil Audit
- Membaca spesifikasi `09-DASHBOARD-KEPALA-LAB.md` dan memetakan halaman Kepala Lab: dashboard, laboratorium, alat, kerusakan, maintenance, peminjaman, pengembalian, laporan, profil.
- Menjalankan `node tmp-kepala-lab-console.mjs` untuk memeriksa `console.error` di semua halaman Kepala Lab: **tidak ada error JavaScript**.
- Menjalankan `node tmp-visual-kepala-lab.mjs` untuk mengambil screenshot 30+ halaman Kepala Lab termasuk beberapa tab laboratorium dan alat.
- Memverifikasi Kepala Lab hanya mengelola laboratorium yang terdaftar di `laboratorium_pengelola` dan tidak bisa tambah/hapus laboratorium.

### Temuan dan Perbaikan
1. **Dashboard Kepala Lab belum sesuai spesifikasi `09-DASHBOARD-KEPALA-LAB.md`**.
   - **Penyebab**: Metrik tidak clickable, label tidak sesuai, chart status peminjaman lab belum ada, dan tabel bawah masih menampilkan `Peminjaman Aktif` / `Peminjaman Menunggu` bukan `Peminjaman Terbaru`, `Kerusakan Terbaru`, dan `Maintenance Terbaru`.
   - **Perbaikan**:
     - Menyelaraskan 6 metrik utama: Total Alat Lab, Alat Tersedia, Peminjaman Aktif Lab, Maintenance Berlangsung Lab, Peminjaman Menunggu Persetujuan, Kerusakan Belum Selesai.
     - Membuat card metrik clickable melalui `Link` Inertia dengan `hover:-translate-y-1.5` dan `hover:shadow-xl`.
     - Mengganti chart `Maintenance per Bulan` dengan chart `Distribusi Status Peminjaman Lab`.
     - Menambahkan tabel `Peminjaman Terbaru Lab`, `Kerusakan Terbaru Lab`, dan `Maintenance Terbaru Lab`.
     - Memperbarui `Dashboard/KepalaLab/Index` dan `KepalaLabDashboardController`.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\KepalaLab\DashboardController.php" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\KepalaLab\Index.tsx" />.

2. **Input Laboratorium pada form alat tidak disabled untuk Kepala Lab dengan satu laboratorium**.
   - **Penyebab**: Spesifikasi mensyaratkan laboratorium tidak bisa diubah (otomatis lab yang dikelola), tetapi `SelectSearch` Laboratorium di form tambah/edit alat masih bisa dipilih.
   - **Perbaikan**:
     - Menambahkan `disabled` pada `SelectSearch` Laboratorium di `AlatEdit.tsx` dan `Laboran/Alat/Create.tsx` ketika hanya ada satu lab.
     - Pada halaman tambah alat, otomatis mengisi `laboratorium_id` dengan lab satu-satunya.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Components\AlatEdit.tsx" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Laboran\Alat\Create.tsx" />.

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `npm run build` | Berhasil |
| `php artisan test` | **120 passed (670 assertions)** |
| `node tmp-kepala-lab-console.mjs` | Tidak ada `console.error` |
| `node tmp-visual-kepala-lab.mjs` | 30+ screenshot halaman Kepala Lab dan tab tersedia di `tmp-visual-kepala-lab/` |

## Re-Audit Dashboard Laboran

**Status: SELESAI** — Audit menyeluruh terhadap seluruh halaman dashboard Laboran sesuai `10-DASHBOARD-LABORAN.md`, termasuk tab, detail, proses pengembalian, dan form tambah pengguna.

### Hasil Audit
- Membaca spesifikasi `10-DASHBOARD-LABORAN.md` dan memetakan halaman Laboran: dashboard, verifikasi akun, laboratorium, alat, kerusakan, maintenance, peminjaman, serah terima, pengembalian, pengguna, laporan.
- Menjalankan `node tmp-laboran-console.mjs` untuk memeriksa `console.error` di semua halaman Laboran: **tidak ada error JavaScript**.
- Menjalankan `node tmp-visual-laboran.mjs` untuk mengambil screenshot 35+ halaman Laboran termasuk tab laboratorium, alat, dan form proses pengembalian.
- Memverifikasi Laboran hanya mengelola laboratorium yang terdaftar di `laboratorium_pengelola` dan tidak bisa tambah/hapus laboratorium.

### Temuan dan Perbaikan
1. **Dashboard Laboran belum sesuai spesifikasi `10-DASHBOARD-LABORAN.md`**.
   - **Penyebab**: Metrik tidak sesuai (Total Alat, Dipinjam, Dalam Perbaikan), grafik hanya `Tren 30 Hari` dan kalender, tabel bawah hanya `Peminjaman Perlu Tindakan` dan `Peminjaman Berlangsung`.
   - **Perbaikan**:
     - Menyelaraskan 6 metrik utama: Peminjaman Menunggu, Serah Terima Hari Ini, Pengembalian Hari Ini, Alat Tersedia Lab, Maintenance Berlangsung, Akun Menunggu Persetujuan.
     - Membuat card metrik clickable melalui `Link` Inertia dengan animasi hover.
     - Menambahkan 3 grafik: Peminjaman Minggu Ini (bar), Status Peminjaman Lab (doughnut), Kondisi Alat Lab (doughnut).
     - Mengganti tabel bawah menjadi: Peminjaman Menunggu Persetujuan, Serah Terima Hari Ini, Pengembalian Hari Ini.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Laboran\DashboardController.php" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Laboran\Index.tsx" />.

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `npm run build` | Berhasil |
| `php artisan test` | **120 passed (670 assertions)** |
| `node tmp-laboran-console.mjs` | Tidak ada `console.error` |
| `node tmp-visual-laboran.mjs` | 35+ screenshot halaman Laboran dan tab tersedia di `tmp-visual-laboran/` |

## Re-Audit Dashboard Dosen

**Status: SELESAI** — Audit menyeluruh terhadap seluruh halaman dashboard Dosen sesuai `11-DASHBOARD-DOSEN.md`, termasuk persetujuan peminjaman, pengembalian, kerusakan, dan laporan.

### Hasil Audit
- Membaca spesifikasi `11-DASHBOARD-DOSEN.md` dan memetakan halaman Dosen: dashboard, kerusakan, peminjaman, pengembalian, laporan, profil.
- Menjalankan `node tmp-dosen-console.mjs` untuk memeriksa `console.error` di semua halaman Dosen: **tidak ada error JavaScript**.
- Menjalankan `node tmp-visual-dosen.mjs` untuk mengambil screenshot 7+ halaman Dosen, termasuk detail peminjaman `menunggu_dosen` dan `selesai`.
- Memverifikasi Dosen hanya dapat menyetujui/menolak peminjaman mahasiswa bimbingan dengan status `menunggu_dosen`.

### Temuan dan Perbaikan
1. **Dashboard Dosen belum sepenuhnya sesuai spesifikasi `11-DASHBOARD-DOSEN.md`**.
   - **Penyebab**: Tabel bawah hanya ada `Peminjaman Menunggu Persetujuan`, belum ada `Pengembalian Terbaru Bimbingan`; beberapa ikon metrik tidak sesuai spec (Menunggu Persetujuan pakai `GraduationCap`, Kerusakan pakai `Wrench`, Jatuh Tempo pakai `AlertTriangle`); dan metric card tidak clickable.
   - **Perbaikan**:
     - Menambahkan tabel `Pengembalian Terbaru Bimbingan` dengan kolom kode, mahasiswa, lab, alat, waktu kembali, status, dan denda.
     - Memperbarui ikon metrik sesuai spec: `Users`, `ClipboardList`, `Clock`, `AlertTriangle`, `CalendarClock`.
     - Membuat metric card clickable dengan animasi hover.
     - Memperluas tabel `Peminjaman Menunggu Persetujuan` dengan kolom alat.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Dosen\DashboardController.php" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Dosen\Index.tsx" />.

2. **Halaman `Pengembalian Bimbingan` Dosen menampilkan semua peminjaman, termasuk yang belum/tidak berkaitan dengan pengembalian**.
   - **Penyebab**: `Dosen\PengembalianController::index` tidak membatasi status peminjaman, sehingga `Diajukan`, `Menunggu Dosen`, dan `Disetujui` muncul di daftar yang seharusnya fokus pada peminjaman berlangsung/terlambat/selesai.
   - **Perbaikan**:
     - Membatasi query hanya pada status `berlangsung`, `terlambat`, dan `selesai`.
     - Menyesuaikan filter status di frontend hanya untuk tiga status tersebut.
     - Memperbaiki `EmptyTable` `colSpan` dari 6 menjadi 7 sesuai jumlah kolom tabel.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Dosen\PengembalianController.php" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Dosen\Pengembalian\Index.tsx" />.

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `npm run build` | Berhasil |
| `php artisan test` | **120 passed (670 assertions)** |
| `node tmp-dosen-console.mjs` | Tidak ada `console.error` |
| `node tmp-visual-dosen.mjs` | Screenshot halaman Dosen tersedia di `tmp-visual-dosen/` |

## Re-Audit Dashboard Mahasiswa

**Status: SELESAI** — Audit menyeluruh terhadap seluruh halaman dashboard Mahasiswa sesuai `12-DASHBOARD-MAHASISWA.md`, termasuk wizard peminjaman, riwayat, pengembalian, kerusakan, dan laporan.

### Hasil Audit
- Membaca spesifikasi `12-DASHBOARD-MAHASISWA.md` dan memetakan halaman Mahasiswa: dashboard, kerusakan, peminjaman, pengembalian, laporan, profil, wizard 4 langkah.
- Menjalankan `node tmp-mahasiswa-console.mjs` untuk memeriksa `console.error` di semua halaman Mahasiswa: **tidak ada error JavaScript** setelah perbaikan.
- Menjalankan `node tmp-visual-mahasiswa.mjs` dan `node tmp-visual-mahasiswa-wizard2.mjs` untuk mengambil screenshot 11+ halaman Mahasiswa, termasuk wizard langkah 1–4.
- Memverifikasi Mahasiswa hanya dapat membatalkan peminjaman dengan status `diajukan`, `menunggu_dosen`, atau `menunggu_laboran`.

### Temuan dan Perbaikan
1. **Dashboard Mahasiswa belum sepenuhnya sesuai spesifikasi `12-DASHBOARD-MAHASISWA.md`**.
   - **Penyebab**: Ikon metrik tidak sesuai (Menunggu pakai `Wrench`, Denda pakai `Banknote`); tidak ada grafik `Status Peminjaman Saya` dan `Peminjaman per Bulan (6 bulan terakhir)`; tabel bawah masih `Peminjaman Aktif` dan `Notifikasi Terbaru`, belum ada `Peminjaman Terbaru`; metric card tidak clickable.
   - **Perbaikan**:
     - Memperbarui ikon metrik: `ClipboardList`, `Clock`, `CheckCircle`, `Bell`, `AlertTriangle`.
     - Menambahkan grafik doughnut `Status Peminjaman Saya` dan line chart `Peminjaman per Bulan (6 Bulan Terakhir)`.
     - Menambahkan tabel `Peminjaman Terbaru` dan mempertahankan tabel `Notifikasi Terbaru`.
     - Membuat metric card clickable dengan animasi hover.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Mahasiswa\DashboardController.php" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Mahasiswa\Index.tsx" />.

2. **Error JavaScript di halaman `Peminjaman Saya` Mahasiswa (`Tooltip is not defined`)**.
   - **Penyebab**: Komponen `Tooltip` digunakan di `Mahasiswa/Peminjaman/Index.tsx` tanpa di-import.
   - **Perbaikan**: Menambahkan `import { Tooltip } from '@/Components/Tooltip';`.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Mahasiswa\Peminjaman\Index.tsx" />.

3. **Wizard peminjaman menampilkan alat dengan kondisi tidak layak (contoh: `Hilang`)**.
   - **Penyebab**: `Mahasiswa\PeminjamanController::baru` dan `cariAlat` hanya memfilter `stok_tersedia > 0` tanpa memperhatikan `kondisi` alat.
   - **Perbaikan**: Menambahkan filter `kondisi = 'baik'` agar mahasiswa hanya dapat memilih alat dalam kondisi baik.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Mahasiswa\PeminjamanController.php" />.

4. **Halaman `Pengembalian Saya` Mahasiswa menampilkan semua peminjaman, termasuk yang belum selesai/dikembalikan**.
   - **Penyebab**: `Mahasiswa\PengembalianController::index` tidak membatasi status, sehingga `Diajukan`, `Menunggu Dosen`, `Ditolak`, dll. muncul.
   - **Perbaikan**:
     - Membatasi query hanya pada status `berlangsung`, `terlambat`, dan `selesai`.
     - Menyesuaikan filter status di frontend hanya untuk tiga status tersebut.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Mahasiswa\PengembalianController.php" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Mahasiswa\Pengembalian\Index.tsx" />.

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `npm run build` | Berhasil |
| `php artisan test` | **120 passed (670 assertions)** |
| `node tmp-mahasiswa-console.mjs` | Tidak ada `console.error` |
| `node tmp-visual-mahasiswa.mjs` | Screenshot halaman Mahasiswa tersedia di `tmp-visual-mahasiswa/` |

## Global Cross-Cutting Audit (Sisa Aplikasi)

**Status: SELESAI** — Audit menyeluruh terhadap halaman publik, autentikasi, modul global, dan cross-cutting features yang tidak tercakup dalam audit peran.

### Cakupan Audit
- Halaman publik: beranda, laboratorium (list & detail), alat (list & detail), tutorial (list & detail), FAQ, kontak, tentang, syarat & ketentuan, kebijakan privasi.
- Halaman autentikasi: login, daftar, lupa password, verifikasi email, menunggu persetujuan, akun ditolak, akun tidak aktif.
- Modul global: notifikasi (`/notifikasi`), profil (`/profil`), pengaturan admin & pimpinan, backup, audit log, pesan kontak.
- Kalender: event peminjaman dan maintenance di beranda publik serta dashboard peran.

### Hasil Audit
- Menjalankan `node tmp-audit-remaining-console.mjs` untuk memeriksa `console.error` di semua halaman publik, autentikasi, dan global: **tidak ada error JavaScript**.
- Menjalankan `node tmp-audit-remaining-visual.mjs` untuk mengambil screenshot 20+ halaman publik, autentikasi, dan global: semua halaman terekam di `tmp-visual-remaining/`.
- Menjalankan `php artisan test` setelah perubahan: **120 passed (670 assertions)**.

### Temuan dan Perbaikan
1. **Gambar/foto demo tidak tampil di `php artisan serve` (403/404 pada URL `/storage/...`)**.
   - **Penyebab**: Disk `public` belum disetel `serve => true`, sehingga PHP built-in server tidak melayani file dari `storage/app/public`. Selain itu disk `local` dan `public` konflik karena sama-sama menggunakan URI `/storage`.
   - **Perbaikan**:
     - Menambahkan `'serve' => true` pada disk `public` di `config/filesystems.php`.
     - Menambahkan `'url' => env('APP_URL', 'http://localhost').'/private'` pada disk `local` agar tidak konflik dengan `public`.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\config\filesystems.php" />.

2. **Form pengaturan Pimpinan tidak menggunakan komponen reusable, terlihat tidak konsisten dengan dashboard lain**.
   - **Penyebab**: `resources/js/Pages/Dashboard/Pimpinan/Pengaturan/Index.tsx` menggunakan elemen `<input>` dan `<textarea>` mentah serta tombol `<button>` bawaan.
   - **Perbaikan**: Mengganti input/textarea dengan komponen `Input` dan `Textarea`, tombol dengan `Button`, serta menambahkan state `loading`.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Pimpinan\Pengaturan\Index.tsx" />.

3. **Wizard peminjaman Mahasiswa menampilkan alat tidak layak pakai (contoh: kondisi `Hilang`)**.
   - **Penyebab**: `Mahasiswa\PeminjamanController::baru` dan `cariAlat` hanya memfilter `stok_tersedia > 0` tanpa memerhatikan kondisi alat.
   - **Perbaikan**: Menambahkan filter `->where('kondisi', 'baik')` agar mahasiswa hanya dapat memilih alat dalam kondisi baik.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Mahasiswa\PeminjamanController.php" />.

4. **Halaman `Pengembalian Saya` Mahasiswa menampilkan semua peminjaman, termasuk yang belum selesai/dikembalikan**.
   - **Penyebab**: `Mahasiswa\PengembalianController::index` tidak membatasi status.
   - **Perbaikan**: Membatasi query ke `berlangsung`, `terlambat`, `selesai` dan menyesuaikan filter status frontend.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Mahasiswa\PengembalianController.php" />, <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Mahasiswa\Pengembalian\Index.tsx" />.

### Verifikasi
| Perintah | Hasil |
|----------|-------|
| `npm run build` | Berhasil |
| `php artisan test` | **120 passed (670 assertions)** |
| `node tmp-audit-remaining-console.mjs` | Tidak ada `console.error` |
| `node tmp-audit-remaining-visual.mjs` | Screenshot sisa halaman tersedia di `tmp-visual-remaining/` |

## Perbaikan File JSA pada Wizard Peminjaman Baru

**Status: SELESAI** — File JSA pada peminjaman baru hanya menerima PDF dengan maksimal 15 MB.

### Temuan
- Label di `Baru.tsx` menunjukkan `File JSA (PDF/JPG/PNG, maks 5MB)`, padahal seharusnya hanya PDF dan maksimal 15 MB.
- `FileUpload` menerima prop `accept=".pdf,image/*"` dan `maxSizeMB={5}`. Saat mengunggah PDF, komponen `FileUpload` tidak dapat menangani ekstensi `.pdf` sebagai string `accept`, sehingga muncul pesan `Format file tidak didukung. Gunakan .pdf,image/*.`.
- Backend `Mahasiswa\PeminjamanController::store` memvalidasi `file_jsa` dengan `mimes:pdf,jpg,jpeg,png` dan `max:5120`.

### Perbaikan
1. **Komponen `FileUpload`**: Menambahkan penanganan ekstensi file (string yang diawali titik, contoh `.pdf`) pada fungsi `validate`. Jika `accept` berupa ekstensi, cocokkan dengan ekstensi nama file (case-insensitive), bukan dengan MIME type.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Components\FileUpload.tsx" />.
2. **Halaman Wizard `Baru.tsx`**: Mengubah `FileUpload` menjadi `accept=".pdf"`, `maxSizeMB={15}`, dan label `File JSA (PDF, maks 15MB)`.
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\resources\js\Pages\Dashboard\Mahasiswa\Peminjaman\Baru.tsx" />.
3. **Backend `PeminjamanController.php`**: Memperketat validasi `file_jsa` menjadi `mimes:pdf` dan `max:15360` (15 MB).
   - File: <ref_file file="C:\xampp\htdocs\chemlos\laravel\app\Http\Controllers\Mahasiswa\PeminjamanController.php" />.

### Verifikasi
- Uji coba otomatis (Puppeteer):
  - Mengunggah file PNG pada input JSA menghasilkan pesan `Format file tidak didukung. Gunakan .pdf.`.
  - Mengunggah file PDF (kecil) berhasil ditampilkan sebagai `tmp-test-jsa.pdf`.
  - Screenshot: `tmp-jsa-upload.png`.
- Simulasi request ke `Mahasiswa\PeminjamanController::store` dengan file PDF berhasil membuat peminjaman dan mengembalikan redirect 302.
- `npm run build` berhasil.
- `php artisan test` lulus: **120 passed (670 assertions)**.

## Penyembunyian Fitur Sementara

**Status: SELESAI** — Beberapa fitur disembunyikan dari UI tanpa menghapus kode/routenya. Untuk menampilkan kembali, ubah `true` di `config/chemlos.php`.

### Fitur yang Disembunyikan
| Fitur | Key di `config/chemlos.php` | Nilai Saat Ini |
|-------|----------------------------|----------------|
| QR Code | `features.qr_code` | `false` |
| Video Tutorial | `features.video_tutorial` | `false` |
| FAQ | `features.faq` | `false` |
| Kontak (halaman publik) | `features.kontak` | `false` |
| Pesan Kontak (admin) | `features.pesan_kontak` | `false` |
| Cadangan (backup) | `features.cadangan` | `false` |
| Pengaturan | `features.pengaturan` | `false` |

### Mekanisme
- Konfigurasi disimpan di `config/chemlos.php` dan dibagikan ke frontend via `HandleInertiaRequests` sebagai `features`.
- Frontend menggunakan helper `useFeatureEnabled`/`isEnabled` untuk menyaring menu, tab, tombol, dan card.
- Halaman/route masih ada, hanya tidak ditampilkan di navigasi/menu. Jika ingin juga memblokir akses langsung, perlu ditambahkan middleware `Feature` pada route terkait.

### File yang Diubah
- `config/chemlos.php` (baru)
- `app/Http/Middleware/HandleInertiaRequests.php`
- `resources/js/types/index.d.ts`
- `resources/js/lib/features.ts` (baru)
- `resources/js/Layouts/DashboardLayout.tsx`
- `resources/js/Layouts/PublicLayout.tsx`
- `resources/js/Pages/Public/Beranda.tsx`
- `resources/js/Pages/Public/Alat.tsx`
- `resources/js/Pages/Public/Laboratorium.tsx`
- `resources/js/Pages/Public/Tentang.tsx`
- `resources/js/Pages/Public/FAQ.tsx`
- `resources/js/Pages/Public/AlatDetail.tsx`
- `resources/js/Components/AlatShow.tsx`
- `resources/js/Components/AlatEdit.tsx`
- `resources/js/Pages/Dashboard/Admin/Alat/Index.tsx`
- `resources/js/Pages/Dashboard/Laboran/Alat/Index.tsx`
- `resources/js/Pages/Dashboard/Index.tsx`
- `resources/js/Pages/Dashboard/Pimpinan/Index.tsx`

### Verifikasi
- `npm run build` berhasil.
- `php artisan test` lulus: **120 passed (599 assertions)**.

## FASE 16 Audit: Deployment & Go-Live

**Status: SELESAI untuk persiapan deployment lokal; PRODUCTION DEPLOYMENT masih memerlukan environment server.**

### Pembersihan & Persiapan
- **Temp/backup pengujian dihapus**:
  - Semua `tmp-*.mjs`, `tmp-*.php`, `tmp-*.png`, `tmp-*.json` di root `laravel/` dihapus.
  - Semua direktori `tmp-visual-*` di root `laravel/` dihapus.
- **Data demo tidak dihapus**: `storage/app/public/demo/`, `public/images/kop-ftui.jpg`, dan asset produksi tetap utuh.
- **`public/hot`**: Tidak ditemukan (build production aktif).
- **`public/storage`**: Symlink ke `storage/app/public` sudah ada.
- **`storage/` dan `bootstrap/cache/`**: Writable dan cache bisa di-generate.

### Verifikasi Deployment
| Langkah | Hasil |
|---------|-------|
| `npm run build` | Berhasil, `public/build/manifest.json` ter-generate |
| `php artisan test` | **120 passed (599 assertions)** |
| `php artisan config:cache` | Berhasil |
| `php artisan route:cache` | Berhasil (346 route) |
| `php artisan view:cache` | Berhasil |
| `php artisan serve --host=127.0.0.1 --port=8001` | Berjalan, homepage dan Inertia props ter-load |
| Route list | **346 route** terdaftar, tidak ada route yang gagal compile |
| Pencarian `TODO`/`FIXME`/`XXX` | Tidak ditemukan di `app/`, `resources/js/`, `database/` |

### Temuan & Catatan
1. **Konfigurasi `.env` tidak bisa di-audit langsung** karena file di-ignore. Pastikan file `.env` Anda sudah terisi: DB, mail, reCAPTCHA (`RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`), queue, app URL, WA (opsional).
2. **WhatsApp masih stub**: `app/Services/WhatsAppService.php` hanya mensimulasikan pengiriman ke log. Untuk production, konfigurasi provider (`twilio`/`fonnte`) dan API key di pengaturan.
3. **Cache konfigurasi di-clear setelah tes**: `php artisan config:clear` sudah dijalankan agar perubahan `.env` tetap terbaca saat development. Untuk production, jalankan ulang `php artisan config:cache` setelah `.env` final.
4. **Feature toggle masih aktif**: 7 fitur disembunyikan sesuai konfigurasi `config/chemlos.php`. Jika ingin menampilkan saat go-live, ubah `false` → `true`.

### Yang Belum Bisa Dikerjakan di Lokal (Production Only)
- Setup virtual host Apache/Nginx dengan root `laravel/public`.
- SSL certificate.
- Queue worker via Supervisor/Systemd.
- Cron scheduler (`* * * * * cd /path && php artisan schedule:run >> /dev/null 2>&1`).
- Konfigurasi reCAPTCHA v3, SMTP/SMTP, dan WhatsApp provider real.
- Backup otomatis ke cloud/S3 (saat ini backup ke `storage/app/backup` saja).
- DNS dan domain production.

### Kesimpulan
Aplikasi ChemLOS lulus audit FASE 16 untuk **deployment lokal/XAMPP**: build ok, test lulus, route/cache siap, asset bersih, data demo aman. Untuk **go-live produksi**, lanjutkan ke environment server dengan checklist production di atas. Jika ingin saya lanjutkan setup Apache/Nginx virtual host, SSL, atau deployment script, berikan akses server production.
