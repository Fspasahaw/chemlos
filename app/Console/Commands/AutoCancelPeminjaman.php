<?php

namespace App\Console\Commands;

use App\Models\Alat;
use App\Models\Peminjaman;
use App\Models\PeminjamanStatusLog;
use App\Models\Pengaturan;
use App\Services\NotifikasiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AutoCancelPeminjaman extends Command
{
    protected $signature = 'chemlos:auto-cancel';

    protected $description = 'Membatalkan peminjaman yang belum disetujui melebihi batas waktu';

    public function handle(): int
    {
        $batasJam = (int) Pengaturan::get('peminjaman.batas_waktu_persetujuan_jam', 24);
        $batas = now()->subHours($batasJam);

        $peminjaman = Peminjaman::whereIn('status', ['diajukan', 'menunggu_dosen', 'menunggu_laboran'])
            ->where('created_at', '<', $batas)
            ->with(['details.alat', 'laboratorium.laboratoriumPengelolas'])
            ->get();

        foreach ($peminjaman as $p) {
            DB::transaction(function () use ($p) {
                $statusLama = $p->status;

                $p->update([
                    'status' => 'dibatalkan',
                    'dibatalkan_oleh' => null,
                    'catatan' => 'Dibatalkan otomatis karena melebihi batas waktu persetujuan.',
                ]);

                foreach ($p->details as $detail) {
                    $alat = Alat::lockForUpdate()->find($detail->alat_id);

                    if ($alat) {
                        $alat->stok_reserved = max(0, $alat->stok_reserved - $detail->jumlah);
                        $alat->stok_tersedia = $alat->stok_tersedia + $detail->jumlah;
                        $alat->save();
                    }
                }

                PeminjamanStatusLog::create([
                    'peminjaman_id' => $p->id,
                    'status_dari' => $statusLama,
                    'status_ke' => 'dibatalkan',
                    'keterangan' => 'Dibatalkan otomatis karena melebihi batas waktu persetujuan.',
                    'user_id' => $p->user_id,
                ]);

                NotifikasiService::kirim(
                    $p->user_id,
                    'Peminjaman Dibatalkan Otomatis',
                    "Peminjaman {$p->kode} dibatalkan otomatis karena melebihi batas waktu persetujuan.",
                    'peminjaman',
                    '/dashboard/mahasiswa/peminjaman',
                    ['kode' => $p->kode, 'alat' => $p->details->map(fn ($d) => $d->alat->nama)->implode(', ')]
                );

                foreach ($p->laboratorium->laboratoriumPengelolas as $pengelola) {
                    NotifikasiService::kirim(
                        $pengelola->user_id,
                        'Peminjaman Dibatalkan Otomatis',
                        "Peminjaman {$p->kode} dibatalkan otomatis karena melebihi batas waktu persetujuan.",
                        'peminjaman',
                        '/dashboard/laboran/peminjaman',
                        ['kode' => $p->kode]
                    );
                }
            });
        }

        $this->info("{$peminjaman->count()} peminjaman dibatalkan otomatis.");

        return self::SUCCESS;
    }
}
