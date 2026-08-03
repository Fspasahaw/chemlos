<?php

namespace App\Http\Controllers\Pimpinan;

use App\Http\Controllers\Controller;
use App\Models\Laboratorium;
use App\Services\DetailDataService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LaboratoriumController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Laboratorium::class);

        $items = Laboratorium::withCount('alats')
            ->withCount(['laboratoriumPengelolas as kepala_lab_count' => fn ($q) => $q->where('peran', 'kepala_lab')])
            ->withCount(['laboratoriumPengelolas as laboran_count' => fn ($q) => $q->where('peran', 'laboran')])
            ->when($request->search, fn ($q, $s) => $q->where('nama', 'like', "%{$s}%"))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->lokasi, fn ($q, $s) => $q->where('lokasi', 'like', "%{$s}%"))
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Dashboard/Pimpinan/Laboratorium/Index', [
            'items' => $items,
            'filters' => $request->only('search', 'status', 'lokasi'),
        ]);
    }

    /**
     * @return \Inertia\Response
     */
    public function show(Laboratorium $laboratorium)
    {
        $this->authorize('view', $laboratorium);

        $laboratorium->load([
            'alats.kategoriAlat:id,nama,slug',
            'laboratoriumPengelolas.user:id,nama_lengkap',
            'laboratoriumGaleris' => fn ($q) => $q->orderBy('urutan'),
            'laboratoriumDokumens' => fn ($q) => $q->orderBy('urutan'),
            'laboratoriumTataTertibs' => fn ($q) => $q->orderBy('urutan'),
        ]);

        return Inertia::render('Dashboard/Pimpinan/Laboratorium/Show', [
            'item' => $laboratorium->toArray(),
            'events' => DetailDataService::eventsForLaboratorium($laboratorium),
            'riwayat' => DetailDataService::riwayatForLaboratorium($laboratorium),
        ]);
    }
}
