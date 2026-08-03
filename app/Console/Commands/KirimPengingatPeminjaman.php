<?php

namespace App\Console\Commands;

use App\Models\Peminjaman;
use App\Models\Pengaturan;
use App\Services\NotifikasiService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class KirimPengingatPeminjaman extends Command
{
    protected $signature = 'chemlos:send-reminders';

    protected $description = 'Mengirim pengingat serah terima H-1/H-0 dan pengembalian H-2/H-1/H-0 serta notifikasi keterlambatan';

    public function handle(): int
    {
        $now = now();

        $this->kirimPengingatSerahTerima($now);
        $this->kirimPengingatPengembalian($now);
        $this->kirimNotifikasiKeterlambatan($now);

        return self::SUCCESS;
    }

    private function kirimPengingatSerahTerima($now): void
    {
        $h1 = $now->copy()->addDay()->startOfDay();
        $h0 = $now->copy()->startOfDay();

        $h1Enabled = Pengaturan::getBool('notifikasi.reminder_h1_serah_terima', true);
        $h0Enabled = Pengaturan::getBool('notifikasi.reminder_h_serah_terima', true);

        $h1Peminjaman = $h1Enabled
            ? Peminjaman::whereIn('status', ['disetujui'])->whereDate('tanggal_mulai', $h1->toDateString())->get()
            : collect();

        $h0Peminjaman = $h0Enabled
            ? Peminjaman::whereIn('status', ['disetujui'])->whereDate('tanggal_mulai', $h0->toDateString())->get()
            : collect();

        foreach ($h1Peminjaman as $p) {
            $this->kirimSerahTerima($p, 'H-1', 'besok');
        }

        foreach ($h0Peminjaman as $p) {
            $this->kirimSerahTerima($p, 'H-0', 'hari ini');
        }

        $this->info('Pengingat serah terima H-1: '.$h1Peminjaman->count());
        $this->info('Pengingat serah terima H-0: '.$h0Peminjaman->count());
    }

    private function kirimSerahTerima(Peminjaman $p, string $label, string $deskripsiWaktu): void
    {
        NotifikasiService::kirim(
            $p->user_id,
            "Pengingat Serah Terima {$label}",
            "Peminjaman {$p->kode} akan dilakukan serah terima {$deskripsiWaktu} (" . Carbon::parse($p->tanggal_mulai)->format('d M Y') . "). Mohon datang tepat waktu.",
            'pengingat_serah_terima',
            '/dashboard/mahasiswa/peminjaman'
        );

        foreach ($p->laboratorium->laboratoriumPengelolas as $pengelola) {
            NotifikasiService::kirim(
                $pengelola->user_id,
                "Pengingat Serah Terima {$label}",
                "Peminjaman {$p->kode} akan dilakukan serah terima {$deskripsiWaktu}. Siapkan alat yang dipinjam.",
                'pengingat_serah_terima',
                '/dashboard/laboran/serah-terima'
            );
        }
    }

    private function kirimPengingatPengembalian($now): void
    {
        $h2 = $now->copy()->addDays(2)->startOfDay();
        $h1 = $now->copy()->addDay()->startOfDay();
        $h0 = $now->copy()->startOfDay();

        $h2Enabled = Pengaturan::getBool('notifikasi.reminder_h2_pengembalian', true);
        $h1Enabled = Pengaturan::getBool('notifikasi.reminder_h1_pengembalian', true);
        $h0Enabled = Pengaturan::getBool('notifikasi.reminder_h_pengembalian', true);

        $peminjamanH2 = $h2Enabled
            ? Peminjaman::whereIn('status', ['disetujui', 'berlangsung'])->whereDate('tanggal_selesai', $h2->toDateString())->get()
            : collect();

        $peminjamanH1 = $h1Enabled
            ? Peminjaman::whereIn('status', ['disetujui', 'berlangsung'])->whereDate('tanggal_selesai', $h1->toDateString())->get()
            : collect();

        $peminjamanH0 = $h0Enabled
            ? Peminjaman::whereIn('status', ['disetujui', 'berlangsung'])->whereDate('tanggal_selesai', $h0->toDateString())->get()
            : collect();

        foreach ($peminjamanH2 as $p) {
            $this->kirimPengembalian($p, 'H-2', '2 hari lagi');
        }

        foreach ($peminjamanH1 as $p) {
            $this->kirimPengembalian($p, 'H-1', 'besok');
        }

        foreach ($peminjamanH0 as $p) {
            $this->kirimPengembalian($p, 'H-0', 'hari ini');
        }

        $this->info('Pengingat pengembalian H-2: '.$peminjamanH2->count());
        $this->info('Pengingat pengembalian H-1: '.$peminjamanH1->count());
        $this->info('Pengingat pengembalian H-0: '.$peminjamanH0->count());
    }

    private function kirimPengembalian(Peminjaman $p, string $label, string $deskripsiWaktu): void
    {
        NotifikasiService::kirim(
            $p->user_id,
            "Pengingat Pengembalian {$label}",
            "Peminjaman {$p->kode} jatuh tempo {$deskripsiWaktu}. Mohon kembalikan alat tepat waktu.",
            'pengingat_pengembalian',
            '/dashboard/mahasiswa/peminjaman'
        );

        foreach ($p->laboratorium->laboratoriumPengelolas as $pengelola) {
            NotifikasiService::kirim(
                $pengelola->user_id,
                "Pengingat Pengembalian {$label}",
                "Peminjaman {$p->kode} jatuh tempo {$deskripsiWaktu}. Siapkan proses penerimaan alat.",
                'pengingat_pengembalian',
                '/dashboard/laboran/pengembalian'
            );
        }
    }

    private function kirimNotifikasiKeterlambatan($now): void
    {
        if (! Pengaturan::getBool('notifikasi.notifikasi_keterlambatan', true)) {
            $this->info('Notifikasi keterlambatan dinonaktifkan.');

            return;
        }

        $h0 = $now->copy()->startOfDay();

        $peminjamanTerlambat = Peminjaman::whereIn('status', ['disetujui', 'berlangsung'])
            ->whereDate('tanggal_selesai', '<', $h0->toDateString())
            ->get();

        foreach ($peminjamanTerlambat as $p) {
            NotifikasiService::kirim(
                $p->user_id,
                'Peminjaman Terlambat',
                "Peminjaman {$p->kode} sudah melewati batas waktu pengembalian. Segera kembalikan alat untuk menghindari denda.",
                'peminjaman_terlambat',
                '/dashboard/mahasiswa/peminjaman'
            );

            foreach ($p->laboratorium->laboratoriumPengelolas as $pengelola) {
                NotifikasiService::kirim(
                    $pengelola->user_id,
                    'Peminjaman Terlambat',
                    "Peminjaman {$p->kode} sudah melewati batas waktu pengembalian. Segera tindak lanjuti pengembalian alat.",
                    'peminjaman_terlambat',
                    '/dashboard/laboran/pengembalian'
                );
            }

            if ($p->dosen_pembimbing_id) {
                NotifikasiService::kirim(
                    $p->dosen_pembimbing_id,
                    'Peminjaman Terlambat',
                    "Peminjaman {$p->kode} bimbingan Anda sudah melewati batas waktu pengembalian.",
                    'peminjaman_terlambat',
                    '/dashboard/dosen/peminjaman'
                );
            }
        }

        $this->info('Peminjaman terlambat: '.$peminjamanTerlambat->count());
    }
}
