<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\PengaturanSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
        $this->seed(PengaturanSeeder::class);
    }

    private function buatUser(string $role, string $email): User
    {
        $data = [
            'name' => 'User ' . ucfirst($role),
            'nama_lengkap' => 'User ' . ucfirst($role),
            'email' => $email,
            'password' => Hash::make('Password1!'),
            'npm_nip' => '22062850' . rand(10, 99),
            'no_hp' => '08123456789' . rand(0, 9),
            'status' => 'approved',
            'email_verified_at' => now(),
            'tanggal_lahir' => '2000-01-01',
            'jenis_kelamin' => 'L',
            'alamat' => 'Jl. Test',
        ];

        if ($role === 'mahasiswa') {
            $data['angkatan'] = 2022;
            $data['semester'] = 4;
            $data['foto_ktm'] = 'ktm/test.jpg';
        }

        $user = User::create($data);
        $user->assignRole($role);

        return $user;
    }

    public function test_login_berhasil_dan_pengguna_diarahkan_ke_dashboard_sesuai_peran(): void
    {
        $admin = $this->buatUser('admin', 'admin@test.com');

        $response = $this->post('/login', [
            'email' => $admin->email,
            'password' => 'Password1!',
        ]);

        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.redirect', '/dashboard/admin');
    }

    public function test_login_gagal_dengan_kredensial_salah(): void
    {
        $response = $this->post('/login', [
            'email' => 'tidak-ada@test.com',
            'password' => 'salah',
        ]);


        $response->assertSessionHasErrors('email');
    }

    public function test_mahasiswa_tidak_bisa_akses_dashboard_admin(): void
    {
        $mahasiswa = $this->buatUser('mahasiswa', 'mahasiswa@test.com');

        $this->actingAs($mahasiswa)
            ->get('/dashboard/admin/users')
            ->assertRedirect('/dashboard');
    }

    public function test_admin_bisa_akses_dashboard_admin(): void
    {
        $admin = $this->buatUser('admin', 'admin@test.com');

        $this->actingAs($admin)
            ->get('/dashboard/admin/users')
            ->assertStatus(200);
    }

    public function test_pengguna_belum_disetujui_tidak_bisa_akses_dashboard(): void
    {
        $user = $this->buatUser('mahasiswa', 'pending@test.com');
        $user->update(['status' => 'pending_approval']);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertRedirect('/menunggu-persetujuan');
    }

    public function test_logout_berhasil(): void
    {
        $admin = $this->buatUser('admin', 'admin@test.com');

        $this->actingAs($admin)
            ->post('/logout')
            ->assertRedirect('/login');
    }

    public function test_pengguna_bisa_memperbarui_profil_dan_name_tersinkron(): void
    {
        $user = $this->buatUser('mahasiswa', 'mahasiswa@test.com');

        $response = $this->actingAs($user)
            ->putJson('/api/v1/auth/me', [
                'nama_lengkap' => 'Nama Baru',
                'no_hp' => '081234567890',
                'tanggal_lahir' => '2000-01-01',
                'jenis_kelamin' => 'L',
                'alamat' => 'Jl. Baru',
            ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.nama_lengkap', 'Nama Baru')
            ->assertJsonPath('data.name', 'Nama Baru')
            ->assertJsonPath('data.status_label', 'Aktif');
    }

    public function test_pengguna_bisa_mengganti_password(): void
    {
        $user = $this->buatUser('mahasiswa', 'mahasiswa2@test.com');

        $response = $this->actingAs($user)
            ->postJson('/api/v1/auth/change-password', [
                'current_password' => 'Password1!',
                'password' => 'PasswordBaru2!',
                'password_confirmation' => 'PasswordBaru2!',
            ]);

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertTrue(Hash::check('PasswordBaru2!', $user->fresh()->password));
    }
}
