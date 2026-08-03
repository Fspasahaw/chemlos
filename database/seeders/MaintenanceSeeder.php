<?php

namespace Database\Seeders;

use App\Models\KerusakanAlat;
use App\Models\Laboratorium;
use App\Models\MaintenanceAlat;
use App\Models\User;
use Illuminate\Database\Seeder;

class MaintenanceSeeder extends Seeder
{
    public function run(): void
    {
        $laborans = User::role('laboran')->where('status', 'approved')->get();

        if ($laborans->isEmpty()) {
            return;
        }

        // Maintenance dari kerusakan yang muncul saat pengembalian peminjaman.
        $kerusakans = KerusakanAlat::whereNotNull('peminjaman_id')
            ->where('status', 'dilaporkan')
            ->with('alat')
            ->get();

        $statuses = ['dijadwalkan', 'berlangsung', 'selesai'];

        foreach ($kerusakans as $index => $kerusakan) {
            // Biarkan 1 kerusakan terakhir belum didaftarkan ke maintenance.
            if ($index === $kerusakans->count() - 1) {
                continue;
            }

            $alat = $kerusakan->alat;
            $laboran = $laborans->random();
            $lab = $alat?->laboratorium ?? Laboratorium::aktif()->first();
            $maintenanceStatus = $statuses[$index % count($statuses)];

            $tanggalMulai = now()->subDays(rand(3, 10));
            $tanggalSelesai = $maintenanceStatus === 'selesai'
                ? $tanggalMulai->copy()->addDays(rand(2, 5))
                : null;

            $maintenance = MaintenanceAlat::create([
                'alat_id' => $kerusakan->alat_id,
                'laboratorium_id' => $lab?->id,
                'laboran_id' => $laboran->id,
                'kerusakan_id' => $kerusakan->id,
                'jumlah' => $kerusakan->jumlah,
                'keterangan' => 'Perbaikan ' . $kerusakan->kondisi . ' pada ' . ($alat?->nama ?? 'alat') . ' dari peminjaman ' . $kerusakan->peminjaman?->kode,
                'tanggal_mulai' => $tanggalMulai->toDateString(),
                'tanggal_selesai' => $tanggalSelesai?->toDateString(),
                'status' => $maintenanceStatus,
                'biaya' => rand(50000, 500000),
                'teknisi' => 'Teknisi ' . ($lab?->nama ?? 'Laboratorium'),
            ]);

            $kerusakan->update(['maintenance_id' => $maintenance->id, 'status' => 'maintenance']);

            if ($maintenanceStatus === 'selesai' && $alat) {
                $alat->stok_maintenance -= $kerusakan->jumlah;

                if ($kerusakan->kondisi === 'rusak_ringan' && $alat->stok_maintenance <= 0) {
                    $alat->kondisi = 'baik';
                } elseif (in_array($kerusakan->kondisi, ['rusak_berat', 'hilang'], true)) {
                    $alat->stok_total -= $kerusakan->jumlah;
                }

                $alat->save();
            }
        }
    }
}
