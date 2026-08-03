<?php

namespace App\Http\Controllers\Pimpinan;

use App\Http\Controllers\Controller;
use App\Models\Peminjaman;
use App\Models\PeminjamanStatusLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        return Inertia::render('Dashboard/Pimpinan/Pengguna/Index', [
            'items' => User::with('roles:id,name')
                ->when($request->search, fn ($q, $s) => $q->where(function ($qq) use ($s) {
                    $qq->where('nama_lengkap', 'like', "%{$s}%")
                        ->orWhere('email', 'like', "%{$s}%")
                        ->orWhere('npm_nip', 'like', "%{$s}%");
                }))
                ->when($request->status, fn ($q, $s) => $q->where('status', $s))
                ->when($request->role, fn ($q, $r) => $q->role($r))
                ->orderByDesc('created_at')
                ->paginate(12)
                ->withQueryString(),
            'filters' => $request->only('search', 'status', 'role'),
            'roles' => Role::orderBy('name')->pluck('name'),
        ]);
    }

    public function show(User $user)
    {
        $this->authorize('view', $user);

        $riwayat = [
            'peminjaman' => Peminjaman::with('laboratorium:id,nama', 'details.alat:id,nama')
                ->where('user_id', $user->id)
                ->latest()
                ->limit(20)
                ->get(),
            'persetujuan' => PeminjamanStatusLog::with('peminjaman.user:id,nama_lengkap', 'peminjaman.laboratorium:id,nama')
                ->where('user_id', $user->id)
                ->whereIn('status_ke', ['menunggu_laboran', 'disetujui'])
                ->latest()
                ->limit(20)
                ->get(),
            'aktivitas' => Activity::where('causer_type', User::class)->where('causer_id', $user->id)->latest()->limit(20)->get(),
        ];

        return Inertia::render('Dashboard/Pimpinan/Pengguna/Show', [
            'item' => $user->load('roles:id,name', 'programStudi:id,nama', 'laboratoriumPengelolas.laboratorium:id,nama'),
            'riwayat' => $riwayat,
        ]);
    }
}
