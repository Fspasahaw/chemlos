<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Bersihkan aset demo lama agar data benar-benar regenerasi
        Storage::disk('public')->deleteDirectory('demo');

        $this->call([
            RolePermissionSeeder::class,
            PengaturanSeeder::class,
            FaqSeeder::class,
            DemoDataSeeder::class,
        ]);
    }
}
