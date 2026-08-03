<?php

namespace App\Http\Controllers\Pimpinan;

use App\Http\Controllers\Controller;
use App\Models\Alat;
use App\Models\KategoriAlat;
use App\Models\Laboratorium;
use App\Services\DetailDataService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AlatController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Alat::class);

        $items = Alat::with('laboratorium:id,nama,slug', 'kategoriAlat:id,nama,slug')
            ->when($request->search, fn ($q, $s) => $q->where('nama', 'like', "%{$s}%"))
            ->when($request->laboratorium, fn ($q, $id) => $q->where('laboratorium_id', $id))
            ->when($request->kategori, fn ($q, $id) => $q->where('kategori_id', $id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->kondisi, fn ($q, $s) => $q->where('kondisi', $s))
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Dashboard/Pimpinan/Alat/Index', [
            'items' => $items,
            'filters' => $request->only('search', 'laboratorium', 'kategori', 'status', 'kondisi'),
            'labs' => Laboratorium::orderBy('nama')->pluck('nama', 'id'),
            'kategoris' => KategoriAlat::orderBy('nama')->pluck('nama', 'id'),
        ]);
    }

    /**
     * @return \Inertia\Response
     */
    public function show(Alat $alat)
    {
        $this->authorize('view', $alat);

        $alat->load([
            'laboratorium',
            'kategoriAlat:id,nama',
            'alatGaleris',
            'alatDokumens',
            'videoTutorials' => fn ($q) => $q->where('status', 'aktif'),
        ]);

        return Inertia::render('Dashboard/Pimpinan/Alat/Show', [
            'item' => $alat->toArray(),
            'events' => DetailDataService::eventsForAlat($alat),
            'riwayat' => DetailDataService::riwayatForAlat($alat),
        ]);
    }
}
