<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class Fase9AdminMasterDataTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Http::fake(['*' => Http::response('fake-image-data', 200)]);
        $this->seed(DatabaseSeeder::class);
    }

    protected function adminUser(): User
    {
        return User::where('email', 'admin@che.ui.ac.id')->firstOrFail();
    }

    public function test_admin_dashboard_renders(): void
    {
        $this->actingAs($this->adminUser())
            ->get('/dashboard/admin')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Dashboard/Admin/Index'));

    }

    public function test_admin_master_data_pages_render(): void
    {
        $admin = $this->adminUser();
        $pages = [
            '/dashboard/admin/program-studi',
            '/dashboard/admin/users',
            '/dashboard/admin/verifikasi-akun',
            '/dashboard/admin/laboratorium',
            '/dashboard/admin/kategori-alat',
            '/dashboard/admin/alat',
            '/dashboard/admin/video-tutorial',
            '/dashboard/admin/peminjaman',
            '/dashboard/admin/serah-terima',
            '/dashboard/admin/pengembalian',
            '/dashboard/admin/kerusakan',
            '/dashboard/admin/maintenance',
            '/dashboard/admin/pengaturan',
            '/dashboard/admin/laporan',
            '/dashboard/admin/audit-log',
            '/dashboard/admin/pesan-kontak',
        ];

        foreach ($pages as $url) {
            $this->actingAs($admin)->get($url)->assertOk();
        }
    }

    public function test_program_studi_crud(): void
    {
        $admin = $this->adminUser();

        $response = $this->actingAs($admin)->post('/dashboard/admin/program-studi', [
            'nama' => 'Teknik Kimia Baru',
            'jenjang' => 'S1',
            'kode' => 'TKB',
            'status' => 'aktif',
            'deskripsi' => 'Prodi baru',
        ]);

        $response->assertRedirect('/dashboard/admin/program-studi');
        $this->assertDatabaseHas('program_studi', ['kode' => 'TKB']);

        $prodi = \App\Models\ProgramStudi::where('kode', 'TKB')->firstOrFail();

        $this->actingAs($admin)
            ->put("/dashboard/admin/program-studi/{$prodi->id}", [
                'nama' => 'Teknik Kimia Updated',
                'jenjang' => 'S1',
                'kode' => 'TKB',
                'status' => 'aktif',
                'deskripsi' => 'Prodi updated',
            ])
            ->assertRedirect();

        $this->actingAs($admin)
            ->delete("/dashboard/admin/program-studi/{$prodi->id}")
            ->assertRedirect();

        $this->assertSoftDeleted('program_studi', ['kode' => 'TKB']);
    }

    public function test_alat_crud_and_qr(): void
    {
        $admin = $this->adminUser();
        $lab = \App\Models\Laboratorium::firstOrFail();
        $kategori = \App\Models\KategoriAlat::firstOrFail();

        Storage::fake('public');

        $response = $this->actingAs($admin)->post('/dashboard/admin/alat', [
            'nama' => 'Alat Test QR',
            'kode' => 'TEST-QR-001',
            'laboratorium_id' => $lab->id,
            'kategori_id' => $kategori->id,
            'deskripsi' => 'Alat untuk test QR',
            'stok_total' => 2,
            'kondisi' => 'baik',
            'status' => 'tersedia',
            'pelatihan_wajib' => false,
            'spesifikasi' => ['Merk' => 'Test'],
        ]);

        $alat = \App\Models\Alat::where('kode', 'TEST-QR-001')->firstOrFail();
        $response->assertRedirect("/dashboard/admin/alat/{$alat->id}/edit");

        $this->assertNotNull($alat->qr_kode_path);
        $this->assertTrue(Storage::disk('public')->exists($alat->qr_kode_path), 'QR code file should be generated');

        $this->actingAs($admin)
            ->get("/dashboard/admin/alat/{$alat->id}/qr")
            ->assertOk();
    }

    public function test_laboratorium_crud_and_gallery(): void
    {
        $admin = $this->adminUser();
        Storage::fake('public');

        $response = $this->actingAs($admin)->post('/dashboard/admin/laboratorium', [
            'nama' => 'Laboratorium Test',
            'kode' => 'LAB-TEST',
            'lokasi' => 'Gedung X Lantai 1 Ruang 101',
            'gedung' => 'Gedung X',
            'lantai' => '1',
            'ruangan' => '101',
            'kapasitas' => 20,
            'jam_buka' => '08:00',
            'jam_tutup' => '16:00',
            'hari_operasional' => ['Senin', 'Selasa'],
            'email' => 'labtest@che.ui.ac.id',
            'telepon' => '0211234567',
            'status' => 'aktif',
            'deskripsi' => 'Test lab',
        ]);

        $lab = \App\Models\Laboratorium::where('kode', 'LAB-TEST')->firstOrFail();
        $response->assertRedirect("/dashboard/admin/laboratorium/{$lab->id}/edit");

        $this->actingAs($admin)
            ->get("/dashboard/admin/laboratorium/{$lab->id}")
            ->assertOk();

        $this->actingAs($admin)
            ->delete("/dashboard/admin/laboratorium/{$lab->id}")
            ->assertRedirect();

        $this->assertSoftDeleted('laboratorium', ['kode' => 'LAB-TEST']);
    }

    public function test_video_tutorial_crud(): void
    {
        $admin = $this->adminUser();
        $alat = \App\Models\Alat::firstOrFail();

        $this->actingAs($admin)
            ->post('/dashboard/admin/video-tutorial', [
                'judul' => 'Video Test',
                'deskripsi' => 'Deskripsi',
                'jenis' => 'aplikasi',
                'sumber' => 'url_eksternal',
                'url' => 'https://example.com/video.mp4',
                'durasi' => 120,
                'status' => 'aktif',
            ])
            ->assertRedirect('/dashboard/admin/video-tutorial');

        $this->assertDatabaseHas('video_tutorial', ['judul' => 'Video Test', 'jenis' => 'aplikasi']);

        $video = \App\Models\VideoTutorial::where('judul', 'Video Test')->firstOrFail();

        $this->actingAs($admin)
            ->put("/dashboard/admin/video-tutorial/{$video->id}", [
                'judul' => 'Video Test Updated',
                'deskripsi' => 'Deskripsi',
                'jenis' => 'alat',
                'alat_id' => $alat->id,
                'sumber' => 'url_eksternal',
                'url' => 'https://example.com/video.mp4',
                'durasi' => 120,
                'status' => 'aktif',
            ])
            ->assertRedirect('/dashboard/admin/video-tutorial');

        $this->assertDatabaseHas('video_tutorial', ['judul' => 'Video Test Updated', 'jenis' => 'alat']);
    }

    public function test_user_approve_reject(): void
    {
        $admin = $this->adminUser();
        $pending = \App\Models\User::factory()->create([
            'nama_lengkap' => 'Mahasiswa Pending',
            'npm_nip' => '1906000001',
            'email' => 'pending.test@ui.ac.id',
            'status' => 'pending_approval',
            'no_hp' => '08123456789',
            'tanggal_lahir' => '2000-01-01',
            'jenis_kelamin' => 'L',
            'alamat' => 'Jalan Test',
        ]);
        $pending->assignRole('mahasiswa');

        $this->actingAs($admin)
            ->post("/dashboard/admin/users/{$pending->id}/verify")
            ->assertRedirect();

        $pending->refresh();
        $this->assertEquals('approved', $pending->status);

        $rejected = \App\Models\User::factory()->create([
            'nama_lengkap' => 'Mahasiswa Rejected',
            'npm_nip' => '1906000002',
            'email' => 'rejected.test@ui.ac.id',
            'status' => 'pending_approval',
            'no_hp' => '08123456789',
            'tanggal_lahir' => '2000-01-01',
            'jenis_kelamin' => 'L',
            'alamat' => 'Jalan Test',
        ]);
        $rejected->assignRole('mahasiswa');

        $this->actingAs($admin)
            ->post("/dashboard/admin/users/{$rejected->id}/reject", ['rejection_reason' => 'Data tidak lengkap'])
            ->assertRedirect();

        $rejected->refresh();
        $this->assertEquals('rejected', $rejected->status);
    }

    public function test_non_admin_cannot_access_admin_dashboard(): void
    {
        $mahasiswa = User::where('email', '1906285001@ui.ac.id')->firstOrFail();

        $this->actingAs($mahasiswa)
            ->get('/dashboard/admin')
            ->assertRedirect();
    }
}
