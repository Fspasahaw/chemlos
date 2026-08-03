<?php

namespace App\Http\Controllers\Pimpinan;

use App\Http\Controllers\Controller;
use App\Models\Alat;
use App\Models\KerusakanAlat;
use App\Models\Laboratorium;
use App\Models\MaintenanceAlat;
use App\Models\Notifikasi;
use App\Models\Peminjaman;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class DashboardController extends Controller
{
    public function index()
    {
        $activeLabIds = Laboratorium::where('status', 'aktif')->pluck('id');

        $metrics = [
            'total_pengguna' => User::count(),
            'peminjaman_aktif' => Peminjaman::whereIn('status', ['disetujui', 'berlangsung', 'terlambat'])->count(),
            'alat_tersedia' => Alat::sum('stok_tersedia'),
            'laboratorium_aktif' => Laboratorium::where('status', 'aktif')->count(),
            'pendaftaran_menunggu' => User::whereIn('status', ['pending_email', 'pending_approval'])->count(),
            'peminjaman_menunggu' => Peminjaman::whereIn('status', ['menunggu_dosen', 'menunggu_laboran'])->count(),
            'maintenance_berlangsung' => MaintenanceAlat::where('status', 'berlangsung')->count(),
        ];

        $monthColumn = DB::getDriverName() === 'sqlite' ? "strftime('%Y-%m', created_at)" : "DATE_FORMAT(created_at, '%Y-%m')";
        $trenPeminjaman = Peminjaman::selectRaw("{$monthColumn} as bulan, count(*) as total")
            ->whereDate('created_at', '>=', now()->subMonths(6))
            ->groupBy('bulan')
            ->orderBy('bulan')
            ->get()
            ->map(fn ($r) => ['bulan' => $r->bulan, 'total' => (int) $r->total]);

        $distribusiLab = Peminjaman::selectRaw('laboratorium_id, count(*) as total')
            ->whereIn('laboratorium_id', $activeLabIds)
            ->with('laboratorium:id,nama')
            ->groupBy('laboratorium_id')
            ->get()
            ->map(fn ($r) => ['label' => $r->laboratorium?->nama ?? 'Tidak diketahui', 'total' => (int) $r->total]);

        $statusPeminjaman = Peminjaman::selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $peminjamanTerbaru = Peminjaman::with('user:id,nama_lengkap', 'laboratorium:id,nama')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'kode' => $p->kode,
                'peminjam' => $p->user?->nama_lengkap ?? 'Tidak diketahui',
                'laboratorium' => $p->laboratorium?->nama ?? '-',
                'status' => $p->status,
                'tanggal_mulai' => $p->tanggal_mulai?->toDateString(),
                'tanggal_selesai' => $p->tanggal_selesai?->toDateString(),
            ]);

        $pendaftaranMenunggu = User::with('roles:id,name')
            ->whereIn('status', ['pending_email', 'pending_approval'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'nama_lengkap' => $u->nama_lengkap,
                'email' => $u->email,
                'status' => $u->status,
                'roles' => $u->roles->pluck('name')->implode(', '),
                'created_at' => $u->created_at?->toDateTimeString(),
            ]);

        $aktivitasTerbaru = Activity::with('causer:id,nama_lengkap')
            ->where('causer_type', User::class)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'user' => $a->causer?->nama_lengkap ?? 'Sistem',
                'description' => $a->description,
                'created_at' => $a->created_at?->toDateTimeString(),
            ]);

        $kerusakanBelumSelesai = KerusakanAlat::whereNotIn('status', ['selesai', 'diabaikan'])->count();

        $notifikasiBelumDibaca = Notifikasi::byUser(auth()->id())->unread()->count();

        return Inertia::render('Dashboard/Pimpinan/Index', [
            'metrics' => $metrics,
            'tren_peminjaman' => $trenPeminjaman,
            'distribusi_lab' => $distribusiLab,
            'status_peminjaman' => $statusPeminjaman,
            'peminjaman_terbaru' => $peminjamanTerbaru,
            'pendaftaran_menunggu' => $pendaftaranMenunggu,
            'aktivitas_terbaru' => $aktivitasTerbaru,
            'kerusakan_belum_selesai' => $kerusakanBelumSelesai,
            'notifikasi_belum_dibaca' => $notifikasiBelumDibaca,
        ]);
    }
}
