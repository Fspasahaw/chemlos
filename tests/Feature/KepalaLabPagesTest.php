<?php

namespace Tests\Feature;

use App\Models\Alat;
use App\Models\Laboratorium;
use App\Models\LaboratoriumPengelola;
use App\Models\Peminjaman;
use App\Models\PeminjamanDetail;
use App\Models\Pengembalian;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KepalaLabPagesTest extends TestCase
{
    use RefreshDatabase;

    protected Laboratorium $lab;
    protected Alat $alat;
    protected User $kepalaLab;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);

        $this->lab = Laboratorium::create([
            'nama' => 'Lab Proses',
            'kode' => 'LAB-PROSES',
            'slug' => 'lab-proses',
            'lokasi' => 'Depok',
            'status' => 'aktif',
        ]);

        $this->alat = Alat::create([
            'nama' => 'pH Meter',
            'kode' => 'ALAT-001',
            'slug' => 'ph-meter',
            'laboratorium_id' => $this->lab->id,
            'kondisi' => 'baik',
            'stok_total' => 5,
            'stok_tersedia' => 5,
            'stok_reserved' => 0,
            'stok_dipinjam' => 0,
            'stok_maintenance' => 0,
        ]);

        $this->kepalaLab = User::create([
            'name' => 'Kepala Lab Test',
            'nama_lengkap' => 'Kepala Lab Test',
            'email' => 'kepala-lab@test.com',
            'password' => 'password',
            'npm_nip' => '199001011001002',
            'no_hp' => '081234567891',
            'status' => 'approved',
            'email_verified_at' => now(),
            'tanggal_lahir' => '1985-01-01',
            'jenis_kelamin' => 'L',
            'alamat' => 'Jl. Test',
        ]);
        $this->kepalaLab->assignRole('kepala_lab');

        LaboratoriumPengelola::create([
            'laboratorium_id' => $this->lab->id,
            'user_id' => $this->kepalaLab->id,
            'peran' => 'kepala_lab',
            'is_primary' => true,
        ]);
    }

    public function test_kepala_lab_buka_halaman_peminjaman_pengembalian_dan_laboratorium(): void
    {
        $this->actingAs($this->kepalaLab)
            ->get('/dashboard/kepala-lab/peminjaman')
            ->assertOk();

        $this->actingAs($this->kepalaLab)
            ->get('/dashboard/kepala-lab/pengembalian')
            ->assertOk();

        $this->actingAs($this->kepalaLab)
            ->get('/dashboard/kepala-lab/laboratorium')
            ->assertOk();
    }

    public function test_kepala_lab_bisa_menyetujui_dan_menolak_peminjaman(): void
    {
        $mahasiswa = $this->createMahasiswa();
        $dosen = $this->createDosen();

        $peminjaman = $this->createPeminjaman($mahasiswa, $dosen, 'menunggu_laboran');

        $this->actingAs($this->kepalaLab)
            ->post("/dashboard/kepala-lab/peminjaman/{$peminjaman->id}/approve")
            ->assertRedirect();

        $peminjaman->refresh();
        $this->assertEquals('disetujui', $peminjaman->status);

        $peminjaman2 = $this->createPeminjaman($mahasiswa, $dosen, 'menunggu_laboran', 'PKM-002');

        $this->actingAs($this->kepalaLab)
            ->post("/dashboard/kepala-lab/peminjaman/{$peminjaman2->id}/reject", [
                'alasan_penolakan' => 'Jadwal penuh',
            ])
            ->assertRedirect();

        $peminjaman2->refresh();
        $this->assertEquals('ditolak', $peminjaman2->status);
    }

    public function test_kepala_lab_bisa_melihat_detail_peminjaman(): void
    {
        $mahasiswa = $this->createMahasiswa();
        $dosen = $this->createDosen();

        $peminjaman = $this->createPeminjaman($mahasiswa, $dosen, 'menunggu_laboran');

        $this->actingAs($this->kepalaLab)
            ->get("/dashboard/kepala-lab/peminjaman/{$peminjaman->id}")
            ->assertOk();
    }

    public function test_kepala_lab_tidak_bisa_memproses_pengembalian(): void
    {
        $mahasiswa = $this->createMahasiswa();
        $dosen = $this->createDosen();

        $peminjaman = $this->createPeminjaman($mahasiswa, $dosen, 'berlangsung');

        $this->alat->update(['stok_dipinjam' => 2, 'stok_tersedia' => 3]);

        $this->actingAs($this->kepalaLab)
            ->post("/dashboard/kepala-lab/pengembalian/{$peminjaman->id}", [
                'kondisi_umum' => 'Baik',
                'detail' => [
                    $peminjaman->details->first()->id => [
                        'kondisi_pengembalian' => 'baik',
                        'catatan_pengembalian' => '',
                        'denda_per_alat' => null,
                    ],
                ],
            ])
            ->assertForbidden();

        $peminjaman->refresh();
        $this->assertEquals('berlangsung', $peminjaman->status);
        $this->assertNull($peminjaman->pengembalian);

        $this->alat->refresh();
        $this->assertEquals(2, $this->alat->stok_dipinjam);
        $this->assertEquals(3, $this->alat->stok_tersedia);
    }

    public function test_kepala_lab_bisa_mengedit_laboratorium(): void
    {
        $this->actingAs($this->kepalaLab)
            ->get("/dashboard/kepala-lab/laboratorium/{$this->lab->id}/edit")
            ->assertOk();

        $this->actingAs($this->kepalaLab)
            ->put("/dashboard/kepala-lab/laboratorium/{$this->lab->id}", [
                'nama' => 'Lab Proses Updated',
                'kode' => 'LAB-PROSES-UPDATED',
                'lokasi' => 'Depok Updated',
                'status' => 'aktif',
            ])
            ->assertRedirect('/dashboard/kepala-lab/laboratorium');

        $this->lab->refresh();
        $this->assertEquals('Lab Proses Updated', $this->lab->nama);
        $this->assertEquals('LAB-PROSES-UPDATED', $this->lab->kode);
    }

    private function createMahasiswa(): User
    {
        $user = User::create([
            'name' => 'Mahasiswa Test',
            'nama_lengkap' => 'Mahasiswa Test',
            'email' => 'mahasiswa@test.com',
            'password' => 'password',
            'npm_nip' => '1906285001',
            'no_hp' => '081234567892',
            'status' => 'approved',
            'email_verified_at' => now(),
            'tanggal_lahir' => '2000-01-01',
            'jenis_kelamin' => 'L',
            'alamat' => 'Jl. Mahasiswa',
        ]);
        $user->assignRole('mahasiswa');

        return $user;
    }

    private function createDosen(): User
    {
        $user = User::create([
            'name' => 'Dosen Test',
            'nama_lengkap' => 'Dosen Test',
            'email' => 'dosen@test.com',
            'password' => 'password',
            'npm_nip' => '197001011001003',
            'no_hp' => '081234567893',
            'status' => 'approved',
            'email_verified_at' => now(),
            'tanggal_lahir' => '1970-01-01',
            'jenis_kelamin' => 'L',
            'alamat' => 'Jl. Dosen',
        ]);
        $user->assignRole('dosen');

        return $user;
    }

    private function createPeminjaman(User $mahasiswa, User $dosen, string $status, string $kode = 'PKM-001'): Peminjaman
    {
        $peminjaman = Peminjaman::create([
            'user_id' => $mahasiswa->id,
            'dosen_pembimbing_id' => $dosen->id,
            'laboratorium_id' => $this->lab->id,
            'kode' => $kode,
            'tujuan' => 'Penelitian',
            'tanggal_mulai' => now()->toDateString(),
            'jam_mulai' => '08:00',
            'tanggal_selesai' => now()->addDay()->toDateString(),
            'jam_selesai' => '16:00',
            'status' => $status,
        ]);

        PeminjamanDetail::create([
            'peminjaman_id' => $peminjaman->id,
            'alat_id' => $this->alat->id,
            'jumlah' => 2,
        ]);

        return $peminjaman->refresh();
    }
}
