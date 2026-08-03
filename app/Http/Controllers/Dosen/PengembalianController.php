<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\Peminjaman;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PengembalianController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Peminjaman::class);

        $statuses = ['berlangsung', 'terlambat', 'selesai'];

        $items = Peminjaman::with('user:id,nama_lengkap', 'laboratorium:id,nama', 'pengembalian', 'details.alat:id,nama,kode')
            ->where('dosen_pembimbing_id', auth()->id())
            ->whereIn('status', $statuses)
            ->when($request->status && in_array($request->status, $statuses), fn ($q, $s) => $q->where('status', $s))
            ->when($request->search, fn ($q, $s) => $q->whereHas('user', fn ($qq) => $qq->where('nama_lengkap', 'like', "%{$s}%")))
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Dashboard/Dosen/Pengembalian/Index', [
            'items' => $items,
            'filters' => $request->only('status', 'search'),
        ]);
    }
}
