<?php

namespace App\Http\Controllers\Pimpinan;

use App\Http\Controllers\Controller;
use App\Models\Peminjaman;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PeminjamanController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Peminjaman::class);

        $items = Peminjaman::with('user:id,nama_lengkap,npm_nip', 'laboratorium:id,nama', 'details.alat:id,nama,kode')
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->search, fn ($q, $s) => $q->where('kode', 'like', "%{$s}%"))
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Dashboard/Pimpinan/Peminjaman/Index', [
            'items' => $items,
            'filters' => $request->only('status', 'search'),
        ]);
    }

    public function show(Peminjaman $peminjaman)
    {
        $this->authorize('view', $peminjaman);

        return Inertia::render('Dashboard/Peminjaman/Show', [
            'peminjaman' => $peminjaman->load([
                'user:id,nama_lengkap,npm_nip,email',
                'dosenPembimbing:id,nama_lengkap,email',
                'laboratorium:id,nama,slug,lokasi',
                'details.alat:id,nama,kode,stok_total',
                'statusLogs.user:id,nama_lengkap',
                'serahTerima',
                'pengembalian',
                'kerusakanAlats',
            ]),
            'role' => 'pimpinan',
        ]);
    }
}
