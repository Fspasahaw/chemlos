<?php

namespace Tests\Feature;

use Database\Seeders\PengaturanSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicPageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
        $this->seed(PengaturanSeeder::class);
    }

    public function test_halaman_publik_bisa_diakses_tanpa_login(): void
    {
        $halaman = [
            '/',
            '/laboratorium',
            '/alat',
            '/tutorial',
            '/tentang',
            '/faq',
            '/kontak',
            '/syarat-ketentuan',
            '/kebijakan-privasi',
            '/login',
            '/daftar',
            '/lupa-password',
        ];

        foreach ($halaman as $path) {
            $response = $this->get($path);
            $this->assertTrue($response->isOk(), "Halaman {$path} gagal diakses.");
        }
    }
}
