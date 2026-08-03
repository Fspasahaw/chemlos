<?php

namespace Tests\Feature;

use App\Models\ProgramStudi;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LaboranPenggunaTest extends TestCase
{
    use RefreshDatabase;

    protected User $laboran;
    protected ProgramStudi $prodi;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);

        $this->prodi = ProgramStudi::create([
            'nama' => 'Kimia',
            'kode' => 'KIM',
            'jenjang' => 'S1',
            'status' => 'aktif',
        ]);

        $this->laboran = User::create([
            'name' => 'Laboran Test',
            'nama_lengkap' => 'Laboran Test',
            'email' => 'laboran@test.com',
            'password' => Hash::make('Password1!'),
            'npm_nip' => '199001011001001',
            'no_hp' => '081234567890',
            'status' => 'approved',
            'email_verified_at' => now(),
            'tanggal_lahir' => '1985-01-01',
            'jenis_kelamin' => 'L',
            'alamat' => 'Jl. Test',
        ]);
        $this->laboran->assignRole('laboran');
    }

    public function test_laboran_bisa_akses_halaman_pengguna(): void
    {
        $this->actingAs($this->laboran)
            ->get('/dashboard/laboran/pengguna')
            ->assertOk();

        $this->actingAs($this->laboran)
            ->get('/dashboard/laboran/pengguna/create')
            ->assertOk();
    }

    public function test_laboran_bisa_membuat_pengguna_mahasiswa_dan_dosen(): void
    {
        $this->actingAs($this->laboran)
            ->post('/dashboard/laboran/pengguna', [
                'nama_lengkap' => 'Mahasiswa Test',
                'email' => 'mhs2201@ui.ac.id',
                'npm_nip' => '2206285001',
                'role' => 'mahasiswa',
                'program_studi_id' => $this->prodi->id,
                'password' => 'Password1!',
            ])
            ->assertRedirect('/dashboard/laboran/pengguna');

        $this->assertDatabaseHas('users', [
            'email' => 'mhs2201@ui.ac.id',
            'npm_nip' => '2206285001',
            'status' => 'approved',
            'created_by' => $this->laboran->id,
        ]);

        $this->actingAs($this->laboran)
            ->post('/dashboard/laboran/pengguna', [
                'nama_lengkap' => 'Dosen Test',
                'email' => 'dosen@che.ui.ac.id',
                'npm_nip' => '197001011001004',
                'role' => 'dosen',
                'password' => 'Password1!',
            ])
            ->assertRedirect('/dashboard/laboran/pengguna');

        $this->assertDatabaseHas('users', [
            'email' => 'dosen@che.ui.ac.id',
            'npm_nip' => '197001011001004',
            'created_by' => $this->laboran->id,
        ]);
    }

    public function test_laboran_bisa_edit_pengguna_yang_dibuat(): void
    {
        $pengguna = $this->buatPengguna('mahasiswa');

        $this->actingAs($this->laboran)
            ->get("/dashboard/laboran/pengguna/{$pengguna->id}/edit")
            ->assertOk();

        $this->actingAs($this->laboran)
            ->put("/dashboard/laboran/pengguna/{$pengguna->id}", [
                'nama_lengkap' => 'Updated Nama',
                'email' => $pengguna->email,
                'npm_nip' => $pengguna->npm_nip,
                'role' => 'mahasiswa',
                'program_studi_id' => $this->prodi->id,
                'password' => '',
            ])
            ->assertRedirect('/dashboard/laboran/pengguna');

        $pengguna->refresh();
        $this->assertEquals('Updated Nama', $pengguna->nama_lengkap);
    }

    public function test_laboran_bisa_hapus_pengguna_yang_dibuat(): void
    {
        $pengguna = $this->buatPengguna('dosen');

        $this->actingAs($this->laboran)
            ->delete("/dashboard/laboran/pengguna/{$pengguna->id}")
            ->assertRedirect();

        $this->assertSoftDeleted('users', ['id' => $pengguna->id]);
    }

    public function test_laboran_tidak_bisa_edit_pengguna_orang_lain(): void
    {
        $pengguna = $this->buatPengguna('mahasiswa', true);

        $this->actingAs($this->laboran)
            ->get("/dashboard/laboran/pengguna/{$pengguna->id}/edit")
            ->assertForbidden();
    }

    private function buatPengguna(string $role, bool $otherLaboran = false): User
    {
        if ($otherLaboran) {
            $other = User::create([
                'name' => 'Other',
                'nama_lengkap' => 'Other',
                'email' => 'other@test.com',
                'password' => Hash::make('Password1!'),
                'npm_nip' => '199001011001999',
                'no_hp' => '081234567899',
                'status' => 'approved',
                'email_verified_at' => now(),
                'tanggal_lahir' => '1985-01-01',
                'jenis_kelamin' => 'L',
                'alamat' => 'Jl. Other',
            ]);
            $other->assignRole('laboran');
            $createdBy = $other->id;
        } else {
            $createdBy = $this->laboran->id;
        }

        $user = User::create([
            'name' => 'Pengguna Test',
            'nama_lengkap' => 'Pengguna Test',
            'email' => $role === 'mahasiswa' ? 'pengguna@ui.ac.id' : 'pengguna@che.ui.ac.id',
            'password' => Hash::make('Password1!'),
            'npm_nip' => $role === 'mahasiswa' ? '2206285099' : '197001011001099',
            'no_hp' => '081234567890',
            'status' => 'approved',
            'email_verified_at' => now(),
            'tanggal_lahir' => '2000-01-01',
            'jenis_kelamin' => 'L',
            'alamat' => 'Jl. Pengguna',
            'created_by' => $createdBy,
            'program_studi_id' => $this->prodi->id,
        ]);
        $user->assignRole($role);

        return $user;
    }
}
