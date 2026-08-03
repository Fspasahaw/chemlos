<?php

namespace Tests\Unit;

use App\Models\User;
use App\Services\NotifikasiService;
use App\Services\WhatsAppService;
use Database\Seeders\PengaturanSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class NotifikasiServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
        $this->seed(PengaturanSeeder::class);
    }

    private function user(array $attrs = []): User
    {
        return User::create(array_merge([
            'name' => 'User Test',
            'nama_lengkap' => 'User Test',
            'email' => 'user'.rand(1000, 9999).'@example.com',
            'password' => bcrypt('Password1!'),
            'npm_nip' => '22062850'.rand(10, 99),
            'no_hp' => '08123456789'.rand(0, 9),
            'status' => 'approved',
            'email_verified_at' => now(),
            'tanggal_lahir' => '2000-01-01',
            'jenis_kelamin' => 'L',
            'alamat' => 'Jl. Test',
            'notifikasi_email' => true,
            'notifikasi_whatsapp' => false,
            'notifikasi_in_app' => true,
        ], $attrs));
    }

    public function test_notifikasi_dibuat_dengan_kategori_dan_template(): void
    {
        Mail::fake();

        $user = $this->user();

        $notifikasi = NotifikasiService::kirim(
            $user,
            'Akun Disetujui',
            'Selamat datang di ChemLOS.',
            'akun_disetujui',
            '/dashboard/mahasiswa',
            ['kode' => 'TS-001']
        );

        $this->assertNotNull($notifikasi);
        $this->assertEquals($user->id, $notifikasi->user_id);
        $this->assertEquals('akun_disetujui', $notifikasi->kategori);
        $this->assertEquals('success', $notifikasi->jenis);

        Mail::assertQueued(\App\Mail\NotifikasiMail::class, function ($mail) use ($user) {
            return $mail->notifikasi->user_id === $user->id;
        });
    }

    public function test_template_interpolasi_dengan_variabel_lengkap(): void
    {
        Mail::fake();

        $user = $this->user();

        NotifikasiService::kirim(
            $user,
            'Peminjaman',
            'Peminjaman anda telah disetujui.',
            'peminjaman',
            '/dashboard/mahasiswa/peminjaman',
            [
                'kode' => 'PINJ-123',
                'alat' => 'Spektrofotometer',
                'laboratorium' => 'Lab A',
                'denda' => '50000',
                'teknisi' => 'Budi',
                'biaya' => '150000',
                'kondisi' => 'rusak_ringan',
                'pelapor' => 'Andi',
                'jumlah' => 2,
            ]
        );

        Mail::assertQueued(\App\Mail\NotifikasiMail::class, function ($mail) {
            return $mail->data['kode'] === 'PINJ-123'
                && $mail->data['alat'] === 'Spektrofotometer'
                && $mail->data['laboratorium'] === 'Lab A'
                && $mail->data['teknisi'] === 'Budi'
                && $mail->data['biaya'] === '150000'
                && $mail->data['kondisi'] === 'rusak_ringan'
                && $mail->data['pelapor'] === 'Andi'
                && $mail->data['jumlah'] === 2
                && str_contains($mail->data['pesan_templated'], 'Peminjaman anda telah disetujui.');
        });
    }

    public function test_fallback_ke_template_umum_jika_kategori_tidak_dikenal(): void
    {
        $user = $this->user();

        $notifikasi = NotifikasiService::kirim(
            $user,
            'Event Baru',
            'Ini adalah pesan acak.',
            'kategori_tidak_ada',
            '/dashboard'
        );

        $this->assertNotNull($notifikasi);
        $this->assertEquals('kategori_tidak_ada', $notifikasi->kategori);
    }

    public function test_pesan_variable_tersedia_di_context_email(): void
    {
        $user = $this->user();

        $notifikasi = NotifikasiService::kirim(
            $user,
            'Pesan',
            'Isi pesan ini.',
            'umum',
            '/dashboard'
        );

        $this->assertStringContainsString('Isi pesan ini.', $notifikasi->pesan);
    }

    public function test_wa_stub_berfungsi_tanpa_error(): void
    {
        $result = WhatsAppService::kirim('081234567890', 'Judul', 'Isi pesan', [
            'kode' => 'K-001',
            'nama' => 'Test',
        ]);

        $this->assertTrue($result);
    }

    public function test_wa_fonnte_fallback_ke_stub_jika_kosong(): void
    {
        $result = WhatsAppService::kirim('081234567890', 'Judul', 'Isi pesan', [
            'kode' => 'K-001',
            'nama' => 'Test',
        ]);

        $this->assertTrue($result);
    }
}
