<?php

namespace App\Http\Controllers\KepalaLab;

use App\Http\Controllers\Laboran\LaboratoriumController as BaseController;
use App\Models\Laboratorium;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LaboratoriumController extends BaseController
{
    protected function viewNamespace(): string
    {
        return 'Dashboard/KepalaLab';
    }

    protected function routePrefix(): string
    {
        return 'kepala-lab';
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Laboratorium::class);

        $items = Laboratorium::whereIn('id', $this->labIds())
            ->when($request->search, fn ($q, $s) => $q->where('nama', 'like', "%{$s}%"))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Dashboard/KepalaLab/Laboratorium/Index', [
            'items' => $items,
            'filters' => $request->only('search', 'status'),
        ]);
    }

    public function edit(Laboratorium $laboratorium)
    {
        $this->authorize('update', $laboratorium);

        return Inertia::render('Dashboard/KepalaLab/Laboratorium/Edit', $this->laboratoriumEditProps($laboratorium));
    }
}
