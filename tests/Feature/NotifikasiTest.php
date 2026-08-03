<?php

namespace Tests\Feature;


use App\Models\Notifikasi;
use App\Models\User;
use Database\Seeders\PengaturanSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class NotifikasiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
        $this->seed(PengaturanSeeder::class);
    }

    private function buatUser(string $email): User
    {
        $user = User::create([
            'name' => 'User Test',
            'nama_lengkap' => 'User Test',
            'email' => $email,
            'password' => Hash::make('Password1!'),
            'npm_nip' => '22062850' . rand(10, 99),
            'no_hp' => '08123456789' . rand(0, 9),
            'status' => 'approved',
            'email_verified_at' => now(),
            'tanggal_lahir' => '2000-01-01',
            'jenis_kelamin' => 'L',
            'alamat' => 'Jl. Test',
        ]);
        $user->assignRole('dosen');

        return $user;
    }

    public function test_pengguna_bisa_melihat_halaman_notifikasi(): void
    {
        $user = $this->buatUser('dosen@example.com');

        $response = $this->actingAs($user)->get('/notifikasi');

        $response->assertOk();
    }

    public function test_api_notifikasi_mengembalikan_data_dan_unread_count(): void
    {
        $user = $this->buatUser('dosen@example.com');
        Notifikasi::create([
            'user_id' => $user->id,
            'judul' => 'Test',
            'pesan' => 'Pesan test',
            'kategori' => 'umum',
        ]);

        $response = $this->actingAs($user)->getJson('/api/v1/notifikasi?per_page=5');

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('unread_count', 1);
        $response->assertJsonCount(1, 'data.data');
    }

    public function test_notifikasi_bisa_ditandai_dibaca(): void
    {
        $user = $this->buatUser('dosen@example.com');
        $notif = Notifikasi::create([
            'user_id' => $user->id,
            'judul' => 'Test',
            'pesan' => 'Pesan test',
            'kategori' => 'umum',
        ]);

        $response = $this->actingAs($user)->post("/notifikasi/{$notif->id}/read");

        $response->assertRedirect();
        $this->assertNotNull($notif->fresh()->dibaca_pada);
    }

    public function test_tandai_semua_notifikasi_dibaca(): void
    {
        $user = $this->buatUser('dosen@example.com');
        Notifikasi::create(['user_id' => $user->id, 'judul' => 'A', 'pesan' => 'A', 'kategori' => 'umum']);
        Notifikasi::create(['user_id' => $user->id, 'judul' => 'B', 'pesan' => 'B', 'kategori' => 'umum']);

        $response = $this->actingAs($user)->post('/notifikasi/read-all');

        $response->assertRedirect();
        $this->assertEquals(0, Notifikasi::byUser($user->id)->unread()->count());
    }

    public function test_pengguna_tidak_bisa_menandai_notifikasi_orang_lain(): void
    {
        $userA = $this->buatUser('a@example.com');
        $userB = $this->buatUser('b@example.com');
        $notif = Notifikasi::create([
            'user_id' => $userA->id,
            'judul' => 'Rahasia',
            'pesan' => 'Pesan rahasia',
            'kategori' => 'umum',
        ]);

        $response = $this->actingAs($userB)->post("/notifikasi/{$notif->id}/read");

        $response->assertForbidden();
        $this->assertNull($notif->fresh()->dibaca_pada);
    }

    public function test_filter_status_unread_berfungsi(): void
    {
        $user = $this->buatUser('dosen@example.com');
        Notifikasi::create(['user_id' => $user->id, 'judul' => 'Unread', 'pesan' => 'A', 'kategori' => 'umum', 'dibaca_pada' => null]);
        Notifikasi::create(['user_id' => $user->id, 'judul' => 'Read', 'pesan' => 'B', 'kategori' => 'umum', 'dibaca_pada' => now()]);

        $response = $this->actingAs($user)->getJson('/api/v1/notifikasi?status=unread');

        $response->assertJsonCount(1, 'data.data');
        $response->assertJsonPath('data.data.0.judul', 'Unread');
    }
}
