<?php

namespace Tests\Feature;

use App\Console\Commands\AutoCancelPeminjaman;
use App\Models\Alat;
use App\Models\Laboratorium;
use App\Models\Notifikasi;
use App\Models\Peminjaman;
use App\Models\PeminjamanDetail;
use App\Models\PeminjamanStatusLog;
use App\Models\Pengaturan;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AutoCancelCommandTest extends TestCase
{
    use RefreshDatabase;

    protected User $mahasiswa;
    protected Laboratorium $lab;
    protected Alat $alat;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        $this->seed(RolePermissionSeeder::class);

        Pengaturan::create(['grup' => 'peminjaman', 'key' => 'batas_waktu_persetujuan_jam', 'value' => '24']);

        $this->lab = Laboratorium::create([
            'nama' => 'Lab Uji',
            'kode' => 'LAB-UJI',
            'slug' => 'lab-uji',
            'lokasi' => 'Depok',
            'status' => 'aktif',
        ]);

        $this->alat = Alat::create([
            'nama' => 'Spektrofotometer',
            'kode' => 'ALAT-UJI-001',
            'slug' => 'spektrofotometer',
            'laboratorium_id' => $this->lab->id,
            'kondisi' => 'baik',
            'stok_total' => 5,
            'stok_tersedia' => 3,
            'stok_reserved' => 2,
            'stok_dipinjam' => 0,
            'stok_maintenance' => 0,
        ]);

        $this->mahasiswa = User::create([
            'name' => 'Mahasiswa AutoCancel',
            'nama_lengkap' => 'Mahasiswa AutoCancel',
            'email' => 'autocancel@example.com',
            'password' => 'password',
            'npm_nip' => '2206285099',
            'no_hp' => '081234567899',
            'status' => 'approved',
            'email_verified_at' => now(),
            'tanggal_lahir' => '2001-01-01',
            'jenis_kelamin' => 'L',
            'alamat' => 'Jl. Test',
            'angkatan' => 2022,
            'semester' => 2,
            'foto_ktm' => 'demo/ktm/test.jpg',
        ]);
        $this->mahasiswa->assignRole('mahasiswa');
    }

    public function test_auto_cancel_membatalkan_peminjaman_melebihi_batas_waktu(): void
    {
        $peminjaman = Peminjaman::create([
            'user_id' => $this->mahasiswa->id,
            'laboratorium_id' => $this->lab->id,
            'kode' => 'PINJ-AC-001',
            'tujuan' => 'Penelitian',
            'tanggal_mulai' => now()->addDay()->toDateString(),
            'jam_mulai' => '08:00:00',
            'tanggal_selesai' => now()->addDays(3)->toDateString(),
            'jam_selesai' => '16:00:00',
            'status' => 'menunggu_dosen',
        ]);
        $peminjaman->created_at = now()->subHours(25);
        $peminjaman->saveQuietly();

        PeminjamanDetail::create([
            'peminjaman_id' => $peminjaman->id,
            'alat_id' => $this->alat->id,
            'jumlah' => 2,
        ]);

        $this->assertEquals(2, $this->alat->fresh()->stok_reserved);

        Artisan::call('chemlos:auto-cancel');

        $this->assertEquals('dibatalkan', $peminjaman->fresh()->status);
        $this->assertEquals(0, $this->alat->fresh()->stok_reserved);
        $this->assertEquals(5, $this->alat->fresh()->stok_tersedia);
        $this->assertDatabaseHas('notifikasi', [
            'user_id' => $this->mahasiswa->id,
            'judul' => 'Peminjaman Dibatalkan Otomatis',
            'kategori' => 'peminjaman',
            'jenis' => 'info',
        ]);
        $this->assertDatabaseHas('peminjaman_status_log', [
            'peminjaman_id' => $peminjaman->id,
            'status_dari' => 'menunggu_dosen',
            'status_ke' => 'dibatalkan',
        ]);
    }

    public function test_auto_cancel_tidak_membatalkan_peminjaman_baru(): void
    {
        $peminjaman = Peminjaman::create([
            'user_id' => $this->mahasiswa->id,
            'laboratorium_id' => $this->lab->id,
            'kode' => 'PINJ-AC-002',
            'tujuan' => 'Penelitian',
            'tanggal_mulai' => now()->addDay()->toDateString(),
            'jam_mulai' => '08:00:00',
            'tanggal_selesai' => now()->addDays(3)->toDateString(),
            'jam_selesai' => '16:00:00',
            'status' => 'menunggu_dosen',
        ]);
        $peminjaman->created_at = now()->subHours(2);
        $peminjaman->saveQuietly();

        PeminjamanDetail::create([
            'peminjaman_id' => $peminjaman->id,
            'alat_id' => $this->alat->id,
            'jumlah' => 2,
        ]);

        Artisan::call('chemlos:auto-cancel');

        $this->assertEquals('menunggu_dosen', $peminjaman->fresh()->status);
        $this->assertEquals(2, $this->alat->fresh()->stok_reserved);
    }
}
