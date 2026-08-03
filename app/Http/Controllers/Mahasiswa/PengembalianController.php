<?php

namespace App\Http\Controllers\Mahasiswa;

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

        $items = Peminjaman::with('laboratorium:id,nama', 'pengembalian', 'details.alat:id,nama,kode')
            ->where('user_id', auth()->id())
            ->whereIn('status', $statuses)
            ->when($request->status && in_array($request->status, $statuses), fn ($q, $s) => $q->where('status', $s))
            ->when($request->search, fn ($q, $s) => $q->where('kode', 'like', "%{$s}%"))
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Dashboard/Mahasiswa/Pengembalian/Index', [
            'items' => $items,
            'filters' => $request->only('status', 'search'),
        ]);
    }
}
