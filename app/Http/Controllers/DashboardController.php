<?php

namespace App\Http\Controllers;

use App\Models\Alat;
use App\Models\Laboratorium;
use App\Models\MaintenanceAlat;
use App\Models\Peminjaman;
use App\Models\PeminjamanDetail;
use App\Models\PeminjamanStatusLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if (! $user) {
            return redirect('/login');
        }

        return redirect($user->getDashboardRoute());
    }

    public function admin()
    {
        if (! auth()->user()?->hasRole('admin')) {
            abort(403);
        }

        return $this->adminDashboard();
    }

    private function adminDashboard()
    {
        $metrics = [
            'total_pengguna' => User::count(),
            'peminjaman_aktif' => Peminjaman::whereIn('status', ['disetujui', 'berlangsung', 'terlambat'])->count(),
            'alat_tersedia' => Alat::where('status', 'tersedia')->count(),
            'laboratorium_aktif' => Laboratorium::where('status', 'aktif')->count(),
            'pendaftaran_menunggu' => User::whereIn('status', ['pending_email', 'pending_approval'])->count(),
            'maintenance_berlangsung' => MaintenanceAlat::whereIn('status', ['dijadwalkan', 'berlangsung'])->count(),
        ];

        $monthColumn = DB::getDriverName() === 'sqlite' ? "strftime('%Y-%m', created_at)" : "DATE_FORMAT(created_at, '%Y-%m')";
        $trenPeminjaman = Peminjaman::selectRaw("{$monthColumn} as bulan, count(*) as total")
            ->whereDate('created_at', '>=', now()->subMonths(6)->startOfMonth())
            ->groupBy('bulan')
            ->orderBy('bulan')
            ->get()
            ->map(fn ($row) => ['bulan' => $row->bulan, 'total' => (int) $row->total]);

        $statusCounts = Peminjaman::selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $distribusiLab = Peminjaman::selectRaw('laboratorium_id, count(*) as total')
            ->with('laboratorium:id,nama')
            ->groupBy('laboratorium_id')
            ->get()
            ->map(fn ($row) => ['label' => $row->laboratorium?->nama ?? 'Tidak diketahui', 'total' => (int) $row->total]);

        $alatPopuler = PeminjamanDetail::selectRaw('alat_id, sum(jumlah) as total')
            ->with('alat:id,nama')
            ->groupBy('alat_id')
            ->orderByDesc('total')
            ->limit(6)
            ->get()
            ->map(fn ($row) => ['label' => $row->alat?->nama ?? 'Tidak diketahui', 'total' => (int) $row->total]);

        $pendingUsers = User::whereIn('status', ['pending_email', 'pending_approval'])
            ->with('roles:id,name')
            ->latest()
            ->limit(5)
            ->get();

        $recentPeminjaman = Peminjaman::with('user:id,nama_lengkap', 'laboratorium:id,nama')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($p) => [
                'kode' => $p->kode,
                'peminjam' => $p->user?->nama_lengkap ?? 'Tidak diketahui',
                'laboratorium' => $p->laboratorium?->nama ?? '-',
                'status' => $p->status,
                'created_at' => $p->created_at->diffForHumans(),
            ]);

        $recentActivities = PeminjamanStatusLog::with('peminjaman:kode', 'user:id,nama_lengkap')
            ->latest()
            ->limit(8)
            ->get()
            ->map(function ($log) {
                $userName = $log->user?->nama_lengkap ?? 'Sistem';
                $kode = $log->peminjaman?->kode ?? '';
                return [
                    'description' => "{$userName}: {$log->status_dari} → {$log->status_ke} pada peminjaman {$kode}",
                    'created_at' => $log->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('Dashboard/Admin/Index', [
            'role' => 'admin',
            'metrics' => $metrics,
            'trenPeminjaman' => $trenPeminjaman,
            'statusCounts' => $statusCounts,
            'distribusiLab' => $distribusiLab,
            'alatPopuler' => $alatPopuler,
            'pendingUsers' => $pendingUsers,
            'recentPeminjaman' => $recentPeminjaman,
            'recentActivities' => $recentActivities,
        ]);
    }

    public function switchRole(Request $request)
    {
        $user = auth()->user();

        if (! $user) {
            return redirect('/login');
        }

        $data = $request->validate([
            'role' => ['required', 'string', Rule::in($user->roles->pluck('name')->toArray())],
        ]);

        $user->setActiveRole($data['role']);

        return redirect($user->getDashboardRoute($data['role']));
    }
}
