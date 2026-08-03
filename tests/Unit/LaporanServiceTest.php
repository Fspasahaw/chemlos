<?php

namespace Tests\Unit;

use App\Models\Alat;
use App\Models\Laboratorium;
use App\Models\MaintenanceAlat;
use App\Models\Peminjaman;
use App\Models\Pengembalian;
use App\Services\LaporanService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LaporanServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_allowed_jenis_role_based(): void
    {
        $this->assertEquals(
            ['pengguna', 'laboratorium', 'alat', 'kerusakan', 'maintenance', 'peminjaman', 'pengembalian', 'aktivitas'],
            LaporanService::allowedJenis('admin')
        );

        $this->assertEquals(
            ['laboratorium', 'alat', 'kerusakan', 'maintenance', 'peminjaman', 'pengembalian'],
            LaporanService::allowedJenis('kepala_lab')
        );

        $this->assertEquals(['peminjaman'], LaporanService::allowedJenis('mahasiswa'));
    }

    public function test_row_laboratorium_includes_pengelola_names(): void
    {
        $lab = new Laboratorium([
            'kode' => 'LAB01',
            'nama' => 'Lab A',
            'lokasi' => 'Gedung A',
            'kapasitas' => 30,
            'status' => 'aktif',
        ]);
        $lab->alats_count = 5;

        $pengelola = collect([
            (object) ['peran' => 'kepala_lab', 'user' => (object) ['nama_lengkap' => 'Kepala Satu']],
            (object) ['peran' => 'laboran', 'user' => (object) ['nama_lengkap' => 'Laboran Dua']],
        ]);
        $lab->setRelation('pengelola', $pengelola);

        $row = LaporanService::row('laboratorium', $lab);

        $this->assertEquals('Kepala Satu', $row['kepala_lab']);
        $this->assertEquals('Laboran Dua', $row['laboran']);
        $this->assertEquals(5, $row['jumlah_alat']);
    }

    public function test_row_alat_includes_separate_stok_fields(): void
    {
        $alat = new Alat([
            'kode' => 'ALT01',
            'nama' => 'Alat A',
            'stok_total' => 10,
            'stok_tersedia' => 5,
            'stok_dipinjam' => 3,
            'stok_maintenance' => 2,
            'kondisi' => 'baik',
            'status' => 'tersedia',
        ]);
        $alat->setRelation('laboratorium', (object) ['nama' => 'Lab A']);
        $alat->setRelation('kategoriAlat', (object) ['nama' => 'Kategori A']);

        $row = LaporanService::row('alat', $alat);

        $this->assertEquals(10, $row['stok_total']);
        $this->assertEquals(5, $row['stok_tersedia']);
        $this->assertEquals(3, $row['stok_dipinjam']);
        $this->assertEquals(2, $row['stok_maintenance']);
    }

    public function test_row_maintenance_uses_teknisi_column(): void
    {
        $maintenance = new MaintenanceAlat([
            'jumlah' => 2,
            'teknisi' => 'Teknisi A',
            'tanggal_mulai' => '2026-07-20',
            'tanggal_selesai' => '2026-07-25',
            'biaya' => 150000,
            'status' => 'selesai',
        ]);
        $maintenance->setRelation('alat', (object) ['kode' => 'ALT01', 'nama' => 'Alat A']);
        $maintenance->setRelation('laboratorium', (object) ['nama' => 'Lab A']);
        $maintenance->setRelation('laboran', (object) ['nama_lengkap' => 'Laboran A']);

        $row = LaporanService::row('maintenance', $maintenance);

        $this->assertEquals('Teknisi A', $row['teknisi']);
    }

    public function test_row_peminjaman_includes_dosen_alat_denda(): void
    {
        $peminjaman = new Peminjaman([
            'kode' => 'PMJ01',
            'tanggal_mulai' => '2026-07-20',
            'tanggal_selesai' => '2026-07-22',
            'status' => 'berlangsung',
        ]);
        $peminjaman->setRelation('user', (object) ['nama_lengkap' => 'User A']);
        $peminjaman->setRelation('laboratorium', (object) ['nama' => 'Lab A']);
        $peminjaman->setRelation('dosenPembimbing', (object) ['nama_lengkap' => 'Dosen A']);
        $peminjaman->setRelation('pengembalian', (object) ['total_denda' => 50000]);

        $details = collect([
            (object) ['jumlah' => 2, 'alat' => (object) ['nama' => 'Alat A']],
            (object) ['jumlah' => 1, 'alat' => (object) ['nama' => 'Alat B']],
        ]);
        $peminjaman->setRelation('details', $details);

        $row = LaporanService::row('peminjaman', $peminjaman);

        $this->assertEquals('Dosen A', $row['dosen']);
        $this->assertStringContainsString('Alat A', $row['alat']);
        $this->assertStringContainsString('Alat B', $row['alat']);
        $this->assertEquals('2026-07-20 s/d 2026-07-22', $row['periode']);
        $this->assertEquals('Rp 50.000', $row['denda']);
    }

    public function test_row_pengembalian_includes_alat_and_kondisi(): void
    {
        $pengembalian = new Pengembalian([
            'waktu_pengembalian' => '2026-07-22 10:00:00',
            'total_denda' => 75000,
        ]);

        $details = collect([
            (object) ['kondisi_pengembalian' => 'baik', 'alat' => (object) ['nama' => 'Alat A']],
            (object) ['kondisi_pengembalian' => 'rusak_ringan', 'alat' => (object) ['nama' => 'Alat B']],
        ]);

        $peminjaman = new Peminjaman(['kode' => 'PMJ01']);
        $peminjaman->setRelation('user', (object) ['nama_lengkap' => 'User A']);
        $peminjaman->setRelation('laboratorium', (object) ['nama' => 'Lab A']);
        $peminjaman->setRelation('details', $details);

        $pengembalian->setRelation('peminjaman', $peminjaman);

        $row = LaporanService::row('pengembalian', $pengembalian);

        $this->assertStringContainsString('Alat A', $row['alat']);
        $this->assertStringContainsString('Alat B', $row['alat']);
        $this->assertStringContainsString('baik', $row['kondisi']);
        $this->assertStringContainsString('rusak_ringan', $row['kondisi']);
        $this->assertEquals('2026-07-22 10:00', $row['tanggal_kembali']);
        $this->assertEquals('Rp 75.000', $row['denda']);
    }
}
