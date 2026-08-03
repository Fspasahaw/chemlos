<?php

namespace App\Http\Controllers\Laboran;

use App\Http\Controllers\Controller;
use App\Models\Alat;
use App\Models\LaboratoriumPengelola;
use App\Models\MaintenanceAlat;
use App\Models\Notifikasi;
use App\Models\Peminjaman;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    private function labIds(): array
    {
        return LaboratoriumPengelola::where('user_id', auth()->id())
            ->pluck('laboratorium_id')
            ->toArray();
    }

    public function index()
    {
        $labIds = $this->labIds();

        $alatQuery = Alat::whereIn('laboratorium_id', $labIds);

        $metrics = [
            'peminjaman_menunggu' => Peminjaman::whereIn('laboratorium_id', $labIds)
                ->where('status', 'menunggu_laboran')
                ->count(),
            'serah_terima_hari_ini' => Peminjaman::whereIn('laboratorium_id', $labIds)
                ->where('status', 'disetujui')
                ->whereDate('tanggal_mulai', '<=', now())
                ->count(),
            'pengembalian_hari_ini' => Peminjaman::whereIn('laboratorium_id', $labIds)
                ->whereIn('status', ['berlangsung', 'terlambat'])
                ->whereDate('tanggal_selesai', '<=', now())
                ->count(),
            'alat_tersedia' => (clone $alatQuery)->sum('stok_tersedia'),
            'maintenance_berlangsung' => MaintenanceAlat::whereIn('laboratorium_id', $labIds)
                ->where('status', 'berlangsung')
                ->count(),
            'akun_menunggu_persetujuan' => User::where('status', 'pending_approval')
                ->whereHas('roles', fn ($q) => $q->whereIn('name', ['mahasiswa', 'dosen']))
                ->count(),
        ];

        $peminjamanMingguIni = Peminjaman::selectRaw('DATE(created_at) as tanggal, count(*) as total')
            ->whereIn('laboratorium_id', $labIds)
            ->whereDate('created_at', '>=', now()->subDays(6))
            ->groupBy('tanggal')
            ->orderBy('tanggal')
            ->get()
            ->map(fn ($r) => ['tanggal' => $r->tanggal, 'total' => (int) $r->total]);

        $distribusiStatusPeminjaman = Peminjaman::whereIn('laboratorium_id', $labIds)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $distribusiKondisiAlat = Alat::whereIn('laboratorium_id', $labIds)
            ->selectRaw('kondisi, count(*) as total')
            ->groupBy('kondisi')
            ->pluck('total', 'kondisi');

        $peminjamanMenunggu = Peminjaman::whereIn('laboratorium_id', $labIds)
            ->where('status', 'menunggu_laboran')
            ->with('user:id,nama_lengkap,npm_nip', 'laboratorium:id,nama', 'details.alat:id,nama,kode')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        $serahTerimaHariIni = Peminjaman::whereIn('laboratorium_id', $labIds)
            ->where('status', 'disetujui')
            ->whereDate('tanggal_mulai', '<=', now())
            ->with('user:id,nama_lengkap,npm_nip', 'laboratorium:id,nama', 'details.alat:id,nama,kode')
            ->orderBy('tanggal_mulai')
            ->limit(5)
            ->get();

        $pengembalianHariIni = Peminjaman::whereIn('laboratorium_id', $labIds)
            ->whereIn('status', ['berlangsung', 'terlambat'])
            ->whereDate('tanggal_selesai', '<=', now())
            ->with('user:id,nama_lengkap,npm_nip', 'laboratorium:id,nama', 'details.alat:id,nama,kode')
            ->orderBy('tanggal_selesai')
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard/Laboran/Index', [
            'lab_ids' => $labIds,
            'metrics' => $metrics,
            'peminjaman_minggu_ini' => $peminjamanMingguIni,
            'distribusi_status_peminjaman' => $distribusiStatusPeminjaman,
            'distribusi_kondisi_alat' => $distribusiKondisiAlat,
            'peminjaman_menunggu' => $peminjamanMenunggu,
            'serah_terima_hari_ini' => $serahTerimaHariIni,
            'pengembalian_hari_ini' => $pengembalianHariIni,
            'notifikasi_belum_dibaca' => Notifikasi::byUser(auth()->id())->unread()->count(),
        ]);
    }
}
