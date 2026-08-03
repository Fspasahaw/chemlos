<?php

use App\Http\Controllers\Admin\AlatController as AdminAlatController;
use App\Http\Controllers\Admin\AuditLogController as AdminAuditLogController;
use App\Http\Controllers\Admin\BackupController as AdminBackupController;
use App\Http\Controllers\Admin\KategoriAlatController;
use App\Http\Controllers\Admin\KerusakanController as AdminKerusakanController;
use App\Http\Controllers\Admin\LaboratoriumController as AdminLaboratoriumController;
use App\Http\Controllers\Admin\LaporanController as AdminLaporanController;
use App\Http\Controllers\Admin\MaintenanceController as AdminMaintenanceController;
use App\Http\Controllers\Admin\PeminjamanController as AdminPeminjamanController;
use App\Http\Controllers\Admin\PengaturanController as AdminPengaturanController;
use App\Http\Controllers\Admin\PengembalianController as AdminPengembalianController;
use App\Http\Controllers\Admin\PesanKontakController as AdminPesanKontakController;
use App\Http\Controllers\Admin\ProgramStudiController as AdminProgramStudiController;
use App\Http\Controllers\Admin\SerahTerimaController as AdminSerahTerimaController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\VideoTutorialController as AdminVideoTutorialController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Dosen\DashboardController as DosenDashboardController;
use App\Http\Controllers\Dosen\KerusakanController as DosenKerusakanController;
use App\Http\Controllers\Dosen\LaporanController as DosenLaporanController;
use App\Http\Controllers\Dosen\PengembalianController as DosenPengembalianController;
use App\Http\Controllers\Dosen\PeminjamanController as DosenPeminjamanController;
use App\Http\Controllers\KepalaLab\AlatController as KepalaLabAlatController;
use App\Http\Controllers\KepalaLab\DashboardController as KepalaLabDashboardController;
use App\Http\Controllers\KepalaLab\KerusakanController as KepalaLabKerusakanController;
use App\Http\Controllers\KepalaLab\LaboratoriumController as KepalaLabLaboratoriumController;
use App\Http\Controllers\KepalaLab\LaporanController as KepalaLabLaporanController;
use App\Http\Controllers\KepalaLab\MaintenanceController as KepalaLabMaintenanceController;
use App\Http\Controllers\KepalaLab\PeminjamanController as KepalaLabPeminjamanController;
use App\Http\Controllers\KepalaLab\PengembalianController as KepalaLabPengembalianController;
use App\Http\Controllers\Laboran\AlatController as LaboranAlatController;
use App\Http\Controllers\Laboran\DashboardController as LaboranDashboardController;
use App\Http\Controllers\Laboran\KerusakanController as LaboranKerusakanController;
use App\Http\Controllers\Laboran\LaboratoriumController as LaboranLaboratoriumController;
use App\Http\Controllers\Laboran\LaporanController as LaboranLaporanController;
use App\Http\Controllers\Laboran\MaintenanceController as LaboranMaintenanceController;
use App\Http\Controllers\Laboran\PeminjamanController as LaboranPeminjamanController;
use App\Http\Controllers\Laboran\PengembalianController as LaboranPengembalianController;
use App\Http\Controllers\Laboran\SerahTerimaController;
use App\Http\Controllers\Laboran\PenggunaController as LaboranPenggunaController;
use App\Http\Controllers\Laboran\VerifikasiAkunController;
use App\Http\Controllers\Mahasiswa\DashboardController as MahasiswaDashboardController;
use App\Http\Controllers\Mahasiswa\KerusakanController as MahasiswaKerusakanController;
use App\Http\Controllers\Mahasiswa\LaporanController as MahasiswaLaporanController;
use App\Http\Controllers\Mahasiswa\PeminjamanController as MahasiswaPeminjamanController;
use App\Http\Controllers\Mahasiswa\PengembalianController as MahasiswaPengembalianController;
use App\Http\Controllers\KalenderController;
use App\Http\Controllers\NotifikasiController;
use App\Http\Controllers\Pimpinan\AlatController as PimpinanAlatController;
use App\Http\Controllers\Pimpinan\AuditLogController as PimpinanAuditLogController;
use App\Http\Controllers\Pimpinan\DashboardController as PimpinanDashboardController;
use App\Http\Controllers\Pimpinan\KerusakanController as PimpinanKerusakanController;
use App\Http\Controllers\Pimpinan\LaboratoriumController as PimpinanLaboratoriumController;
use App\Http\Controllers\Pimpinan\LaporanController as PimpinanLaporanController;
use App\Http\Controllers\Pimpinan\MaintenanceController as PimpinanMaintenanceController;
use App\Http\Controllers\Pimpinan\PeminjamanController as PimpinanPeminjamanController;
use App\Http\Controllers\Pimpinan\PengaturanController as PimpinanPengaturanController;
use App\Http\Controllers\Pimpinan\PengembalianController as PimpinanPengembalianController;
use App\Http\Controllers\Pimpinan\ProgramStudiController as PimpinanProgramStudiController;
use App\Http\Controllers\Pimpinan\UserController as PimpinanUserController;
use App\Http\Controllers\PublicController;
use App\Models\ProgramStudi;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['web', 'throttle:public'])->group(function () {
    Route::get('/_preview-login-admin', function (\Illuminate\Http\Request $request) {
        $admin = \App\Models\User::role('admin')->first();
        if (! $admin) {
            abort(404, 'Akun admin tidak ditemukan.');
        }
        \Illuminate\Support\Facades\Auth::login($admin);
        $request->session()->regenerate();
        return redirect($request->query('redirect', '/dashboard/admin'));
    });

    Route::get('/_preview-login', function (\Illuminate\Http\Request $request) {
        if (! app()->environment('local', 'development', 'testing')) {
            abort(404);
        }

        $userId = $request->query('user');
        $user = \App\Models\User::find($userId);
        if (! $userId || ! $user) {
            abort(404);
        }

        \Illuminate\Support\Facades\Auth::login($user);
        $request->session()->regenerate();
        return redirect($request->query('redirect', '/dashboard'));
    });
});

Route::middleware('throttle:public')->group(function () {
    Route::get('/', [PublicController::class, 'beranda'])->name('beranda');
    Route::get('/laboratorium', [PublicController::class, 'laboratorium'])->name('laboratorium.index');
    Route::get('/laboratorium/{slug}', [PublicController::class, 'laboratoriumDetail'])->name('laboratorium.show');
    Route::get('/alat', [PublicController::class, 'alat'])->name('alat.index');
    Route::get('/alat/{slug}', [PublicController::class, 'alatDetail'])->name('alat.show');
    Route::get('/tutorial', [PublicController::class, 'tutorial'])->name('tutorial.index');
    Route::get('/tutorial/{slug}', [PublicController::class, 'tutorialDetail'])->name('tutorial.show');
    Route::get('/tentang', [PublicController::class, 'tentang'])->name('tentang');
    Route::get('/faq', [PublicController::class, 'faq'])->name('faq');
    Route::get('/kontak', [PublicController::class, 'kontak'])->name('kontak');
    Route::post('/kontak', [PublicController::class, 'kirimKontak'])->name('kontak.kirim');
    Route::get('/syarat-ketentuan', fn () => Inertia::render('Public/SyaratKetentuan'))->name('syarat');
    Route::get('/kebijakan-privasi', fn () => Inertia::render('Public/KebijakanPrivasi'))->name('kebijakan');

});

Route::get('/verifikasi-email', fn () => Inertia::render('Auth/VerifikasiEmail', [
    'email' => request('email'),
]))->name('verification.notice');
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');
Route::get('/akun-tidak-aktif', fn () => Inertia::render('Auth/AkunTidakAktif'))->name('akun.tidak.aktif');
Route::get('/akun-ditolak', fn () => Inertia::render('Auth/AkunDitolak'))->name('akun.ditolak');
Route::get('/menunggu-persetujuan', fn () => Inertia::render('Auth/MenungguPersetujuan'))->name('menunggu.persetujuan');

Route::middleware(['guest', 'throttle:auth'])->group(function () {
    Route::get('/login', fn () => Inertia::render('Auth/Login'))->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');

    Route::get('/daftar', fn () => Inertia::render('Auth/Daftar', [
        'programStudi' => ProgramStudi::aktif()->get(['id', 'nama', 'jenjang', 'kode']),
    ]))->name('register');

    Route::get('/lupa-password', fn () => Inertia::render('Auth/LupaPassword'))->name('password.request');
    Route::get('/reset-password/{token}', fn (string $token) => Inertia::render('Auth/ResetPassword', [
        'token' => $token,
    ]))->name('password.reset');
});

Route::middleware(['auth', 'verified.email', 'approved'])->group(function () {
    Route::get('/lengkapi-profil', fn () => Inertia::render('Auth/LengkapiProfil'))->name('profile.complete');
});

Route::middleware(['auth', 'verified.email', 'approved', 'profile.complete'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/switch-role', [DashboardController::class, 'switchRole'])->name('switch-role');
    Route::get('/dashboard/admin', [DashboardController::class, 'admin'])->name('dashboard.admin')->middleware('role:admin');
    Route::get('/profil', fn () => Inertia::render('Profile/Index'))->name('profile');

    Route::get('/notifikasi', [NotifikasiController::class, 'index'])->name('notifikasi.index');
    Route::post('/notifikasi/{notifikasi}/read', [NotifikasiController::class, 'read'])->name('notifikasi.read');
    Route::post('/notifikasi/read-all', [NotifikasiController::class, 'markAllRead'])->name('notifikasi.read-all');

    Route::get('/kalender/peminjaman', [KalenderController::class, 'peminjamanEvents'])->name('kalender.peminjaman');
});

Route::middleware(['auth', 'approved', 'profile.complete', 'role:admin'])
    ->prefix('dashboard/admin')
    ->name('admin.')
    ->group(function () {
        Route::resource('program-studi', AdminProgramStudiController::class);
        Route::resource('laboratorium', AdminLaboratoriumController::class);
        Route::post('laboratorium/{laboratorium}/galeri', [AdminLaboratoriumController::class, 'storeGaleri'])->name('laboratorium.galeri.store');
        Route::post('laboratorium/{laboratorium}/galeri/reorder', [AdminLaboratoriumController::class, 'reorderGaleri'])->name('laboratorium.galeri.reorder');
        Route::delete('laboratorium/{laboratorium}/galeri/{galeri}', [AdminLaboratoriumController::class, 'destroyGaleri'])->name('laboratorium.galeri.destroy');
        Route::post('laboratorium/{laboratorium}/dokumen', [AdminLaboratoriumController::class, 'storeDokumen'])->name('laboratorium.dokumen.store');
        Route::post('laboratorium/{laboratorium}/dokumen/reorder', [AdminLaboratoriumController::class, 'reorderDokumen'])->name('laboratorium.dokumen.reorder');
        Route::delete('laboratorium/{laboratorium}/dokumen/{dokumen}', [AdminLaboratoriumController::class, 'destroyDokumen'])->name('laboratorium.dokumen.destroy');
        Route::post('laboratorium/{laboratorium}/tata-tertib', [AdminLaboratoriumController::class, 'storeTataTertib'])->name('laboratorium.tata-tertib.store');
        Route::put('laboratorium/{laboratorium}/tata-tertib/{tataTertib}', [AdminLaboratoriumController::class, 'updateTataTertib'])->name('laboratorium.tata-tertib.update');
        Route::delete('laboratorium/{laboratorium}/tata-tertib/{tataTertib}', [AdminLaboratoriumController::class, 'destroyTataTertib'])->name('laboratorium.tata-tertib.destroy');
        Route::post('laboratorium/{laboratorium}/tata-tertib/reorder', [AdminLaboratoriumController::class, 'reorderTataTertib'])->name('laboratorium.tata-tertib.reorder');
        Route::resource('kategori-alat', KategoriAlatController::class)->parameters(['kategori-alat' => 'kategoriAlat']);
        Route::resource('alat', AdminAlatController::class);
        Route::get('alat/{alat}/qr', [AdminAlatController::class, 'downloadQr'])->name('alat.qr');
        Route::get('alat/{alat}/qr/label', [AdminAlatController::class, 'downloadQrLabel'])->name('alat.qr.label');
        Route::post('alat/{alat}/qr/regenerate', [AdminAlatController::class, 'regenerateQr'])->name('alat.qr.regenerate');
        Route::post('alat/{alat}/galeri', [AdminAlatController::class, 'storeGaleri'])->name('alat.galeri.store');
        Route::post('alat/{alat}/galeri/reorder', [AdminAlatController::class, 'reorderGaleri'])->name('alat.galeri.reorder');
        Route::delete('alat/{alat}/galeri/{galeri}', [AdminAlatController::class, 'destroyGaleri'])->name('alat.galeri.destroy');
        Route::post('alat/{alat}/dokumen', [AdminAlatController::class, 'storeDokumen'])->name('alat.dokumen.store');
        Route::post('alat/{alat}/dokumen/reorder', [AdminAlatController::class, 'reorderDokumen'])->name('alat.dokumen.reorder');
        Route::delete('alat/{alat}/dokumen/{dokumen}', [AdminAlatController::class, 'destroyDokumen'])->name('alat.dokumen.destroy');
        Route::post('alat/{alat}/video', [AdminAlatController::class, 'storeVideo'])->name('alat.video.store');
        Route::post('alat/{alat}/video/reorder', [AdminAlatController::class, 'reorderVideo'])->name('alat.video.reorder');
        Route::delete('alat/{alat}/video/{video}', [AdminAlatController::class, 'destroyVideo'])->name('alat.video.destroy');
        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::get('users/create', [UserController::class, 'create'])->name('users.create');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
        Route::get('users/{user}', [UserController::class, 'show'])->name('users.show');
        Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
        Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::post('users/{user}/verify', [UserController::class, 'verify'])->name('users.verify');
        Route::post('users/{user}/reject', [UserController::class, 'reject'])->name('users.reject');
        Route::post('users/{user}/suspend', [UserController::class, 'suspend'])->name('users.suspend');
        Route::post('users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');
        Route::post('users/{user}/set-role', [UserController::class, 'setRole'])->name('users.set-role');
        Route::get('verifikasi-akun', [UserController::class, 'verifikasi'])->name('verifikasi-akun.index');

        Route::get('peminjaman', [AdminPeminjamanController::class, 'index'])->name('peminjaman.index');
        Route::get('peminjaman/{peminjaman}', [AdminPeminjamanController::class, 'show'])->name('peminjaman.show');
        Route::post('peminjaman/{peminjaman}/approve', [AdminPeminjamanController::class, 'approve'])->name('peminjaman.approve');
        Route::post('peminjaman/{peminjaman}/reject', [AdminPeminjamanController::class, 'reject'])->name('peminjaman.reject');
        Route::delete('peminjaman/{peminjaman}', [AdminPeminjamanController::class, 'destroy'])->name('peminjaman.destroy');

        Route::get('serah-terima', [AdminSerahTerimaController::class, 'index'])->name('serah-terima.index');
        Route::post('serah-terima/{peminjaman}', [AdminSerahTerimaController::class, 'store'])->name('serah-terima.store');

        Route::get('pengembalian', [AdminPengembalianController::class, 'index'])->name('pengembalian.index');
        Route::post('pengembalian/{peminjaman}', [AdminPengembalianController::class, 'store'])->name('pengembalian.store');

        Route::get('pengaturan', [AdminPengaturanController::class, 'index'])->name('pengaturan.index');

        Route::resource('video-tutorial', AdminVideoTutorialController::class)->parameters(['video-tutorial' => 'video']);
        Route::post('pengaturan', [AdminPengaturanController::class, 'update'])->name('pengaturan.update');

        Route::get('backup', [AdminBackupController::class, 'index'])->name('backup.index');
        Route::post('backup', [AdminBackupController::class, 'store'])->name('backup.store');
        Route::post('backup/restore', [AdminBackupController::class, 'restore'])->name('backup.restore');
        Route::get('backup/{file}/download', [AdminBackupController::class, 'download'])->name('backup.download');
        Route::delete('backup/{file}', [AdminBackupController::class, 'destroy'])->name('backup.destroy');

        Route::get('laporan', [AdminLaporanController::class, 'index'])->name('laporan.index');
        Route::get('laporan/export', [AdminLaporanController::class, 'export'])->name('laporan.export');
        Route::get('laporan/export-pdf', [AdminLaporanController::class, 'exportPdf'])->name('laporan.export-pdf');

        Route::get('audit-log', [AdminAuditLogController::class, 'index'])->name('audit-log.index');
        Route::get('audit-log/export', [AdminAuditLogController::class, 'export'])->name('audit-log.export');
        Route::get('audit-log/export-pdf', [AdminAuditLogController::class, 'exportPdf'])->name('audit-log.export-pdf');

        Route::get('pesan-kontak', [AdminPesanKontakController::class, 'index'])->name('pesan-kontak.index');
        Route::get('pesan-kontak/{pesan}', [AdminPesanKontakController::class, 'show'])->name('pesan-kontak.show');
        Route::post('pesan-kontak/{pesan}/status', [AdminPesanKontakController::class, 'updateStatus'])->name('pesan-kontak.status');
        Route::delete('pesan-kontak/{pesan}', [AdminPesanKontakController::class, 'destroy'])->name('pesan-kontak.destroy');

        Route::get('kerusakan', [AdminKerusakanController::class, 'index'])->name('kerusakan.index');
        Route::get('kerusakan/{kerusakan}', [AdminKerusakanController::class, 'show'])->name('kerusakan.show');
        Route::post('kerusakan', [AdminKerusakanController::class, 'store'])->name('kerusakan.store');
        Route::put('kerusakan/{kerusakan}', [AdminKerusakanController::class, 'update'])->name('kerusakan.update');
        Route::post('kerusakan/{kerusakan}/status', [AdminKerusakanController::class, 'updateStatus'])->name('kerusakan.status');
        Route::delete('kerusakan/{kerusakan}', [AdminKerusakanController::class, 'destroy'])->name('kerusakan.destroy');

        Route::get('maintenance', [AdminMaintenanceController::class, 'index'])->name('maintenance.index');
        Route::get('maintenance/{maintenance}', [AdminMaintenanceController::class, 'show'])->name('maintenance.show');
        Route::post('maintenance', [AdminMaintenanceController::class, 'store'])->name('maintenance.store');
        Route::put('maintenance/{maintenance}', [AdminMaintenanceController::class, 'update'])->name('maintenance.update');
        Route::post('maintenance/{maintenance}/start', [AdminMaintenanceController::class, 'start'])->name('maintenance.start');
        Route::post('maintenance/{maintenance}/complete', [AdminMaintenanceController::class, 'complete'])->name('maintenance.complete');
        Route::post('maintenance/{maintenance}/cancel', [AdminMaintenanceController::class, 'cancel'])->name('maintenance.cancel');
    });

Route::middleware(['auth', 'approved', 'profile.complete', 'role:pimpinan'])
    ->prefix('dashboard/pimpinan')
    ->name('pimpinan.')
    ->group(function () {
        Route::get('/', [PimpinanDashboardController::class, 'index'])->name('dashboard');
        Route::get('/pengguna', [PimpinanUserController::class, 'index'])->name('pengguna.index');
        Route::get('/pengguna/{user}', [PimpinanUserController::class, 'show'])->name('pengguna.show');
        Route::get('/program-studi', [PimpinanProgramStudiController::class, 'index'])->name('program-studi.index');
        Route::get('/program-studi/{programStudi}', [PimpinanProgramStudiController::class, 'show'])->name('program-studi.show');
        Route::get('/program-studi/{programStudi}/edit', [PimpinanProgramStudiController::class, 'edit'])->name('program-studi.edit');
        Route::put('/program-studi/{programStudi}', [PimpinanProgramStudiController::class, 'update'])->name('program-studi.update');
        Route::get('/laboratorium', [PimpinanLaboratoriumController::class, 'index'])->name('laboratorium.index');
        Route::get('/laboratorium/{laboratorium}', [PimpinanLaboratoriumController::class, 'show'])->name('laboratorium.show');
        Route::get('/alat', [PimpinanAlatController::class, 'index'])->name('alat.index');
        Route::get('/alat/{alat}', [PimpinanAlatController::class, 'show'])->name('alat.show');
        Route::get('/kerusakan', [PimpinanKerusakanController::class, 'index'])->name('kerusakan.index');
        Route::get('/kerusakan/{kerusakan}', [PimpinanKerusakanController::class, 'show'])->name('kerusakan.show');
        Route::get('/maintenance', [PimpinanMaintenanceController::class, 'index'])->name('maintenance.index');
        Route::get('/maintenance/{maintenance}', [PimpinanMaintenanceController::class, 'show'])->name('maintenance.show');
        Route::get('/peminjaman', [PimpinanPeminjamanController::class, 'index'])->name('peminjaman.index');
        Route::get('/peminjaman/{peminjaman}', [PimpinanPeminjamanController::class, 'show'])->name('peminjaman.show');
        Route::get('/pengembalian', [PimpinanPengembalianController::class, 'index'])->name('pengembalian.index');
        Route::get('/pengembalian/{peminjaman}', [PimpinanPengembalianController::class, 'show'])->name('pengembalian.show');
        Route::get('/laporan', [PimpinanLaporanController::class, 'index'])->name('laporan.index');
        Route::get('/laporan/export', [PimpinanLaporanController::class, 'export'])->name('laporan.export');
        Route::get('/laporan/export-pdf', [PimpinanLaporanController::class, 'exportPdf'])->name('laporan.export-pdf');

        Route::get('/audit-log', [PimpinanAuditLogController::class, 'index'])->name('audit-log.index');
        Route::get('/audit-log/export', [PimpinanAuditLogController::class, 'export'])->name('audit-log.export');
        Route::get('/audit-log/export-pdf', [PimpinanAuditLogController::class, 'exportPdf'])->name('audit-log.export-pdf');
        Route::get('/pengaturan', [PimpinanPengaturanController::class, 'index'])->name('pengaturan.index');
        Route::post('/pengaturan', [PimpinanPengaturanController::class, 'update'])->name('pengaturan.update');
    });

Route::middleware(['auth', 'approved', 'profile.complete', 'role:kepala_lab'])
    ->prefix('dashboard/kepala-lab')
    ->name('kepala-lab.')
    ->group(function () {
        Route::get('/', [KepalaLabDashboardController::class, 'index'])->name('dashboard');

        Route::get('/laboratorium', [KepalaLabLaboratoriumController::class, 'index'])->name('laboratorium.index');
        Route::get('/laboratorium/{laboratorium}', [KepalaLabLaboratoriumController::class, 'show'])->name('laboratorium.show');
        Route::get('/laboratorium/{laboratorium}/edit', [KepalaLabLaboratoriumController::class, 'edit'])->name('laboratorium.edit');
        Route::put('/laboratorium/{laboratorium}', [KepalaLabLaboratoriumController::class, 'update'])->name('laboratorium.update');
        Route::post('/laboratorium/{laboratorium}/galeri', [KepalaLabLaboratoriumController::class, 'storeGaleri'])->name('laboratorium.galeri.store');
        Route::post('/laboratorium/{laboratorium}/galeri/reorder', [KepalaLabLaboratoriumController::class, 'reorderGaleri'])->name('laboratorium.galeri.reorder');
        Route::delete('/laboratorium/{laboratorium}/galeri/{galeri}', [KepalaLabLaboratoriumController::class, 'destroyGaleri'])->name('laboratorium.galeri.destroy');
        Route::post('/laboratorium/{laboratorium}/dokumen', [KepalaLabLaboratoriumController::class, 'storeDokumen'])->name('laboratorium.dokumen.store');
        Route::post('/laboratorium/{laboratorium}/dokumen/reorder', [KepalaLabLaboratoriumController::class, 'reorderDokumen'])->name('laboratorium.dokumen.reorder');
        Route::delete('/laboratorium/{laboratorium}/dokumen/{dokumen}', [KepalaLabLaboratoriumController::class, 'destroyDokumen'])->name('laboratorium.dokumen.destroy');
        Route::post('/laboratorium/{laboratorium}/tata-tertib', [KepalaLabLaboratoriumController::class, 'storeTataTertib'])->name('laboratorium.tata-tertib.store');
        Route::put('/laboratorium/{laboratorium}/tata-tertib/{tataTertib}', [KepalaLabLaboratoriumController::class, 'updateTataTertib'])->name('laboratorium.tata-tertib.update');
        Route::delete('/laboratorium/{laboratorium}/tata-tertib/{tataTertib}', [KepalaLabLaboratoriumController::class, 'destroyTataTertib'])->name('laboratorium.tata-tertib.destroy');
        Route::post('/laboratorium/{laboratorium}/tata-tertib/reorder', [KepalaLabLaboratoriumController::class, 'reorderTataTertib'])->name('laboratorium.tata-tertib.reorder');

        Route::get('/alat', [KepalaLabAlatController::class, 'index'])->name('alat.index');
        Route::get('/alat/create', [KepalaLabAlatController::class, 'create'])->name('alat.create');
        Route::post('/alat', [KepalaLabAlatController::class, 'store'])->name('alat.store');
        Route::get('/alat/{alat}', [KepalaLabAlatController::class, 'show'])->name('alat.show');
        Route::get('/alat/{alat}/edit', [KepalaLabAlatController::class, 'edit'])->name('alat.edit');
        Route::put('/alat/{alat}', [KepalaLabAlatController::class, 'update'])->name('alat.update');
        Route::delete('/alat/{alat}', [KepalaLabAlatController::class, 'destroy'])->name('alat.destroy');
        Route::get('/alat/{alat}/qr', [KepalaLabAlatController::class, 'downloadQr'])->name('alat.qr');
        Route::get('/alat/{alat}/qr/label', [KepalaLabAlatController::class, 'downloadQrLabel'])->name('alat.qr.label');
        Route::post('/alat/{alat}/qr/regenerate', [KepalaLabAlatController::class, 'regenerateQr'])->name('alat.qr.regenerate');
        Route::post('/alat/{alat}/galeri', [KepalaLabAlatController::class, 'storeGaleri'])->name('alat.galeri.store');
        Route::post('/alat/{alat}/galeri/reorder', [KepalaLabAlatController::class, 'reorderGaleri'])->name('alat.galeri.reorder');
        Route::delete('/alat/{alat}/galeri/{galeri}', [KepalaLabAlatController::class, 'destroyGaleri'])->name('alat.galeri.destroy');
        Route::post('/alat/{alat}/dokumen', [KepalaLabAlatController::class, 'storeDokumen'])->name('alat.dokumen.store');
        Route::post('/alat/{alat}/dokumen/reorder', [KepalaLabAlatController::class, 'reorderDokumen'])->name('alat.dokumen.reorder');
        Route::delete('/alat/{alat}/dokumen/{dokumen}', [KepalaLabAlatController::class, 'destroyDokumen'])->name('alat.dokumen.destroy');
        Route::post('/alat/{alat}/video', [KepalaLabAlatController::class, 'storeVideo'])->name('alat.video.store');
        Route::post('/alat/{alat}/video/reorder', [KepalaLabAlatController::class, 'reorderVideo'])->name('alat.video.reorder');
        Route::delete('/alat/{alat}/video/{video}', [KepalaLabAlatController::class, 'destroyVideo'])->name('alat.video.destroy');

        Route::get('/kerusakan', [KepalaLabKerusakanController::class, 'index'])->name('kerusakan.index');
        Route::get('/kerusakan/{kerusakan}', [KepalaLabKerusakanController::class, 'show'])->name('kerusakan.show');
        Route::post('/kerusakan', [KepalaLabKerusakanController::class, 'store'])->name('kerusakan.store');
        Route::put('/kerusakan/{kerusakan}', [KepalaLabKerusakanController::class, 'update'])->name('kerusakan.update');
        Route::delete('/kerusakan/{kerusakan}', [KepalaLabKerusakanController::class, 'destroy'])->name('kerusakan.destroy');
        Route::post('/kerusakan/{kerusakan}/status', [KepalaLabKerusakanController::class, 'updateStatus'])->name('kerusakan.status');
        Route::post('/kerusakan/{kerusakan}/maintenance', [KepalaLabKerusakanController::class, 'registerMaintenance'])->name('kerusakan.maintenance');

        Route::get('/maintenance', [KepalaLabMaintenanceController::class, 'index'])->name('maintenance.index');
        Route::get('/maintenance/{maintenance}', [KepalaLabMaintenanceController::class, 'show'])->name('maintenance.show');
        Route::post('/maintenance', [KepalaLabMaintenanceController::class, 'store'])->name('maintenance.store');
        Route::put('/maintenance/{maintenance}', [KepalaLabMaintenanceController::class, 'update'])->name('maintenance.update');
        Route::post('/maintenance/{maintenance}/start', [KepalaLabMaintenanceController::class, 'start'])->name('maintenance.start');
        Route::post('/maintenance/{maintenance}/complete', [KepalaLabMaintenanceController::class, 'complete'])->name('maintenance.complete');
        Route::post('/maintenance/{maintenance}/cancel', [KepalaLabMaintenanceController::class, 'cancel'])->name('maintenance.cancel');

        Route::get('/peminjaman', [KepalaLabPeminjamanController::class, 'index'])->name('peminjaman.index');
        Route::get('/peminjaman/{peminjaman}', [KepalaLabPeminjamanController::class, 'show'])->name('peminjaman.show');
        Route::post('/peminjaman/{peminjaman}/approve', [KepalaLabPeminjamanController::class, 'approve'])->name('peminjaman.approve');
        Route::post('/peminjaman/{peminjaman}/reject', [KepalaLabPeminjamanController::class, 'reject'])->name('peminjaman.reject');

        Route::get('/pengembalian', [KepalaLabPengembalianController::class, 'index'])->name('pengembalian.index');
        Route::post('/pengembalian/{peminjaman}', [KepalaLabPengembalianController::class, 'store'])->name('pengembalian.store');
        Route::post('/pengembalian/{pengembalian}/bayar-denda', [KepalaLabPengembalianController::class, 'bayarDenda'])->name('pengembalian.bayar-denda');

        Route::get('/laporan', [KepalaLabLaporanController::class, 'index'])->name('laporan.index');
        Route::get('/laporan/export', [KepalaLabLaporanController::class, 'export'])->name('laporan.export');
        Route::get('/laporan/export-pdf', [KepalaLabLaporanController::class, 'exportPdf'])->name('laporan.export-pdf');
    });

Route::middleware(['auth', 'approved', 'profile.complete', 'role:mahasiswa'])
    ->prefix('dashboard/mahasiswa')
    ->name('mahasiswa.')
    ->group(function () {
        Route::get('/', [MahasiswaDashboardController::class, 'index'])->name('dashboard');
        Route::get('/peminjaman', [MahasiswaPeminjamanController::class, 'index'])->name('peminjaman.index');
        Route::get('/peminjaman/baru', [MahasiswaPeminjamanController::class, 'baru'])->name('peminjaman.baru');
        Route::post('/peminjaman/pilih-lab', [MahasiswaPeminjamanController::class, 'pilihLab'])->name('peminjaman.pilih-lab');
        Route::get('/peminjaman/cari-alat', [MahasiswaPeminjamanController::class, 'cariAlat'])->name('peminjaman.cari-alat');
        Route::get('/peminjaman/alat/{alat}/ketersediaan', [MahasiswaPeminjamanController::class, 'ketersediaan'])->name('peminjaman.ketersediaan');
        Route::post('/peminjaman', [MahasiswaPeminjamanController::class, 'store'])->name('peminjaman.store');
        Route::post('/peminjaman/{peminjaman}/cancel', [MahasiswaPeminjamanController::class, 'cancel'])->name('peminjaman.cancel');
        Route::get('/peminjaman/{peminjaman}', [MahasiswaPeminjamanController::class, 'show'])->name('peminjaman.show');
        Route::get('/kerusakan', [MahasiswaKerusakanController::class, 'index'])->name('kerusakan.index');
        Route::get('/kerusakan/{kerusakan}', [MahasiswaKerusakanController::class, 'show'])->name('kerusakan.show');
        Route::get('/pengembalian', [MahasiswaPengembalianController::class, 'index'])->name('pengembalian.index');
        Route::get('/laporan', [MahasiswaLaporanController::class, 'index'])->name('laporan.index');
    });

Route::middleware(['auth', 'approved', 'profile.complete', 'role:dosen'])
    ->prefix('dashboard/dosen')
    ->name('dosen.')
    ->group(function () {
        Route::get('/', [DosenDashboardController::class, 'index'])->name('dashboard');
        Route::get('/peminjaman', [DosenPeminjamanController::class, 'index'])->name('peminjaman.index');
        Route::post('/peminjaman/{peminjaman}/approve', [DosenPeminjamanController::class, 'approve'])->name('peminjaman.approve');
        Route::post('/peminjaman/{peminjaman}/reject', [DosenPeminjamanController::class, 'reject'])->name('peminjaman.reject');
        Route::get('/peminjaman/{peminjaman}', [DosenPeminjamanController::class, 'show'])->name('peminjaman.show');
        Route::get('/kerusakan', [DosenKerusakanController::class, 'index'])->name('kerusakan.index');
        Route::get('/kerusakan/{kerusakan}', [DosenKerusakanController::class, 'show'])->name('kerusakan.show');
        Route::get('/pengembalian', [DosenPengembalianController::class, 'index'])->name('pengembalian.index');
        Route::get('/laporan', [DosenLaporanController::class, 'index'])->name('laporan.index');
        Route::get('/laporan/export', [DosenLaporanController::class, 'export'])->name('laporan.export');
        Route::get('/laporan/export-pdf', [DosenLaporanController::class, 'exportPdf'])->name('laporan.export-pdf');
    });

Route::middleware(['auth', 'approved', 'profile.complete', 'role:laboran,kepala_lab'])
    ->prefix('dashboard/laboran')
    ->name('laboran.')
    ->group(function () {
        Route::get('/', [LaboranDashboardController::class, 'index'])->name('dashboard');

        Route::get('/verifikasi-akun', [VerifikasiAkunController::class, 'index'])->name('verifikasi-akun.index');
        Route::post('/verifikasi-akun/{user}/approve', [VerifikasiAkunController::class, 'approve'])->name('verifikasi-akun.approve');
        Route::post('/verifikasi-akun/{user}/reject', [VerifikasiAkunController::class, 'reject'])->name('verifikasi-akun.reject');

        Route::get('/pengguna', [LaboranPenggunaController::class, 'index'])->name('pengguna.index');
        Route::get('/pengguna/create', [LaboranPenggunaController::class, 'create'])->name('pengguna.create');
        Route::post('/pengguna', [LaboranPenggunaController::class, 'store'])->name('pengguna.store');
        Route::get('/pengguna/{user}', [LaboranPenggunaController::class, 'show'])->name('pengguna.show');
        Route::get('/pengguna/{user}/edit', [LaboranPenggunaController::class, 'edit'])->name('pengguna.edit');
        Route::put('/pengguna/{user}', [LaboranPenggunaController::class, 'update'])->name('pengguna.update');
        Route::delete('/pengguna/{user}', [LaboranPenggunaController::class, 'destroy'])->name('pengguna.destroy');

        Route::get('/laboratorium', [LaboranLaboratoriumController::class, 'index'])->name('laboratorium.index');
        Route::get('/laboratorium/{laboratorium}', [LaboranLaboratoriumController::class, 'show'])->name('laboratorium.show');
        Route::get('/laboratorium/{laboratorium}/edit', [LaboranLaboratoriumController::class, 'edit'])->name('laboratorium.edit');
        Route::put('/laboratorium/{laboratorium}', [LaboranLaboratoriumController::class, 'update'])->name('laboratorium.update');
        Route::post('/laboratorium/{laboratorium}/galeri', [LaboranLaboratoriumController::class, 'storeGaleri'])->name('laboratorium.galeri.store');
        Route::post('/laboratorium/{laboratorium}/galeri/reorder', [LaboranLaboratoriumController::class, 'reorderGaleri'])->name('laboratorium.galeri.reorder');
        Route::delete('/laboratorium/{laboratorium}/galeri/{galeri}', [LaboranLaboratoriumController::class, 'destroyGaleri'])->name('laboratorium.galeri.destroy');
        Route::post('/laboratorium/{laboratorium}/dokumen', [LaboranLaboratoriumController::class, 'storeDokumen'])->name('laboratorium.dokumen.store');
        Route::post('/laboratorium/{laboratorium}/dokumen/reorder', [LaboranLaboratoriumController::class, 'reorderDokumen'])->name('laboratorium.dokumen.reorder');
        Route::delete('/laboratorium/{laboratorium}/dokumen/{dokumen}', [LaboranLaboratoriumController::class, 'destroyDokumen'])->name('laboratorium.dokumen.destroy');
        Route::post('/laboratorium/{laboratorium}/tata-tertib', [LaboranLaboratoriumController::class, 'storeTataTertib'])->name('laboratorium.tata-tertib.store');
        Route::put('/laboratorium/{laboratorium}/tata-tertib/{tataTertib}', [LaboranLaboratoriumController::class, 'updateTataTertib'])->name('laboratorium.tata-tertib.update');
        Route::delete('/laboratorium/{laboratorium}/tata-tertib/{tataTertib}', [LaboranLaboratoriumController::class, 'destroyTataTertib'])->name('laboratorium.tata-tertib.destroy');
        Route::post('/laboratorium/{laboratorium}/tata-tertib/reorder', [LaboranLaboratoriumController::class, 'reorderTataTertib'])->name('laboratorium.tata-tertib.reorder');

        Route::get('/alat', [LaboranAlatController::class, 'index'])->name('alat.index');
        Route::get('/alat/create', [LaboranAlatController::class, 'create'])->name('alat.create');
        Route::post('/alat', [LaboranAlatController::class, 'store'])->name('alat.store');
        Route::get('/alat/{alat}', [LaboranAlatController::class, 'show'])->name('alat.show');
        Route::get('/alat/{alat}/edit', [LaboranAlatController::class, 'edit'])->name('alat.edit');
        Route::put('/alat/{alat}', [LaboranAlatController::class, 'update'])->name('alat.update');
        Route::delete('/alat/{alat}', [LaboranAlatController::class, 'destroy'])->name('alat.destroy');
        Route::get('/alat/{alat}/qr', [LaboranAlatController::class, 'downloadQr'])->name('alat.qr');
        Route::get('/alat/{alat}/qr/label', [LaboranAlatController::class, 'downloadQrLabel'])->name('alat.qr.label');
        Route::post('/alat/{alat}/qr/regenerate', [LaboranAlatController::class, 'regenerateQr'])->name('alat.qr.regenerate');
        Route::post('/alat/{alat}/galeri', [LaboranAlatController::class, 'storeGaleri'])->name('alat.galeri.store');
        Route::post('/alat/{alat}/galeri/reorder', [LaboranAlatController::class, 'reorderGaleri'])->name('alat.galeri.reorder');
        Route::delete('/alat/{alat}/galeri/{galeri}', [LaboranAlatController::class, 'destroyGaleri'])->name('alat.galeri.destroy');
        Route::post('/alat/{alat}/dokumen', [LaboranAlatController::class, 'storeDokumen'])->name('alat.dokumen.store');
        Route::post('/alat/{alat}/dokumen/reorder', [LaboranAlatController::class, 'reorderDokumen'])->name('alat.dokumen.reorder');
        Route::delete('/alat/{alat}/dokumen/{dokumen}', [LaboranAlatController::class, 'destroyDokumen'])->name('alat.dokumen.destroy');
        Route::post('/alat/{alat}/video', [LaboranAlatController::class, 'storeVideo'])->name('alat.video.store');
        Route::post('/alat/{alat}/video/reorder', [LaboranAlatController::class, 'reorderVideo'])->name('alat.video.reorder');
        Route::delete('/alat/{alat}/video/{video}', [LaboranAlatController::class, 'destroyVideo'])->name('alat.video.destroy');

        Route::get('/laporan', [LaboranLaporanController::class, 'index'])->name('laporan.index');
        Route::get('/laporan/export', [LaboranLaporanController::class, 'export'])->name('laporan.export');
        Route::get('/laporan/export-pdf', [LaboranLaporanController::class, 'exportPdf'])->name('laporan.export-pdf');

        Route::get('/peminjaman', [LaboranPeminjamanController::class, 'index'])->name('peminjaman.index');
        Route::post('/peminjaman/{peminjaman}/approve', [LaboranPeminjamanController::class, 'approve'])->name('peminjaman.approve');
        Route::post('/peminjaman/{peminjaman}/reject', [LaboranPeminjamanController::class, 'reject'])->name('peminjaman.reject');
        Route::get('/peminjaman/{peminjaman}', [LaboranPeminjamanController::class, 'show'])->name('peminjaman.show');
        Route::get('/serah-terima', [SerahTerimaController::class, 'index'])->name('serah-terima.index');
        Route::post('/serah-terima/{peminjaman}', [SerahTerimaController::class, 'store'])->name('serah-terima.store');
        Route::get('/pengembalian', [LaboranPengembalianController::class, 'index'])->name('pengembalian.index');
        Route::post('/pengembalian/{peminjaman}', [LaboranPengembalianController::class, 'store'])->name('pengembalian.store');
        Route::post('/pengembalian/{pengembalian}/bayar-denda', [LaboranPengembalianController::class, 'bayarDenda'])->name('pengembalian.bayar-denda');
        Route::get('/kerusakan', [LaboranKerusakanController::class, 'index'])->name('kerusakan.index');
        Route::get('/kerusakan/{kerusakan}', [LaboranKerusakanController::class, 'show'])->name('kerusakan.show');
        Route::post('/kerusakan', [LaboranKerusakanController::class, 'store'])->name('kerusakan.store');
        Route::put('/kerusakan/{kerusakan}', [LaboranKerusakanController::class, 'update'])->name('kerusakan.update');
        Route::post('/kerusakan/{kerusakan}/maintenance', [LaboranKerusakanController::class, 'registerMaintenance'])->name('kerusakan.maintenance');
        Route::post('/kerusakan/{kerusakan}/status', [LaboranKerusakanController::class, 'updateStatus'])->name('kerusakan.status');
        Route::delete('/kerusakan/{kerusakan}', [LaboranKerusakanController::class, 'destroy'])->name('kerusakan.destroy');
        Route::get('/maintenance', [LaboranMaintenanceController::class, 'index'])->name('maintenance.index');
        Route::get('/maintenance/{maintenance}', [LaboranMaintenanceController::class, 'show'])->name('maintenance.show');
        Route::post('/maintenance', [LaboranMaintenanceController::class, 'store'])->name('maintenance.store');
        Route::put('/maintenance/{maintenance}', [LaboranMaintenanceController::class, 'update'])->name('maintenance.update');
        Route::post('/maintenance/{maintenance}/start', [LaboranMaintenanceController::class, 'start'])->name('maintenance.start');
        Route::post('/maintenance/{maintenance}/complete', [LaboranMaintenanceController::class, 'complete'])->name('maintenance.complete');
        Route::post('/maintenance/{maintenance}/cancel', [LaboranMaintenanceController::class, 'cancel'])->name('maintenance.cancel');
    });

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth')
    ->name('logout');
