<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\KerusakanAlat;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KerusakanController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', KerusakanAlat::class);

        $query = KerusakanAlat::with('alat:id,nama,kode', 'pelapor:id,nama_lengkap', 'peminjaman.user:id,nama_lengkap')
            ->whereHas('peminjaman', fn ($q) => $q->where('dosen_pembimbing_id', auth()->id()));

        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('alat', fn ($qq) => $qq->where('nama', 'like', "%{$search}%"))
                    ->orWhereHas('alat', fn ($qq) => $qq->where('kode', 'like', "%{$search}%"))
                    ->orWhereHas('peminjaman', fn ($qq) => $qq->where('kode', 'like', "%{$search}%"));
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->kondisi) {
            $query->where('kondisi', $request->kondisi);
        }

        return Inertia::render('Dashboard/Dosen/Kerusakan/Index', [
            'items' => $query->orderByDesc('created_at')->paginate(12)->withQueryString(),
            'filters' => $request->only('search', 'status', 'kondisi'),
        ]);
    }

    public function show(KerusakanAlat $kerusakan)
    {
        $this->authorize('view', $kerusakan);

        $kerusakan->load(['alat.laboratorium', 'pelapor:id,nama_lengkap', 'peminjaman:id,kode', 'maintenance']);

        return Inertia::render('Dashboard/Dosen/Kerusakan/Show', [
            'item' => $kerusakan->toArray(),
        ]);
    }
}
