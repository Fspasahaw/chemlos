<?php

namespace App\Http\Controllers\Pimpinan;

use App\Http\Controllers\Controller;
use App\Models\KerusakanAlat;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KerusakanController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', KerusakanAlat::class);

        $query = KerusakanAlat::with('alat:id,nama,kode,laboratorium_id', 'alat.laboratorium:id,nama', 'pelapor:id,nama_lengkap', 'maintenance');

        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('alat', fn ($qq) => $qq->where('nama', 'like', "%{$search}%"))
                    ->orWhereHas('alat', fn ($qq) => $qq->where('kode', 'like', "%{$search}%"))
                    ->orWhereHas('peminjaman', fn ($qq) => $qq->where('kode', 'like', "%{$search}%"))
                    ->orWhereHas('pelapor', fn ($qq) => $qq->where('nama_lengkap', 'like', "%{$search}%"));
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->kondisi) {
            $query->where('kondisi', $request->kondisi);
        }

        if ($request->laboratorium_id) {
            $query->whereHas('alat', fn ($q) => $q->where('laboratorium_id', $request->laboratorium_id));
        }

        return Inertia::render('Dashboard/Pimpinan/Kerusakan/Index', [
            'items' => $query->orderByDesc('created_at')->paginate(12)->withQueryString(),
            'filters' => $request->only('search', 'status', 'kondisi', 'laboratorium_id'),
        ]);
    }

    public function show(KerusakanAlat $kerusakan)
    {
        $this->authorize('view', $kerusakan);

        $kerusakan->load(['alat.laboratorium', 'pelapor:id,nama_lengkap', 'peminjaman:id,kode', 'maintenance']);

        return Inertia::render('Dashboard/Pimpinan/Kerusakan/Show', [
            'item' => $kerusakan->toArray(),
        ]);
    }
}
