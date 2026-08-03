<?php

namespace Tests\Feature;

use App\Models\Alat;
use App\Models\Laboratorium;
use App\Models\LaboratoriumPengelola;
use App\Models\Peminjaman;
use App\Models\PeminjamanDetail;
use App\Models\PeminjamanStatusLog;
use App\Models\Pengaturan;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PeminjamanFlowTest extends TestCase
{
    use RefreshDatabase;

    protected Laboratorium $lab;
    protected Alat $alat;
    protected User $mahasiswa;
    protected User $dosen;
    protected User $laboran;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->seed(RolePermissionSeeder::class);

        // Pengaturan untuk tidak wajib upload JSA agar test lebih ringkas
        Pengaturan::create(['grup' => 'peminjaman', 'key' => 'wajib_upload_jsa', 'value' => '0']);

        $this->lab = Laboratorium::create([
            'nama' => 'Lab Bioproses',
            'kode' => 'LAB-BIO',
            'slug' => 'lab-bioproses',
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

        $this->dosen = User::create([
            'name' => 'Dosen Test',
            'nama_lengkap' => 'Dosen Test',
            'email' => 'dosen@test.com',
            'password' => 'password',
            'npm_nip' => '197001011001001',
            'no_hp' => '081234567890',
            'status' => 'approved',
            'email_verified_at' => now(),
            'tanggal_lahir' => '1980-01-01',
            'jenis_kelamin' => 'L',
            'alamat' => 'Jl. Test',
        ]);
        $this->dosen->assignRole('dosen');

        $this->laboran = User::create([
            'name' => 'Laboran Test',
            'nama_lengkap' => 'Laboran Test',
            'email' => 'laboran@test.com',
            'password' => 'password',
            'npm_nip' => '199001011001001',
            'no_hp' => '081234567891',
            'status' => 'approved',
            'email_verified_at' => now(),
            'tanggal_lahir' => '1985-01-01',
            'jenis_kelamin' => 'L',
            'alamat' => 'Jl. Test',
        ]);
        $this->laboran->assignRole('laboran');

        LaboratoriumPengelola::create([
            'laboratorium_id' => $this->lab->id,
            'user_id' => $this->laboran->id,
            'peran' => 'laboran',
            'is_primary' => true,
        ]);

        $this->mahasiswa = User::create([
            'name' => 'Mahasiswa Test',
            'nama_lengkap' => 'Mahasiswa Test',
            'email' => 'mahasiswa@test.com',
            'password' => 'password',
            'npm_nip' => '2206285001',
            'no_hp' => '081234567892',
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

    protected function ajukanPeminjaman(): Peminjaman
    {
        $response = $this->actingAs($this->mahasiswa)
            ->post('/dashboard/mahasiswa/peminjaman', [
                'laboratorium_id' => $this->lab->id,
                'dosen_pembimbing_id' => $this->dosen->id,
                'tujuan' => 'Praktikum uji pH',
                'tanggal_mulai' => now()->addDay()->toDateString(),
                'jam_mulai' => '08:00',
                'tanggal_selesai' => now()->addDays(2)->toDateString(),
                'jam_selesai' => '17:00',
                'alat' => [
                    ['alat_id' => $this->alat->id, 'jumlah' => 5],
                ],
            ]);

        $response->assertRedirect('/dashboard/mahasiswa/peminjaman');

        return Peminjaman::latest('id')->first();
    }

    public function test_mahasiswa_dapat_mengajukan_peminjaman_dan_stok_reserved_bertambah(): void
    {
        $peminjaman = $this->ajukanPeminjaman();

        $this->assertEquals('menunggu_dosen', $peminjaman->status);
        $this->assertDatabaseHas('peminjaman_status_log', [
            'peminjaman_id' => $peminjaman->id,
            'status_ke' => 'menunggu_dosen',
        ]);

        $this->alat->refresh();
        $this->assertEquals(5, $this->alat->stok_reserved);
        $this->assertEquals(0, $this->alat->stok_tersedia);
    }

    public function test_dosen_dapat_menyetujui_peminjaman(): void
    {
        $peminjaman = $this->ajukanPeminjaman();

        $response = $this->actingAs($this->dosen)
            ->post("/dashboard/dosen/peminjaman/{$peminjaman->id}/approve");

        $response->assertRedirect();
        $peminjaman->refresh();
        $this->assertEquals('menunggu_laboran', $peminjaman->status);
    }

    public function test_dosen_dapat_menolak_peminjaman_dan_stok_kembali(): void
    {
        $peminjaman = $this->ajukanPeminjaman();

        $response = $this->actingAs($this->dosen)
            ->post("/dashboard/dosen/peminjaman/{$peminjaman->id}/reject", [
                'alasan_penolakan' => 'Alat tidak tersedia',
            ]);

        $response->assertRedirect();
        $peminjaman->refresh();
        $this->assertEquals('ditolak', $peminjaman->status);

        $this->alat->refresh();
        $this->assertEquals(0, $this->alat->stok_reserved);
        $this->assertEquals(5, $this->alat->stok_tersedia);
    }

    public function test_laboran_dapat_serah_terima_dan_ubah_status_berlangsung(): void
    {
        $peminjaman = $this->ajukanPeminjaman();
        $this->actingAs($this->dosen)->post("/dashboard/dosen/peminjaman/{$peminjaman->id}/approve");
        $this->actingAs($this->laboran)->post("/dashboard/laboran/peminjaman/{$peminjaman->id}/approve");

        $detail = PeminjamanDetail::where('peminjaman_id', $peminjaman->id)->first();

        $response = $this->actingAs($this->laboran)
            ->post("/dashboard/laboran/serah-terima/{$peminjaman->id}", [
                'kondisi_umum' => 'Baik',
                'detail' => [
                    $detail->id => [
                        'kondisi_serah_terima' => 'baik',
                        'catatan_serah_terima' => 'Kondisi baik',
                    ],
                ],
            ]);

        $response->assertRedirect();
        $peminjaman->refresh();
        $this->assertEquals('berlangsung', $peminjaman->status);

        $this->alat->refresh();
        $this->assertEquals(0, $this->alat->stok_reserved);
        $this->assertEquals(5, $this->alat->stok_dipinjam);
    }

    public function test_laboran_dapat_mengembalikan_alat_dan_stok_kembali(): void
    {
        $peminjaman = $this->ajukanPeminjaman();
        $this->actingAs($this->dosen)->post("/dashboard/dosen/peminjaman/{$peminjaman->id}/approve");
        $this->actingAs($this->laboran)->post("/dashboard/laboran/peminjaman/{$peminjaman->id}/approve");
        $detail = PeminjamanDetail::where('peminjaman_id', $peminjaman->id)->first();
        $this->actingAs($this->laboran)->post("/dashboard/laboran/serah-terima/{$peminjaman->id}", [
            'kondisi_umum' => 'Baik',
            'detail' => [
                $detail->id => [
                    'kondisi_serah_terima' => 'baik',
                ],
            ],
        ]);

        $response = $this->actingAs($this->laboran)
            ->post("/dashboard/laboran/pengembalian/{$peminjaman->id}", [
                'kondisi_umum' => 'Baik',
                'detail' => [
                    $detail->id => [
                        'kondisi_pengembalian' => 'baik',
                        'catatan_pengembalian' => 'Dikembalikan baik',
                    ],
                ],
            ]);

        $response->assertRedirect();
        $peminjaman->refresh();
        $this->assertEquals('selesai', $peminjaman->status);

        $this->alat->refresh();
        $this->assertEquals(0, $this->alat->stok_dipinjam);
        $this->assertEquals(5, $this->alat->stok_tersedia);
    }

    public function test_kondisi_rusak_saat_pengembalian_membuat_kerusakan_record(): void
    {
        $peminjaman = $this->ajukanPeminjaman();
        $this->actingAs($this->dosen)->post("/dashboard/dosen/peminjaman/{$peminjaman->id}/approve");
        $this->actingAs($this->laboran)->post("/dashboard/laboran/peminjaman/{$peminjaman->id}/approve");
        $detail = PeminjamanDetail::where('peminjaman_id', $peminjaman->id)->first();
        $this->actingAs($this->laboran)->post("/dashboard/laboran/serah-terima/{$peminjaman->id}", [
            'detail' => [
                $detail->id => [
                    'kondisi_serah_terima' => 'baik',
                ],
            ],
        ]);

        $this->actingAs($this->laboran)
            ->post("/dashboard/laboran/pengembalian/{$peminjaman->id}", [
                'detail' => [
                    $detail->id => [
                        'kondisi_pengembalian' => 'rusak_berat',
                        'denda_per_alat' => 150000,
                    ],
                ],
            ]);

        $this->assertDatabaseHas('kerusakan_alat', [
            'alat_id' => $this->alat->id,
            'peminjaman_id' => $peminjaman->id,
            'kondisi' => 'rusak_berat',
            'jumlah' => 5,
        ]);

        $this->alat->refresh();
        $this->assertEquals(5, $this->alat->stok_maintenance);
    }
}
