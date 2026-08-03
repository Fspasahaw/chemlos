<?php

namespace App\Services;

use App\Models\Alat;
use App\Models\KerusakanAlat;
use App\Models\Laboratorium;
use App\Models\MaintenanceAlat;
use App\Models\Peminjaman;
use App\Models\PeminjamanDetail;
use Carbon\Carbon;

class DetailDataService
{
    public static function eventsForAlat(Alat $alat): array
    {
        $peminjaman = Peminjaman::with([
                'laboratorium:id,nama',
                'user:id,nama_lengkap',
                'dosenPembimbing:id,nama_lengkap',
                'details.alat:id,nama',
            ])
            ->whereHas('details', fn ($q) => $q->where('alat_id', $alat->id))
            ->whereNotIn('status', ['ditolak', 'dibatalkan'])
            ->get();

        $maintenance = MaintenanceAlat::with(['laboratorium:id,nama', 'alat:id,nama', 'laboran:id,nama_lengkap'])
            ->where('alat_id', $alat->id)
            ->whereNotIn('status', ['dibatalkan'])
            ->get();

        return collect($peminjaman->map(fn (Peminjaman $p): array => KalenderService::eventDariPeminjaman($p)))
            ->merge($maintenance->map(fn (MaintenanceAlat $m): array => KalenderService::eventDariMaintenance($m)))
            ->values()
            ->toArray();
    }

    public static function riwayatForAlat(Alat $alat): array
    {
        return collect()
            ->merge(
                PeminjamanDetail::with('peminjaman:id,kode,tanggal_mulai,tanggal_selesai,status')
                    ->where('alat_id', $alat->id)
                    ->whereHas('peminjaman', fn ($q) => $q->whereIn('status', ['disetujui', 'berlangsung', 'selesai', 'terlambat']))
                    ->get()
                    ->map(fn (PeminjamanDetail $d): array => [
                        'type' => 'peminjaman',
                        'date' => Carbon::parse($d->peminjaman->tanggal_mulai)->toDateString(),
                        'end' => Carbon::parse($d->peminjaman->tanggal_selesai)->toDateString(),
                        'title' => $d->peminjaman->kode,
                        'status' => $d->peminjaman->status,
                        'description' => 'Peminjaman alat',
                    ])
            )
            ->merge(
                KerusakanAlat::where('alat_id', $alat->id)
                    ->latest('tanggal_dilaporkan')
                    ->get()
                    ->map(fn (KerusakanAlat $k): array => [
                        'type' => 'kerusakan',
                        'date' => Carbon::parse($k->tanggal_dilaporkan ?? $k->created_at)->toDateString(),
                        'title' => 'Laporan Kerusakan',
                        'status' => $k->status,
                        'description' => $k->keterangan,
                    ])
            )
            ->merge(
                MaintenanceAlat::where('alat_id', $alat->id)
                    ->latest('tanggal_mulai')
                    ->get()
                    ->map(fn (MaintenanceAlat $m): array => [
                        'type' => 'maintenance',
                        'date' => Carbon::parse($m->tanggal_mulai ?? $m->created_at)->toDateString(),
                        'end' => $m->tanggal_selesai ? Carbon::parse($m->tanggal_selesai)->toDateString() : null,
                        'title' => 'Maintenance',
                        'status' => $m->status,
                        'description' => $m->keterangan,
                    ])
            )
            ->sortByDesc('date')
            ->values()
            ->toArray();
    }

    public static function eventsForLaboratorium(Laboratorium $laboratorium): array
    {
        $peminjaman = Peminjaman::with([
                'laboratorium:id,nama',
                'user:id,nama_lengkap',
                'dosenPembimbing:id,nama_lengkap',
                'details.alat:id,nama',
            ])
            ->where('laboratorium_id', $laboratorium->id)
            ->whereNotIn('status', ['ditolak', 'dibatalkan'])
            ->get();

        $maintenance = MaintenanceAlat::with(['laboratorium:id,nama', 'alat:id,nama', 'laboran:id,nama_lengkap'])
            ->where('laboratorium_id', $laboratorium->id)
            ->whereNotIn('status', ['dibatalkan'])
            ->get();

        return collect($peminjaman->map(fn (Peminjaman $p): array => KalenderService::eventDariPeminjaman($p)))
            ->merge($maintenance->map(fn (MaintenanceAlat $m): array => KalenderService::eventDariMaintenance($m)))
            ->values()
            ->toArray();
    }

    public static function riwayatForLaboratorium(Laboratorium $laboratorium): array
    {
        return [
            'peminjaman' => Peminjaman::with('user:id,nama_lengkap', 'details.alat:id,nama')
                ->where('laboratorium_id', $laboratorium->id)
                ->whereIn('status', ['disetujui', 'berlangsung', 'selesai', 'terlambat'])
                ->latest()
                ->limit(20)
                ->get()
                ->toArray(),
            'kerusakan' => KerusakanAlat::with('alat:id,nama,laboratorium_id', 'pelapor:id,nama_lengkap')
                ->whereHas('alat', fn ($q) => $q->where('laboratorium_id', $laboratorium->id))
                ->latest()
                ->limit(20)
                ->get()
                ->toArray(),
            'maintenance' => MaintenanceAlat::with('alat:id,nama', 'laboran:id,nama_lengkap')
                ->where('laboratorium_id', $laboratorium->id)
                ->latest()
                ->limit(20)
                ->get()
                ->toArray(),
        ];
    }
}
