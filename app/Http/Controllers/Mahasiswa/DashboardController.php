<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Notifikasi;
use App\Models\Peminjaman;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        $metrics = [
            'peminjaman_aktif' => Peminjaman::where('user_id', $userId)
                ->whereIn('status', ['disetujui', 'berlangsung', 'terlambat'])
                ->count(),
            'peminjaman_menunggu' => Peminjaman::where('user_id', $userId)
                ->whereIn('status', ['diajukan', 'menunggu_dosen', 'menunggu_laboran'])
                ->count(),
            'peminjaman_selesai' => Peminjaman::where('user_id', $userId)
                ->whereIn('status', ['selesai'])
                ->count(),
            'notifikasi_belum_dibaca' => Notifikasi::byUser($userId)->unread()->count(),
            'denda_tertunggak' => (float) Peminjaman::where('user_id', $userId)
                ->whereHas('pengembalian', fn ($q) => $q->whereColumn('total_denda', '>', 'denda_dibayar'))
                ->withSum('pengembalian as total_tunggak', DB::raw('total_denda - denda_dibayar'))
                ->get()
                ->sum('total_tunggak'),
        ];

        $monthColumn = DB::getDriverName() === 'sqlite' ? "strftime('%Y-%m', created_at)" : "DATE_FORMAT(created_at, '%Y-%m')";
        $trenBulanan = Peminjaman::selectRaw("{$monthColumn} as bulan, count(*) as total")
            ->where('user_id', $userId)
            ->whereDate('created_at', '>=', now()->subMonths(6))
            ->groupBy('bulan')
            ->orderBy('bulan')
            ->get()
            ->map(fn ($r) => ['bulan' => $r->bulan, 'total' => (int) $r->total]);

        $statusPeminjaman = Peminjaman::where('user_id', $userId)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $peminjamanTerbaru = Peminjaman::where('user_id', $userId)
            ->with('laboratorium:id,nama', 'details.alat:id,nama,kode')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard/Mahasiswa/Index', [
            'metrics' => $metrics,
            'tren_bulanan' => $trenBulanan,
            'status_peminjaman' => $statusPeminjaman,
            'peminjaman_terbaru' => $peminjamanTerbaru,
            'notifikasi_terbaru' => Notifikasi::byUser($userId)
                ->orderByDesc('created_at')
                ->limit(5)
                ->get(),
        ]);
    }
}
