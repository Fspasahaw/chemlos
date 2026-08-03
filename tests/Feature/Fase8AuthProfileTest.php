<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class Fase8AuthProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Http::fake(['*' => Http::response('fake-image-data', 200)]);
        $this->seed(DatabaseSeeder::class);
    }

    public function test_public_auth_pages_render(): void
    {
        $pages = [
            '/daftar' => 'Auth/Daftar',
            '/login' => 'Auth/Login',
            '/verifikasi-email' => 'Auth/VerifikasiEmail',
            '/lupa-password' => 'Auth/LupaPassword',
            '/akun-tidak-aktif' => 'Auth/AkunTidakAktif',
        ];

        foreach ($pages as $url => $component) {
            $response = $this->get($url);
            $this->assertTrue($response->getStatusCode() === 200, "Halaman auth {$url} harus render, got " . $response->getStatusCode() . " redirect to " . $response->headers->get('Location'));
            $this->assertStringContainsString('"component":"' . str_replace('/', '\\/', $component) . '"', $response->getContent());
        }
    }

    public function test_lengkapi_profil_page_renders_for_authenticated_user(): void
    {
        $user = User::where('email', '1906285001@ui.ac.id')->first();
        $this->assertNotNull($user);

        $response = $this->actingAs($user)->get('/lengkapi-profil');
        $response->assertStatus(200);
        $this->assertStringContainsString('"component":"Auth\\/LengkapiProfil"', $response->getContent());
    }

    public function test_lengkapi_profil_redirects_to_login_when_guest(): void
    {
        $this->get('/lengkapi-profil')->assertRedirect('/login');
    }

    public function test_login_redirects_to_role_dashboard_when_approved(): void
    {
        $user = User::where('email', 'admin@che.ui.ac.id')->first();
        $this->assertNotNull($user);

        $response = $this->postJson('/login', [
            'email' => $user->email,
            'password' => 'Admin@12345',
        ]);

        $response->assertOk();
        $this->assertStringContainsString('success', $response->getContent());
        $this->assertStringContainsString('dashboard', $response->getContent());
    }

    public function test_profile_page_requires_login(): void
    {
        $this->get('/profil')->assertRedirect('/login');
    }

    public function test_profile_page_renders_for_authenticated_user(): void
    {
        $user = User::where('email', '1906285001@ui.ac.id')->first();
        $this->assertNotNull($user);

        $response = $this->actingAs($user)->get('/profil');
        $response->assertStatus(200);
        $this->assertStringContainsString('Profile', $response->getContent());
    }

    public function test_complete_profile_page_renders_for_incomplete_mahasiswa(): void
    {
        $user = User::where('email', '1906285001@ui.ac.id')->first();
        $user->update([
            'no_hp' => null,
            'tanggal_lahir' => null,
            'jenis_kelamin' => null,
            'alamat' => null,
            'angkatan' => null,
            'semester' => null,
            'foto_ktm' => null,
        ]);

        $this->actingAs($user)
            ->get('/dashboard/mahasiswa')
            ->assertRedirect('/lengkapi-profil');
    }
}
