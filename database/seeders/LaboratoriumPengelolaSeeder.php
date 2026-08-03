<?php

namespace Database\Seeders;

use App\Models\Laboratorium;
use App\Models\LaboratoriumPengelola;
use App\Models\User;
use Illuminate\Database\Seeder;

class LaboratoriumPengelolaSeeder extends Seeder
{
    public function run(): void
    {
        $mapping = [
            'Lab. Bioproses' => [
                'kepala_lab' => 'hendra.wijaya@che.ui.ac.id',
                'laboran' => 'ahmad.fauzi@che.ui.ac.id',
            ],
            'Lab. Rekayasa Produk Kimia' => [
                'kepala_lab' => 'ratna.dewi@che.ui.ac.id',
                'laboran' => 'dewi.lestari@che.ui.ac.id',
            ],
            'Lab. Teknologi Intensifikasi Proses' => [
                'kepala_lab' => 'fajar.nugroho@che.ui.ac.id',
                'laboran' => 'rudi.hermawan@che.ui.ac.id',
            ],
            'Lab. Sistem Proses dan Energi Berkelanjutan' => [
                'kepala_lab' => 'maya.sari@che.ui.ac.id',
                'laboran' => 'linda.permata@che.ui.ac.id',
            ],
            'Lab. Rekayasa Sistem Proses' => [
                'kepala_lab' => 'budi.santoso@che.ui.ac.id',
                'laboran' => 'eko.prasetyo@che.ui.ac.id',
            ],
        ];

        foreach ($mapping as $labName => $pengelolas) {
            $lab = Laboratorium::where('nama', $labName)->first();
            if (! $lab) {
                continue;
            }

            foreach (['kepala_lab', 'laboran'] as $peran) {
                $email = $pengelolas[$peran] ?? null;
                if (! $email) {
                    continue;
                }

                $user = User::where('email', $email)->first();
                if (! $user) {
                    continue;
                }

                LaboratoriumPengelola::updateOrCreate(
                    ['laboratorium_id' => $lab->id, 'user_id' => $user->id, 'peran' => $peran],
                    ['is_primary' => true]
                );
            }
        }
    }
}
