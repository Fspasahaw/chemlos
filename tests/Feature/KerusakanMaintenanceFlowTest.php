<?php

namespace Tests\Feature;

use App\Models\Alat;
use App\Models\KerusakanAlat;
use App\Models\Laboratorium;
use App\Models\LaboratoriumPengelola;
use App\Models\MaintenanceAlat;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class KerusakanMaintenanceFlowTest extends TestCase
{
    use RefreshDatabase;

    protected Laboratorium $lab;
    protected Alat $alat;
    protected User $laboran;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

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

        $this->laboran = User::create([
            'name' => 'Laboran Test',
            'nama_lengkap' => 'Laboran Test',
            'email' => 'laboran@test.com',
            'password' => 'password',
            'npm_nip' => '199001011001001',
            'no_hp' => '081234567890',
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
    }

    public function test_laboran_bisa_laporkan_kerusakan_manual(): void
    {
        $response = $this->actingAs($this->laboran)
            ->post('/dashboard/laboran/kerusakan', [
                'alat_id' => $this->alat->id,
                'jumlah' => 2,
                'kondisi' => 'rusak_ringan',
                'keterangan' => 'Layar retak',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('kerusakan_alat', [
            'alat_id' => $this->alat->id,
            'jumlah' => 2,
            'kondisi' => 'rusak_ringan',
            'status' => 'dilaporkan',
            'stok_sudah_dialihkan' => false,
        ]);

        // Stok belum berubah karena belum maintenance
        $this->alat->refresh();
        $this->assertEquals(5, $this->alat->stok_tersedia);
        $this->assertEquals(0, $this->alat->stok_maintenance);
    }

    public function test_laboran_tidak_bisa_laporkan_kerusakan_melebihi_stok(): void
    {
        $response = $this->actingAs($this->laboran)
            ->post('/dashboard/laboran/kerusakan', [
                'alat_id' => $this->alat->id,
                'jumlah' => 10,
                'kondisi' => 'rusak_ringan',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseMissing('kerusakan_alat', [
            'alat_id' => $this->alat->id,
            'jumlah' => 10,
        ]);
    }

    public function test_laboran_bisa_mendaftarkan_maintenance_dari_kerusakan_ringan(): void
    {
        $kerusakan = KerusakanAlat::create([
            'alat_id' => $this->alat->id,
            'pelapor_id' => $this->laboran->id,
            'jumlah' => 2,
            'kondisi' => 'rusak_ringan',
            'keterangan' => 'Layar retak',
            'tanggal_dilaporkan' => now()->toDateString(),
            'status' => 'dilaporkan',
            'stok_sudah_dialihkan' => false,
        ]);

        $response = $this->actingAs($this->laboran)
            ->post('/dashboard/laboran/maintenance', [
                'alat_id' => $this->alat->id,
                'jumlah' => 2,
                'keterangan' => 'Servis',
                'tanggal_mulai' => now()->toDateString(),
                'kerusakan_id' => $kerusakan->id,
            ]);

        $response->assertRedirect();

        $this->alat->refresh();
        $this->assertEquals(3, $this->alat->stok_tersedia);
        $this->assertEquals(2, $this->alat->stok_maintenance);

        $this->assertDatabaseHas('maintenance_alat', [
            'alat_id' => $this->alat->id,
            'jumlah' => 2,
            'status' => 'dijadwalkan',
        ]);

        $kerusakan->refresh();
        $this->assertEquals('maintenance', $kerusakan->status);
        $this->assertTrue($kerusakan->stok_sudah_dialihkan);
    }

    public function test_maintenance_selesai_rusak_ringan_mengembalikan_stok(): void
    {
        $kerusakan = KerusakanAlat::create([
            'alat_id' => $this->alat->id,
            'pelapor_id' => $this->laboran->id,
            'jumlah' => 2,
            'kondisi' => 'rusak_ringan',
            'tanggal_dilaporkan' => now()->toDateString(),
            'status' => 'maintenance',
            'stok_sudah_dialihkan' => true,
        ]);

        $maintenance = MaintenanceAlat::create([
            'alat_id' => $this->alat->id,
            'laboratorium_id' => $this->lab->id,
            'laboran_id' => $this->laboran->id,
            'kerusakan_id' => $kerusakan->id,
            'jumlah' => 2,
            'keterangan' => 'Servis',
            'tanggal_mulai' => now()->toDateString(),
            'status' => 'dijadwalkan',
        ]);

        // Set stok seolah sudah pindah ke maintenance
        $this->alat->stok_maintenance = 2;
        $this->alat->stok_tersedia = 3;
        $this->alat->save();

        $response = $this->actingAs($this->laboran)
            ->post("/dashboard/laboran/maintenance/{$maintenance->id}/complete");

        $response->assertRedirect();

        $this->alat->refresh();
        $this->assertEquals(0, $this->alat->stok_maintenance);
        $this->assertEquals(5, $this->alat->stok_tersedia);
        $this->assertEquals(5, $this->alat->stok_total);

        $maintenance->refresh();
        $this->assertEquals('selesai', $maintenance->status);
    }

    public function test_maintenance_selesai_rusak_berat_menghapus_stok_total(): void
    {
        $kerusakan = KerusakanAlat::create([
            'alat_id' => $this->alat->id,
            'pelapor_id' => $this->laboran->id,
            'jumlah' => 2,
            'kondisi' => 'rusak_berat',
            'tanggal_dilaporkan' => now()->toDateString(),
            'status' => 'maintenance',
            'stok_sudah_dialihkan' => true,
        ]);

        $maintenance = MaintenanceAlat::create([
            'alat_id' => $this->alat->id,
            'laboratorium_id' => $this->lab->id,
            'laboran_id' => $this->laboran->id,
            'kerusakan_id' => $kerusakan->id,
            'jumlah' => 2,
            'keterangan' => 'Servis',
            'tanggal_mulai' => now()->toDateString(),
            'status' => 'dijadwalkan',
        ]);

        $this->alat->stok_maintenance = 2;
        $this->alat->stok_tersedia = 3;
        $this->alat->save();

        $this->actingAs($this->laboran)
            ->post("/dashboard/laboran/maintenance/{$maintenance->id}/complete");

        $this->alat->refresh();
        $this->assertEquals(0, $this->alat->stok_maintenance);
        $this->assertEquals(3, $this->alat->stok_tersedia);
        $this->assertEquals(3, $this->alat->stok_total);
    }

    public function test_laboran_bisa_batalkan_maintenance_dan_kembalikan_stok(): void
    {
        $maintenance = MaintenanceAlat::create([
            'alat_id' => $this->alat->id,
            'laboratorium_id' => $this->lab->id,
            'laboran_id' => $this->laboran->id,
            'jumlah' => 2,
            'keterangan' => 'Servis',
            'tanggal_mulai' => now()->toDateString(),
            'status' => 'dijadwalkan',
        ]);

        $this->alat->stok_maintenance = 2;
        $this->alat->stok_tersedia = 3;
        $this->alat->save();

        $this->actingAs($this->laboran)
            ->post("/dashboard/laboran/maintenance/{$maintenance->id}/cancel");

        $this->alat->refresh();
        $this->assertEquals(0, $this->alat->stok_maintenance);
        $this->assertEquals(5, $this->alat->stok_tersedia);

        $maintenance->refresh();
        $this->assertEquals('dibatalkan', $maintenance->status);
    }

    public function test_laboran_bisa_upload_foto_kerusakan(): void
    {
        $file = UploadedFile::fake()->image('rusak.jpg');

        $response = $this->actingAs($this->laboran)
            ->post('/dashboard/laboran/kerusakan', [
                'alat_id' => $this->alat->id,
                'jumlah' => 1,
                'kondisi' => 'rusak_ringan',
                'foto' => $file,
            ]);

        $response->assertRedirect();

        $kerusakan = KerusakanAlat::first();
        $this->assertNotNull($kerusakan?->foto);
        $this->assertTrue(Storage::disk('public')->exists($kerusakan->foto), 'Foto kerusakan tidak ditemukan di storage.');
    }

    public function test_laboran_bisa_edit_kerusakan_sebelum_maintenance(): void
    {
        $kerusakan = KerusakanAlat::create([
            'alat_id' => $this->alat->id,
            'pelapor_id' => $this->laboran->id,
            'jumlah' => 1,
            'kondisi' => 'rusak_ringan',
            'tanggal_dilaporkan' => now()->toDateString(),
            'status' => 'dilaporkan',
            'stok_sudah_dialihkan' => false,
        ]);

        $response = $this->actingAs($this->laboran)
            ->put("/dashboard/laboran/kerusakan/{$kerusakan->id}", [
                'alat_id' => $this->alat->id,
                'jumlah' => 2,
                'kondisi' => 'rusak_berat',
                'keterangan' => 'Catatan diperbarui',
            ]);

        $response->assertRedirect();

        $kerusakan->refresh();
        $this->assertEquals(2, $kerusakan->jumlah);
        $this->assertEquals('rusak_berat', $kerusakan->kondisi);
        $this->assertEquals('Catatan diperbarui', $kerusakan->keterangan);
    }

    public function test_laboran_bisa_edit_maintenance_dijadwalkan(): void
    {
        $maintenance = MaintenanceAlat::create([
            'alat_id' => $this->alat->id,
            'laboratorium_id' => $this->lab->id,
            'laboran_id' => $this->laboran->id,
            'jumlah' => 2,
            'keterangan' => 'Servis',
            'tanggal_mulai' => now()->toDateString(),
            'status' => 'dijadwalkan',
        ]);

        $response = $this->actingAs($this->laboran)
            ->put("/dashboard/laboran/maintenance/{$maintenance->id}", [
                'keterangan' => 'Servis lengkap',
                'tanggal_mulai' => now()->toDateString(),
                'tanggal_selesai' => now()->addDays(2)->toDateString(),
                'teknisi' => 'Teknisi A',
                'biaya' => 150000,
            ]);

        $response->assertRedirect();

        $maintenance->refresh();
        $this->assertEquals('Servis lengkap', $maintenance->keterangan);
        $this->assertEquals('Teknisi A', $maintenance->teknisi);
        $this->assertEquals(150000, $maintenance->biaya);
    }

    public function test_kepala_lab_buka_halaman_kerusakan_dan_maintenance(): void
    {
        $kepalaLab = User::create([
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
        $kepalaLab->assignRole('kepala_lab');

        LaboratoriumPengelola::create([
            'laboratorium_id' => $this->lab->id,
            'user_id' => $kepalaLab->id,
            'peran' => 'kepala_lab',
            'is_primary' => true,
        ]);

        $response = $this->actingAs($kepalaLab)
            ->get('/dashboard/kepala-lab/kerusakan');
        $response->assertOk();

        $response2 = $this->actingAs($kepalaLab)
            ->get('/dashboard/kepala-lab/maintenance');
        $response2->assertOk();
    }

    public function test_kepala_lab_bisa_update_status_kerusakan(): void
    {
        $kepalaLab = User::create([
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
        $kepalaLab->assignRole('kepala_lab');

        LaboratoriumPengelola::create([
            'laboratorium_id' => $this->lab->id,
            'user_id' => $kepalaLab->id,
            'peran' => 'kepala_lab',
            'is_primary' => true,
        ]);

        $kerusakan = KerusakanAlat::create([
            'alat_id' => $this->alat->id,
            'pelapor_id' => $this->laboran->id,
            'jumlah' => 1,
            'kondisi' => 'rusak_ringan',
            'tanggal_dilaporkan' => now()->toDateString(),
            'status' => 'dilaporkan',
            'stok_sudah_dialihkan' => false,
        ]);

        $response = $this->actingAs($kepalaLab)
            ->post("/dashboard/kepala-lab/kerusakan/{$kerusakan->id}/status", [
                'status' => 'dicek',
                'keterangan' => 'Sedang diperiksa',
            ]);

        $response->assertRedirect();

        $kerusakan->refresh();
        $this->assertEquals('dicek', $kerusakan->status);
        $this->assertEquals('Sedang diperiksa', $kerusakan->keterangan);
    }

    public function test_kepala_lab_tidak_bisa_laporkan_edit_hapus_kerusakan(): void
    {
        $kepalaLab = User::create([
            'name' => 'Kepala Lab Test',
            'nama_lengkap' => 'Kepala Lab Test',
            'email' => 'kepala-lab2@test.com',
            'password' => 'password',
            'npm_nip' => '199001011001003',
            'no_hp' => '081234567892',
            'status' => 'approved',
            'email_verified_at' => now(),
            'tanggal_lahir' => '1985-01-01',
            'jenis_kelamin' => 'L',
            'alamat' => 'Jl. Test',
        ]);
        $kepalaLab->assignRole('kepala_lab');

        LaboratoriumPengelola::create([
            'laboratorium_id' => $this->lab->id,
            'user_id' => $kepalaLab->id,
            'peran' => 'kepala_lab',
            'is_primary' => true,
        ]);

        $kerusakan = KerusakanAlat::create([
            'alat_id' => $this->alat->id,
            'pelapor_id' => $this->laboran->id,
            'jumlah' => 1,
            'kondisi' => 'rusak_ringan',
            'tanggal_dilaporkan' => now()->toDateString(),
            'status' => 'dilaporkan',
            'stok_sudah_dialihkan' => false,
        ]);

        $this->actingAs($kepalaLab)
            ->post('/dashboard/kepala-lab/kerusakan', [
                'alat_id' => $this->alat->id,
                'jumlah' => 1,
                'kondisi' => 'rusak_ringan',
            ])
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->actingAs($kepalaLab)
            ->put("/dashboard/kepala-lab/kerusakan/{$kerusakan->id}", [
                'alat_id' => $this->alat->id,
                'jumlah' => 2,
                'kondisi' => 'rusak_ringan',
            ])
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->actingAs($kepalaLab)
            ->delete("/dashboard/kepala-lab/kerusakan/{$kerusakan->id}")
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseHas('kerusakan_alat', ['id' => $kerusakan->id, 'jumlah' => 1]);
    }
}
