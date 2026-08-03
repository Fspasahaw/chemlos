<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\KerusakanAlat;
use App\Models\Notifikasi;
use App\Models\Peminjaman;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $peminjamanQuery = Peminjaman::where('dosen_pembimbing_id', auth()->id());

        $totalMahasiswaBimbingan = (clone $peminjamanQuery)
            ->selectRaw('count(distinct user_id) as total')
            ->value('total') ?? 0;

        $metrics = [
            'total_mahasiswa_bimbingan' => (int) $totalMahasiswaBimbingan,
            'peminjaman_aktif_bimbingan' => Peminjaman::where('dosen_pembimbing_id', auth()->id())
                ->whereIn('status', ['disetujui', 'berlangsung', 'terlambat'])
                ->count(),
            'peminjaman_menunggu_persetujuan' => Peminjaman::where('dosen_pembimbing_id', auth()->id())
                ->where('status', 'menunggu_dosen')
                ->count(),
            'kerusakan_terkait_bimbingan' => KerusakanAlat::whereHas('peminjaman', fn ($q) => $q->where('dosen_pembimbing_id', auth()->id()))
                ->whereNotIn('status', ['selesai', 'diabaikan'])
                ->count(),
            'pengembalian_jatuh_tempo' => Peminjaman::where('dosen_pembimbing_id', auth()->id())
                ->whereIn('status', ['disetujui', 'berlangsung', 'terlambat'])
                ->whereDate('tanggal_selesai', '<=', now()->addDays(1))
                ->count(),
        ];

        $monthColumn = DB::getDriverName() === 'sqlite' ? "strftime('%Y-%m', created_at)" : "DATE_FORMAT(created_at, '%Y-%m')";
        $trenPeminjaman = Peminjaman::selectRaw("{$monthColumn} as bulan, count(*) as total")
            ->where('dosen_pembimbing_id', auth()->id())
            ->whereDate('created_at', '>=', now()->subMonths(6))
            ->groupBy('bulan')
            ->orderBy('bulan')
            ->get()
            ->map(fn ($r) => ['bulan' => $r->bulan, 'total' => (int) $r->total]);

        $statusPeminjaman = Peminjaman::where('dosen_pembimbing_id', auth()->id())
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $distribusiLab = Peminjaman::where('dosen_pembimbing_id', auth()->id())
            ->selectRaw('laboratorium_id, count(*) as total')
            ->with('laboratorium:id,nama')
            ->groupBy('laboratorium_id')
            ->get()
            ->map(fn ($r) => ['label' => $r->laboratorium?->nama ?? 'Tidak diketahui', 'total' => (int) $r->total]);

        $peminjamanMenunggu = Peminjaman::where('dosen_pembimbing_id', auth()->id())
            ->where('status', 'menunggu_dosen')
            ->with('user:id,nama_lengkap,npm_nip', 'laboratorium:id,nama', 'details.alat:id,nama,kode')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        $pengembalianTerbaru = Peminjaman::where('dosen_pembimbing_id', auth()->id())
            ->whereHas('pengembalian')
            ->with('user:id,nama_lengkap,npm_nip', 'laboratorium:id,nama', 'details.alat:id,nama,kode', 'pengembalian:id,peminjaman_id,total_denda,waktu_pengembalian')
            ->orderByDesc('tanggal_selesai')
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard/Dosen/Index', [
            'metrics' => $metrics,
            'tren_peminjaman' => $trenPeminjaman,
            'status_peminjaman' => $statusPeminjaman,
            'distribusi_lab' => $distribusiLab,
            'peminjaman_menunggu' => $peminjamanMenunggu,
            'pengembalian_terbaru' => $pengembalianTerbaru,
            'notifikasi_belum_dibaca' => Notifikasi::byUser(auth()->id())->unread()->count(),
        ]);
    }
}
