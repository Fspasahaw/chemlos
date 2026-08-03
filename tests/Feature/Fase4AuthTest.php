<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\PengaturanSeeder;
use Database\Seeders\ProgramStudiSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Tests\TestCase;

class Fase4AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
        $this->seed(PengaturanSeeder::class);
        $this->seed(ProgramStudiSeeder::class);
    }

    public function test_register_mahasiswa_berhasil_dan_status_pending_email(): void
    {
        $programStudi = \App\Models\ProgramStudi::first();

        Notification::fake();

        $response = $this->postJson('/api/v1/auth/register', [
            'nama_lengkap' => 'Budi Santoso',
            'email' => 'budi.santoso@ui.ac.id',
            'npm_nip' => '2206285099',
            'no_hp' => '081234567890',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
            'peran' => 'mahasiswa',
            'program_studi_id' => $programStudi->id,
            'legal_consent' => '1',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'pending_email');

        $this->assertDatabaseHas('users', [
            'email' => 'budi.santoso@ui.ac.id',
            'npm_nip' => '2206285099',
            'status' => 'pending_email',
        ]);

        $user = User::where('email', 'budi.santoso@ui.ac.id')->first();
        $this->assertTrue($user->hasRole('mahasiswa'));
    }

    public function test_register_dosen_berhasil_dan_status_pending_email(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/v1/auth/register', [
            'nama_lengkap' => 'Drs. Test, M.T.',
            'email' => 'test@che.ui.ac.id',
            'npm_nip' => '1985010120',
            'no_hp' => '081234567890',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
            'peran' => 'dosen',
            'legal_consent' => '1',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'pending_email');

        $this->assertDatabaseHas('users', [
            'email' => 'test@che.ui.ac.id',
            'status' => 'pending_email',
        ]);

        $user = User::where('email', 'test@che.ui.ac.id')->first();
        $this->assertTrue($user->hasRole('dosen'));
    }

    public function test_email_verifikasi_mengubah_status_ke_pending_approval(): void
    {
        $user = User::create([
            'name' => 'Verif User',
            'nama_lengkap' => 'Verif User',
            'email' => 'verif@ui.ac.id',
            'npm_nip' => '2206285010',
            'no_hp' => '081234567890',
            'password' => Hash::make('Password1!'),
            'status' => 'pending_email',
            'email_verified_at' => null,
        ]);
        $user->assignRole('mahasiswa');

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->getEmailForVerification())]
        );

        $this->get($url)
            ->assertRedirect('/login')
            ->assertSessionHas('success');

        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        $this->assertEquals('pending_approval', $user->fresh()->status);
    }

    public function test_login_pending_email_diarahkan_ke_verifikasi_email(): void
    {
        $user = $this->buatUser('mahasiswa', 'pendingemail@ui.ac.id', ['status' => 'pending_email', 'email_verified_at' => null]);

        $response = $this->postJson('/login', [
            'email' => $user->email,
            'password' => 'Password1!',
        ]);

        $response->assertStatus(403);
        $this->assertStringContainsString('/verifikasi-email', $response->getContent());
    }

    public function test_login_pending_approval_diarahkan_ke_menunggu_persetujuan(): void
    {
        $user = $this->buatUser('mahasiswa', 'pendingapproval@ui.ac.id', ['status' => 'pending_approval']);

        $response = $this->postJson('/login', [
            'email' => $user->email,
            'password' => 'Password1!',
        ]);

        $response->assertStatus(403);
        $this->assertStringContainsString('/menunggu-persetujuan', $response->getContent());
    }

    public function test_login_rejected_diarahkan_ke_akun_ditolak(): void
    {
        $user = $this->buatUser('mahasiswa', 'rejected@ui.ac.id', ['status' => 'rejected', 'rejection_reason' => 'Data tidak valid']);

        $response = $this->postJson('/login', [
            'email' => $user->email,
            'password' => 'Password1!',
        ]);

        $response->assertStatus(403);
        $this->assertStringContainsString('/akun-ditolak', $response->getContent());
    }

    public function test_mahasiswa_belum_lengkapi_profil_diarahkan_ke_lengkapi_profil(): void
    {
        $user = $this->buatUser('mahasiswa', 'incomplete@ui.ac.id', [
            'status' => 'approved',
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

    public function test_complete_profile_mengisi_data_mahasiswa(): void
    {
        $user = $this->buatUser('mahasiswa', 'complete@ui.ac.id', [
            'status' => 'approved',
            'no_hp' => null,
            'tanggal_lahir' => null,
            'jenis_kelamin' => null,
            'alamat' => null,
            'angkatan' => null,
            'semester' => null,
            'foto_ktm' => null,
        ]);

        Storage::fake('public');

        $ktmFile = \Illuminate\Http\UploadedFile::fake()->image('ktm.jpg');

        $response = $this->actingAs($user)
            ->postJson('/api/v1/auth/complete-profile', [
                'no_hp' => '081234567890',
                'tanggal_lahir' => '2000-01-01',
                'jenis_kelamin' => 'L',
                'alamat' => 'Jl. Test',
                'angkatan' => 2022,
                'semester' => 4,
                'foto_ktm' => $ktmFile,
            ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.no_hp', '081234567890');

        $this->assertTrue($user->fresh()->isProfileComplete());
    }

    public function test_forgot_password_kirim_link_reset(): void
    {
        $user = $this->buatUser('mahasiswa', 'forgot@ui.ac.id');

        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => $user->email,
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_reset_password_berhasil(): void
    {
        $user = $this->buatUser('mahasiswa', 'reset@ui.ac.id');

        $token = Password::createToken($user);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'PasswordBaru2!',
            'password_confirmation' => 'PasswordBaru2!',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertTrue(Hash::check('PasswordBaru2!', $user->fresh()->password));
    }

    public function test_middleware_role_menolak_akses_laboran_ke_dashboard_admin(): void
    {
        $laboran = $this->buatUser('laboran', 'laboran@chemlos.test');

        $this->actingAs($laboran)
            ->get('/dashboard/admin/users')
            ->assertRedirect('/dashboard');
    }

    public function test_approve_user_oleh_laboran(): void
    {
        $laboran = $this->buatUser('laboran', 'laboran@chemlos.test');
        $user = $this->buatUser('mahasiswa', 'approveme@ui.ac.id', ['status' => 'pending_approval']);

        $this->actingAs($laboran)
            ->post("/dashboard/laboran/verifikasi-akun/{$user->id}/approve")
            ->assertRedirect();

        $this->assertEquals('approved', $user->fresh()->status);
    }

    private function buatUser(string $role, string $email, array $overrides = []): User
    {
        $data = array_merge([
            'name' => 'User ' . ucfirst($role),
            'nama_lengkap' => 'User ' . ucfirst($role),
            'email' => $email,
            'password' => Hash::make('Password1!'),
            'npm_nip' => '22062850' . rand(10, 99) . time() . rand(10, 99),
            'no_hp' => '08123456789' . rand(0, 9),
            'status' => 'approved',
            'email_verified_at' => now(),
            'tanggal_lahir' => '2000-01-01',
            'jenis_kelamin' => 'L',
            'alamat' => 'Jl. Test',
            'angkatan' => 2022,
            'semester' => 4,
            'foto_ktm' => 'ktm/test.jpg',
        ], $overrides);

        $user = User::create($data);
        $user->assignRole($role);

        return $user;
    }
}
