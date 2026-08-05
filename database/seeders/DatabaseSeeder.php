<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Bersihkan aset demo lama agar data benar-benar regenerasi
        $demoPath = Storage::disk('public')->path('demo');

        if (File::isDirectory($demoPath)) {
            try {
                File::deleteDirectory($demoPath);
            } catch (\Throwable $e) {
                // Abaikan kegagalan penghapusan; seeding akan menimpa path yang sama.
            }
        }

        $this->call([
            RolePermissionSeeder::class,
            PengaturanSeeder::class,
            FaqSeeder::class,
            DemoDataSeeder::class,
        ]);
    }
}
