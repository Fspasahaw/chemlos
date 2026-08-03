<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class CreateAdminUser extends Command
{
    protected $signature = 'chemlos:create-admin
        {--email= : Alamat email admin}
        {--password= : Password admin}
        {--name= : Nama lengkap admin}';

    protected $description = 'Membuat atau memperbarui akun admin pertama pada ChemLOS.';

    public function handle(): int
    {
        $email = $this->option('email') ?: $this->ask('Email admin');
        $password = $this->option('password') ?: $this->secret('Password admin');
        $name = $this->option('name') ?: $this->ask('Nama lengkap admin', 'Administrator ChemLOS');

        if (empty($email) || empty($password)) {
            $this->error('Email dan password wajib diisi.');
            return self::FAILURE;
        }

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Format email tidak valid.');
            return self::FAILURE;
        }

        if (strlen($password) < 8) {
            $this->error('Password minimal 8 karakter.');
            return self::FAILURE;
        }

        $role = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

        $user = User::firstOrNew(['email' => $email]);
        $user->name = $name;
        $user->nama_lengkap = $name;
        $user->password = $password;
        $user->status = 'approved';
        $user->email_verified_at = now();
        $user->approved_at = now();
        $user->notifikasi_email = true;
        $user->notifikasi_in_app = true;
        $user->notifikasi_whatsapp = false;
        $user->tema_preferensi = 'system';
        $user->bahasa_preferensi = 'id';
        $user->save();

        $user->syncRoles([$role->name]);

        $this->info("Akun admin berhasil dibuat/diperbarui: {$email}");

        return self::SUCCESS;
    }
}
