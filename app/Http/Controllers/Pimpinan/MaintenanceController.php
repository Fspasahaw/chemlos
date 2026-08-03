<?php

namespace App\Http\Controllers\Pimpinan;

use App\Http\Controllers\Controller;
use App\Models\Laboratorium;
use App\Models\MaintenanceAlat;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaintenanceController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', MaintenanceAlat::class);

        $query = MaintenanceAlat::with('alat:id,nama,kode', 'laboratorium:id,nama', 'laboran:id,nama_lengkap', 'kerusakan');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->laboratorium_id) {
            $query->where('laboratorium_id', $request->laboratorium_id);
        }

        return Inertia::render('Dashboard/Pimpinan/Maintenance/Index', [
            'items' => $query->orderByDesc('created_at')->paginate(12)->withQueryString(),
            'labs' => Laboratorium::orderBy('nama')->get(['id', 'nama']),
            'filters' => $request->only('status', 'laboratorium_id'),
        ]);
    }

    public function show(MaintenanceAlat $maintenance)
    {
        $this->authorize('view', $maintenance);

        $maintenance->load(['alat.laboratorium', 'laboratorium:id,nama', 'laboran:id,nama_lengkap', 'kerusakan']);

        return Inertia::render('Dashboard/Pimpinan/Maintenance/Show', [
            'item' => $maintenance->toArray(),
        ]);
    }
}
