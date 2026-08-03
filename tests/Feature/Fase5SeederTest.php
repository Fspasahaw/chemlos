<?php

namespace Tests\Feature;

use App\Models\Alat;
use App\Models\Peminjaman;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class Fase5SeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_produces_connected_demo_data(): void
    {
        // Fake external image services and storage so seeding does not depend on internet
        // and does not leave invalid files in public disk.
        Http::fake([
            '*' => Http::response('fake-image-data', 200),
        ]);
        Storage::fake('public');

        $this->seed(DatabaseSeeder::class);

        // Data counts
        $this->assertGreaterThanOrEqual(5, User::count(), 'User demo tidak cukup');
        $this->assertGreaterThanOrEqual(4, \App\Models\ProgramStudi::count(), 'Program studi demo tidak cukup');
        $this->assertGreaterThanOrEqual(5, \App\Models\Laboratorium::count(), 'Laboratorium demo tidak cukup');
        $this->assertGreaterThanOrEqual(6, \App\Models\KategoriAlat::count(), 'Kategori alat demo tidak cukup');
        $this->assertGreaterThanOrEqual(20, Alat::count(), 'Alat demo tidak cukup');
        $this->assertGreaterThanOrEqual(5, Peminjaman::count(), 'Peminjaman demo tidak cukup');

        // Demo accounts for all roles
        foreach (['admin', 'pimpinan', 'kepala_lab', 'laboran', 'dosen', 'mahasiswa'] as $role) {
            $user = User::role($role)->first();
            $this->assertNotNull($user, "Akun demo peran {$role} tidak ditemukan");
        }

        // Stock consistency
        foreach (Alat::cursor() as $alat) {
            $expected = $alat->stok_tersedia + $alat->stok_reserved + $alat->stok_dipinjam + $alat->stok_maintenance;
            $this->assertEquals($expected, $alat->stok_total, "Stok alat {$alat->kode} tidak konsisten");
        }

        // Peminjaman connectivity
        foreach (Peminjaman::cursor() as $p) {
            $this->assertTrue($p->user()->exists(), 'Peminjaman tidak memiliki user');
            $this->assertTrue($p->details()->exists(), 'Peminjaman tidak memiliki detail');
            $this->assertTrue($p->laboratorium()->exists(), 'Peminjaman tidak memiliki laboratorium');
        }
    }
}
