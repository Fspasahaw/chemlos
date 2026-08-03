<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            ProgramStudiSeeder::class,
            LaboratoriumSeeder::class,
            KategoriAlatSeeder::class,
            UserSeeder::class,
            LaboratoriumPengelolaSeeder::class,
            AlatSeeder::class,
            VideoTutorialSeeder::class,
            PeminjamanSeeder::class,
            MaintenanceSeeder::class,
            NotifikasiSeeder::class,
        ]);
    }
}
