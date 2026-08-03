<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class Fase14LaporanTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Http::fake([
            '*' => Http::response('fake-image-data', 200),
        ]);

        $this->seed(DatabaseSeeder::class);
    }

    public function test_admin_bisa_akses_laporan(): void
    {
        $admin = User::role('admin')->first();

        $response = $this->actingAs($admin)->get('/dashboard/admin/laporan?jenis=pengguna');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('items.data')
            ->has('columns')
            ->has('filterOptions'));
    }

    public function test_admin_bisa_export_excel_laporan(): void
    {
        $admin = User::role('admin')->first();

        $response = $this->actingAs($admin)->get('/dashboard/admin/laporan/export?jenis=peminjaman');

        $response->assertStatus(200);
        $this->assertStringContainsString('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', $response->headers->get('Content-Type'));
    }

    public function test_admin_bisa_export_pdf_laporan(): void
    {
        $admin = User::role('admin')->first();

        $response = $this->actingAs($admin)->get('/dashboard/admin/laporan/export-pdf?jenis=alat');

        $response->assertStatus(200);
        $this->assertStringContainsString('application/pdf', $response->headers->get('Content-Type'));
    }

    public function test_admin_bisa_akses_audit_log(): void
    {
        $admin = User::role('admin')->first();

        $response = $this->actingAs($admin)->get('/dashboard/admin/audit-log');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('items.data')
            ->has('columns'));
    }

    public function test_admin_bisa_akses_backup(): void
    {
        $admin = User::role('admin')->first();

        $response = $this->actingAs($admin)->get('/dashboard/admin/backup');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('files'));
    }

    public function test_pimpinan_bisa_akses_laporan(): void
    {
        $pimpinan = User::role('pimpinan')->first();

        $response = $this->actingAs($pimpinan)->get('/dashboard/pimpinan/laporan?jenis=aktivitas');

        $response->assertOk();
    }

    public function test_laboran_bisa_akses_laporan_miliknya(): void
    {
        $laboran = User::role('laboran')->first();

        $response = $this->actingAs($laboran)->get('/dashboard/laboran/laporan?jenis=peminjaman');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('items.data'));
    }

    public function test_mahasiswa_bisa_akses_laporan_sendiri(): void
    {
        $mahasiswa = User::role('mahasiswa')->first();

        $response = $this->actingAs($mahasiswa)->get('/dashboard/mahasiswa/laporan');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('items'));
    }

    public function test_send_reminders_command_bisa_dijalankan(): void
    {
        $this->artisan('chemlos:send-reminders')
            ->assertSuccessful();
    }

    public function test_backup_command_bisa_dijalankan(): void
    {
        $this->artisan('chemlos:backup-database')
            ->assertFailed();
    }
}
