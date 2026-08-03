<?php

namespace Database\Seeders;

use App\Models\ProgramStudi;
use App\Models\User;
use Database\Seeders\Helpers\DemoAssetHelper;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Password demo per peran sesuai spesifikasi.
     */
    public static array $demoPasswords = [
        'admin' => 'Admin@12345',
        'pimpinan' => 'Pimpinan@12345',
        'kepala_lab' => 'KepalaLab@12345',
        'laboran' => 'Laboran@12345',
        'dosen' => 'Dosen@12345',
        'mahasiswa' => 'Mahasiswa@12345',
    ];

    public function run(): void
    {
        $s1Tk = ProgramStudi::where('kode', '45201')->first();
        $s1Tb = ProgramStudi::where('kode', '45601')->first();

        $users = [
            // Admin (2)
            ['nama_lengkap' => 'Administrator ChemLOS', 'email' => 'admin@che.ui.ac.id', 'npm_nip' => '198001012010011001', 'roles' => ['admin'], 'status' => 'approved'],
            ['nama_lengkap' => 'Rina Setyawati', 'email' => 'admin2@che.ui.ac.id', 'npm_nip' => '198502152005012002', 'roles' => ['admin'], 'status' => 'approved'],

            // Pimpinan (4) — sekaligus dosen
            ['nama_lengkap' => 'Prof. Dr. Ir. Bambang Suryadi, M.T.', 'email' => 'kepala.dept@che.ui.ac.id', 'npm_nip' => '196503151990031001', 'roles' => ['pimpinan', 'dosen'], 'status' => 'approved', 'jabatan_pimpinan' => 'kepala_departemen'],
            ['nama_lengkap' => 'Dr. Ir. Siti Rahayu, M.Eng.', 'email' => 'sekretaris.dept@che.ui.ac.id', 'npm_nip' => '197204201998022001', 'roles' => ['pimpinan', 'dosen'], 'status' => 'approved', 'jabatan_pimpinan' => 'sekretaris_departemen'],
            ['nama_lengkap' => 'Dr. Agung Prasetyo, S.T., M.T.', 'email' => 'ketua.tk@che.ui.ac.id', 'npm_nip' => '198107152006041001', 'roles' => ['pimpinan', 'dosen'], 'status' => 'approved', 'jabatan_pimpinan' => 'ketua_program_studi', 'program_studi_id' => $s1Tk?->id],
            ['nama_lengkap' => 'Dr. Fitri Handayani, S.T., M.Sc.', 'email' => 'ketua.bioproses@che.ui.ac.id', 'npm_nip' => '198509202011012001', 'roles' => ['pimpinan', 'dosen'], 'status' => 'approved', 'jabatan_pimpinan' => 'ketua_program_studi', 'program_studi_id' => $s1Tb?->id],

            // Kepala Laboratorium (5) — sekaligus dosen
            ['nama_lengkap' => 'Dr. Ir. Hendra Wijaya, M.T.', 'email' => 'hendra.wijaya@che.ui.ac.id', 'npm_nip' => '197509101999031001', 'roles' => ['kepala_lab', 'dosen'], 'status' => 'approved'],
            ['nama_lengkap' => 'Dr. Ratna Dewi, S.T., M.Eng.', 'email' => 'ratna.dewi@che.ui.ac.id', 'npm_nip' => '198203152008012001', 'roles' => ['kepala_lab', 'dosen'], 'status' => 'approved'],
            ['nama_lengkap' => 'Dr. Ir. Fajar Nugroho, M.T.', 'email' => 'fajar.nugroho@che.ui.ac.id', 'npm_nip' => '197806202003121001', 'roles' => ['kepala_lab', 'dosen'], 'status' => 'approved'],
            ['nama_lengkap' => 'Dr. Maya Sari, S.T., M.T.', 'email' => 'maya.sari@che.ui.ac.id', 'npm_nip' => '198405102010012001', 'roles' => ['kepala_lab', 'dosen'], 'status' => 'approved'],
            ['nama_lengkap' => 'Dr. Ir. Budi Santoso, M.Sc.', 'email' => 'budi.santoso@che.ui.ac.id', 'npm_nip' => '197201051996031001', 'roles' => ['kepala_lab', 'dosen'], 'status' => 'approved'],

            // Laboran (5)
            ['nama_lengkap' => 'Ahmad Fauzi, A.Md.', 'email' => 'ahmad.fauzi@che.ui.ac.id', 'npm_nip' => '198901152015041001', 'roles' => ['laboran'], 'status' => 'approved', 'no_hp' => '081234567890'],
            ['nama_lengkap' => 'Dewi Lestari, A.Md.', 'email' => 'dewi.lestari@che.ui.ac.id', 'npm_nip' => '199005202016042001', 'roles' => ['laboran'], 'status' => 'approved', 'no_hp' => '082345678901'],
            ['nama_lengkap' => 'Rudi Hermawan, S.T.', 'email' => 'rudi.hermawan@che.ui.ac.id', 'npm_nip' => '198712102014041001', 'roles' => ['laboran'], 'status' => 'approved', 'no_hp' => '083456789012'],
            ['nama_lengkap' => 'Linda Permata, A.Md.', 'email' => 'linda.permata@che.ui.ac.id', 'npm_nip' => '199108252017042001', 'roles' => ['laboran'], 'status' => 'approved', 'no_hp' => '084567890123'],
            ['nama_lengkap' => 'Eko Prasetyo, S.T.', 'email' => 'eko.prasetyo@che.ui.ac.id', 'npm_nip' => '198805152013041001', 'roles' => ['laboran'], 'status' => 'approved', 'no_hp' => '085678901234'],

            // Dosen tambahan (2)
            ['nama_lengkap' => 'Dr. Ir. Susanto Wijaya, M.T.', 'email' => 'susanto.wijaya@che.ui.ac.id', 'npm_nip' => '197405102000031001', 'roles' => ['dosen'], 'status' => 'approved'],
            ['nama_lengkap' => 'Dr. Kartika Sari, S.T., M.Eng.', 'email' => 'kartika.sari@che.ui.ac.id', 'npm_nip' => '198206152007012001', 'roles' => ['dosen'], 'status' => 'approved'],

            // Mahasiswa aktif dan lengkap (4)
            ['nama_lengkap' => 'Muhammad Rizki Pratama', 'email' => '1906285001@ui.ac.id', 'npm_nip' => '1906285001', 'roles' => ['mahasiswa'], 'status' => 'approved', 'program_studi_id' => $s1Tk?->id, 'angkatan' => 2019, 'semester' => 8],
            ['nama_lengkap' => 'Putri Amelia Sari', 'email' => '1906285002@ui.ac.id', 'npm_nip' => '1906285002', 'roles' => ['mahasiswa'], 'status' => 'approved', 'program_studi_id' => $s1Tk?->id, 'angkatan' => 2019, 'semester' => 8],
            ['nama_lengkap' => 'Andi Kurniawan', 'email' => '2006285003@ui.ac.id', 'npm_nip' => '2006285003', 'roles' => ['mahasiswa'], 'status' => 'approved', 'program_studi_id' => $s1Tk?->id, 'angkatan' => 2020, 'semester' => 6],
            ['nama_lengkap' => 'Hendro Wibowo', 'email' => '2206486001@ui.ac.id', 'npm_nip' => '2206486001', 'roles' => ['mahasiswa'], 'status' => 'approved', 'program_studi_id' => $s1Tb?->id, 'angkatan' => 2022, 'semester' => 2],

            // Mahasiswa ditolak (1)
            ['nama_lengkap' => 'Sarah Wijayanti', 'email' => '2006285004@ui.ac.id', 'npm_nip' => '2006285004', 'roles' => ['mahasiswa'], 'status' => 'rejected', 'program_studi_id' => $s1Tk?->id, 'angkatan' => 2020, 'semester' => 6, 'rejection_reason' => 'Data KTM tidak sesuai dengan identitas mahasiswa.'],

            // Mahasiswa kondisi khusus (4)
            ['nama_lengkap' => 'Joko Susilo', 'email' => '2306285009@ui.ac.id', 'npm_nip' => '2306285009', 'roles' => ['mahasiswa'], 'status' => 'pending_approval', 'program_studi_id' => $s1Tk?->id, 'angkatan' => 2023, 'semester' => 1],
            ['nama_lengkap' => 'Lukman Hakim', 'email' => '2406285010@ui.ac.id', 'npm_nip' => '2406285010', 'roles' => ['mahasiswa'], 'status' => 'pending_email', 'program_studi_id' => $s1Tk?->id, 'angkatan' => 2024, 'semester' => 1],
            ['nama_lengkap' => 'Dina Rahmawati', 'email' => '2106285011@ui.ac.id', 'npm_nip' => '2106285011', 'roles' => ['mahasiswa'], 'status' => 'suspended', 'program_studi_id' => $s1Tk?->id, 'angkatan' => 2021, 'semester' => 4],
            ['nama_lengkap' => 'Bima Aditya Putra', 'email' => '2106285012@ui.ac.id', 'npm_nip' => '2106285012', 'roles' => ['mahasiswa'], 'status' => 'approved', 'program_studi_id' => $s1Tk?->id, 'angkatan' => 2021, 'semester' => 4, 'profil_lengkap' => false],
        ];

        $firstLaboran = null;

        foreach ($users as $index => $u) {
            $isMahasiswa = in_array('mahasiswa', $u['roles'], true);
            $isApproved = $u['status'] === 'approved';
            $isRejected = $u['status'] === 'rejected';
            $emailVerified = in_array($u['status'], ['approved', 'pending_approval', 'suspended', 'rejected'], true) ? now() : null;

            $avatar = DemoAssetHelper::image("demo/users/avatar-{$index}.jpg", 200, 200, substr($u['nama_lengkap'], 0, 2));

            if ($isMahasiswa && ($u['profil_lengkap'] ?? true)) {
                $fotoKtm = DemoAssetHelper::image("demo/ktm/ktm-{$u['npm_nip']}.jpg", 600, 400, 'KTM ' . $u['npm_nip']);
            } else {
                $fotoKtm = null;
            }

            $user = User::updateOrCreate(
                ['email' => $u['email']],
                [
                    'name' => $u['nama_lengkap'],
                    'nama_lengkap' => $u['nama_lengkap'],
                    'email_verified_at' => $emailVerified,
                    'password' => Hash::make(self::$demoPasswords[$u['roles'][0]] ?? 'Password1!'),
                    'npm_nip' => $u['npm_nip'],
                    'no_hp' => $u['no_hp'] ?? ($isMahasiswa && ($u['profil_lengkap'] ?? true) ? '08' . rand(1000000000, 9999999999) : null),
                    'avatar' => $avatar,
                    'program_studi_id' => $u['program_studi_id'] ?? null,
                    'jabatan_pimpinan' => $u['jabatan_pimpinan'] ?? null,
                    'status' => $u['status'],
                    'approved_at' => $isApproved ? now() : null,
                    'rejected_by' => $isRejected ? $firstLaboran?->id : null,
                    'rejection_reason' => $u['rejection_reason'] ?? null,
                    'tanggal_lahir' => $isMahasiswa && ($u['profil_lengkap'] ?? true) ? '2001-01-0' . (($index % 9) + 1) : null,
                    'jenis_kelamin' => $isMahasiswa && ($u['profil_lengkap'] ?? true) ? (($index % 2 === 0) ? 'L' : 'P') : null,
                    'alamat' => $isMahasiswa && ($u['profil_lengkap'] ?? true) ? 'Jl. Demo No. ' . ($index + 1) . ', Depok' : null,
                    'angkatan' => $u['angkatan'] ?? null,
                    'semester' => $u['semester'] ?? null,
                    'foto_ktm' => $fotoKtm,
                    'legal_consent_at' => now(),
                    'legal_consent_ip' => '127.0.0.1',
                ]
            );

            $user->syncRoles($u['roles']);

            if (in_array('laboran', $u['roles'], true) && ! $firstLaboran) {
                $firstLaboran = $user;
            }
        }

        if ($firstLaboran) {
            User::whereHas('roles', fn ($q) => $q->whereIn('name', ['dosen', 'mahasiswa']))
                ->where('status', 'approved')
                ->whereNull('created_by')
                ->update([
                    'created_by' => $firstLaboran->id,
                    'approved_by' => $firstLaboran->id,
                    'approved_at' => now(),
                ]);
        }
    }
}
