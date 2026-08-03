<?php

namespace App\Http\Controllers\Pimpinan;

use App\Http\Controllers\Controller;
use App\Models\Peminjaman;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PengembalianController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Peminjaman::class);

        $items = Peminjaman::with('user:id,nama_lengkap,npm_nip', 'laboratorium:id,nama', 'details.alat:id,nama,kode', 'pengembalian:id,peminjaman_id,waktu_pengembalian,total_denda,denda_dibayar')
            ->whereIn('status', ['selesai', 'terlambat'])
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->search, fn ($q, $s) => $q->where('kode', 'like', "%{$s}%"))
            ->orderByDesc('updated_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Dashboard/Pimpinan/Pengembalian/Index', [
            'items' => $items,
            'filters' => $request->only('status', 'search'),
        ]);
    }

    public function show(Peminjaman $peminjaman)
    {
        $this->authorize('view', $peminjaman);

        return Inertia::render('Dashboard/Pimpinan/Pengembalian/Show', [
            'peminjaman' => $peminjaman->load('user:id,nama_lengkap,npm_nip', 'laboratorium:id,nama', 'details.alat:id,nama,kode', 'pengembalian.laboran:id,nama_lengkap'),
        ]);
    }
}
