<?php

namespace App\Services;

use App\Models\MaintenanceAlat;
use App\Models\Peminjaman;
use Carbon\Carbon;

class KalenderService
{
    public static function warnaStatus(string $status): string
    {
        return match ($status) {
            'diajukan', 'menunggu_dosen' => '#f59e0b',
            'menunggu_laboran' => '#60a5fa',
            'disetujui' => '#3b82f6',
            'berlangsung' => '#8b5cf6',
            'selesai' => '#10b981',
            'terlambat' => '#f97316',
            'ditolak', 'dibatalkan' => '#ef4444',
            'maintenance' => '#6b7280',
            default => '#94a3b8',
        };
    }

    public static function labelStatus(string $status): string
    {
        return match ($status) {
            'diajukan' => 'Diajukan',
            'menunggu_dosen' => 'Menunggu Persetujuan Dosen',
            'menunggu_laboran' => 'Menunggu Persetujuan Laboran',
            'disetujui' => 'Disetujui',
            'berlangsung' => 'Berlangsung',
            'selesai' => 'Selesai',
            'terlambat' => 'Terlambat',
            'ditolak' => 'Ditolak',
            'dibatalkan' => 'Dibatalkan',
            'maintenance' => 'Maintenance',
            default => $status,
        };
    }

    public static function eventDariPeminjaman(Peminjaman $p): array
    {
        $alatList = $p->details
            ->map(fn ($d) => ($d->alat?->nama ?? 'Alat') . ($d->jumlah > 1 ? " (x{$d->jumlah})" : ''))
            ->implode(', ');

        $mulai = Carbon::parse($p->tanggal_mulai)->toDateString() . 'T' . ($p->jam_mulai ?: '00:00');
        $selesai = Carbon::parse($p->tanggal_selesai)->toDateString() . 'T' . ($p->jam_selesai ?: '23:59');

        return [
            'id' => $p->id,
            'title' => $p->kode,
            'start' => $mulai,
            'end' => $selesai,
            'color' => self::warnaStatus($p->status),
            'extendedProps' => [
                'type' => 'peminjaman',
                'status' => $p->status,
                'statusLabel' => $p->statusLabel(),
                'kode' => $p->kode,
                'peminjam' => $p->user?->nama_lengkap,
                'dosen' => $p->dosenPembimbing?->nama_lengkap,
                'laboratorium' => $p->laboratorium?->nama,
                'laboratorium_id' => $p->laboratorium_id,
                'alat' => $alatList,
                'tujuan' => $p->tujuan,
                'jam_mulai' => $p->jam_mulai,
                'jam_selesai' => $p->jam_selesai,
            ],
        ];
    }

    public static function eventDariMaintenance(MaintenanceAlat $m): array
    {
        $tanggalMulai = $m->tanggal_mulai ? Carbon::parse($m->tanggal_mulai)->toDateString() : Carbon::parse($m->created_at)->toDateString();
        $tanggalSelesai = $m->tanggal_selesai ? Carbon::parse($m->tanggal_selesai)->toDateString() : $tanggalMulai;

        return [
            'id' => 'm' . $m->id,
            'title' => 'Maintenance: ' . ($m->alat?->nama ?? 'Alat'),
            'start' => $tanggalMulai . 'T00:00',
            'end' => $tanggalSelesai . 'T23:59',
            'color' => self::warnaStatus('maintenance'),
            'extendedProps' => [
                'type' => 'maintenance',
                'status' => 'maintenance',
                'statusLabel' => 'Maintenance',
                'kode' => '-',
                'peminjam' => $m->laboran?->nama_lengkap,
                'dosen' => null,
                'laboratorium' => $m->laboratorium?->nama,
                'laboratorium_id' => $m->laboratorium_id,
                'alat' => $m->alat?->nama,
                'tujuan' => $m->keterangan,
                'jam_mulai' => null,
                'jam_selesai' => null,
            ],
        ];
    }
}
