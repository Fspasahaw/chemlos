<?php

namespace App\Http\Controllers\KepalaLab;

use App\Http\Controllers\Controller;
use App\Models\Alat;
use App\Models\KerusakanAlat;
use App\Models\Laboratorium;
use App\Models\LaboratoriumPengelola;
use App\Models\MaintenanceAlat;
use App\Models\Notifikasi;
use App\Models\Peminjaman;
use Illuminate\Support\Facades\DB;
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

        $monthColumn = DB::getDriverName() === 'sqlite' ? "strftime('%Y-%m', created_at)" : "DATE_FORMAT(created_at, '%Y-%m')";

        $metrics = [
            'total_alat' => (clone $alatQuery)->count(),
            'alat_tersedia' => (clone $alatQuery)->sum('stok_tersedia'),
            'peminjaman_aktif' => Peminjaman::whereIn('laboratorium_id', $labIds)
                ->whereIn('status', ['disetujui', 'berlangsung', 'terlambat'])
                ->count(),
            'maintenance_berlangsung' => MaintenanceAlat::whereIn('laboratorium_id', $labIds)
                ->where('status', 'berlangsung')
                ->count(),
            'peminjaman_menunggu' => Peminjaman::whereIn('laboratorium_id', $labIds)
                ->where('status', 'menunggu_laboran')
                ->count(),
            'kerusakan_belum_selesai' => KerusakanAlat::whereHas('alat', fn ($q) => $q->whereIn('laboratorium_id', $labIds))
                ->whereNotIn('status', ['selesai', 'diabaikan'])
                ->count(),
        ];

        $trenPeminjaman = Peminjaman::selectRaw("{$monthColumn} as bulan, count(*) as total")
            ->whereIn('laboratorium_id', $labIds)
            ->whereDate('created_at', '>=', now()->subMonths(6))
            ->groupBy('bulan')
            ->orderBy('bulan')
            ->get()
            ->map(fn ($r) => ['bulan' => $r->bulan, 'total' => (int) $r->total]);

        $distribusiStatusAlat = Alat::whereIn('laboratorium_id', $labIds)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $distribusiStatusPeminjaman = Peminjaman::whereIn('laboratorium_id', $labIds)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $labs = Laboratorium::whereIn('id', $labIds)
            ->withCount('alats')
            ->withCount(['peminjamans as peminjaman_aktif_count' => fn ($q) => $q->whereIn('status', ['disetujui', 'berlangsung', 'terlambat'])])
            ->get();

        $peminjamanTerbaru = Peminjaman::whereIn('laboratorium_id', $labIds)
            ->with('user:id,nama_lengkap', 'laboratorium:id,nama')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        $kerusakanTerbaru = KerusakanAlat::whereHas('alat', fn ($q) => $q->whereIn('laboratorium_id', $labIds))
            ->with('alat:id,nama,kode')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        $maintenanceTerbaru = MaintenanceAlat::whereIn('laboratorium_id', $labIds)
            ->with('alat:id,nama,kode')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard/KepalaLab/Index', [
            'lab_ids' => $labIds,
            'metrics' => $metrics,
            'tren_peminjaman' => $trenPeminjaman,
            'distribusi_status_alat' => $distribusiStatusAlat,
            'distribusi_status_peminjaman' => $distribusiStatusPeminjaman,
            'labs' => $labs,
            'peminjaman_terbaru' => $peminjamanTerbaru,
            'kerusakan_terbaru' => $kerusakanTerbaru,
            'maintenance_terbaru' => $maintenanceTerbaru,
            'notifikasi_belum_dibaca' => Notifikasi::byUser(auth()->id())->unread()->count(),
        ]);
    }
}
