<?php

namespace App\Services;

use App\Models\Peminjaman;
use App\Models\Pengaturan;
use Carbon\Carbon;

class DendaService
{
    public static function settings(): array
    {
        return [
            'denda_per_hari' => (float) (Pengaturan::get('denda.denda_per_hari') ?? 50000),
            'denda_per_jam' => (float) (Pengaturan::get('denda.denda_per_jam') ?? 0),
            'toleransi_keterlambatan_menit' => (int) (Pengaturan::get('denda.toleransi_keterlambatan_menit') ?? 30),
            'maksimal_denda' => (float) (Pengaturan::get('denda.maksimal_denda') ?? 500000),
            'denda_rusak_ringan' => (float) (Pengaturan::get('denda.denda_rusak_ringan') ?? 50000),
            'denda_rusak_berat' => (float) (Pengaturan::get('denda.denda_rusak_berat') ?? 500000),
            'denda_hilang' => (float) (Pengaturan::get('denda.denda_hilang') ?? 500000),
        ];
    }

    public static function hitung(Peminjaman $peminjaman, array $detailInput, ?string $waktuPengembalian = null): array
    {
        $settings = self::settings();

        $batas = Carbon::parse($peminjaman->tanggal_selesai)
            ->setTimeFromTimeString($peminjaman->jam_selesai ?? '23:59')
            ->addMinutes($settings['toleransi_keterlambatan_menit']);

        $now = $waktuPengembalian ? Carbon::parse($waktuPengembalian) : now();
        $terlambat = $now->greaterThan($batas);
        $menitTerlambat = $terlambat ? (int) max(0, $batas->diffInMinutes($now, false)) : 0;

        if ($settings['denda_per_jam'] > 0) {
            $jamTerlambat = (int) ceil($menitTerlambat / 60);
            $dendaKeterlambatan = $jamTerlambat * $settings['denda_per_jam'];
        } else {
            $hariTerlambat = (int) ceil($menitTerlambat / 1440);
            $dendaKeterlambatan = $hariTerlambat * $settings['denda_per_hari'];
        }

        if ($settings['maksimal_denda'] > 0) {
            $dendaKeterlambatan = min($dendaKeterlambatan, $settings['maksimal_denda']);
        }

        $dendaKerusakan = 0;
        $perAlat = [];

        foreach ($peminjaman->details as $detail) {
            $input = $detailInput[$detail->id] ?? [];
            $kondisi = $input['kondisi_pengembalian'] ?? 'baik';
            $manualDenda = $input['denda_per_alat'] ?? null;

            if ($manualDenda !== null && $manualDenda !== '') {
                $rusak = (float) $manualDenda;
            } else {
                $rusak = match ($kondisi) {
                    'rusak_ringan' => $settings['denda_rusak_ringan'],
                    'rusak_berat' => $settings['denda_rusak_berat'],
                    'hilang' => $settings['denda_hilang'],
                    default => 0,
                };
                $rusak *= $detail->jumlah;
            }

            $perAlat[$detail->id] = $rusak;
            $dendaKerusakan += $rusak;
        }

        return [
            'total' => $dendaKeterlambatan + $dendaKerusakan,
            'per_alat' => $perAlat,
            'terlambat' => $terlambat,
            'keterlambatan_menit' => $menitTerlambat,
        ];
    }
}
