<?php

namespace App\Http\Controllers\Pimpinan;

use App\Http\Controllers\Controller;
use App\Models\ProgramStudi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgramStudiController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', ProgramStudi::class);

        $items = ProgramStudi::withCount(['users as mahasiswa_count' => fn ($q) => $q->whereHas('roles', fn ($r) => $r->where('name', 'mahasiswa'))])
            ->when($request->search, fn ($q, $s) => $q->where('nama', 'like', "%{$s}%"))
            ->when($request->jenjang, fn ($q, $j) => $q->where('jenjang', $j))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Dashboard/Pimpinan/ProgramStudi/Index', [
            'items' => $items,
            'filters' => $request->only('search', 'jenjang', 'status'),
            'ketua_prodi' => [
                'program_studi_id' => auth()->user()->program_studi_id,
                'jabatan_pimpinan' => auth()->user()->jabatan_pimpinan,
            ],
        ]);
    }

    public function show(ProgramStudi $programStudi)
    {
        $this->authorize('view', $programStudi);

        return Inertia::render('Dashboard/Pimpinan/ProgramStudi/Show', [
            'item' => $programStudi->loadCount(['users as mahasiswa_count' => fn ($q) => $q->whereHas('roles', fn ($r) => $r->where('name', 'mahasiswa'))]),
        ]);
    }

    public function edit(ProgramStudi $programStudi)
    {
        $this->authorize('update', $programStudi);

        return Inertia::render('Dashboard/Pimpinan/ProgramStudi/Edit', [
            'item' => $programStudi,
        ]);
    }

    public function update(Request $request, ProgramStudi $programStudi)
    {
        $this->authorize('update', $programStudi);

        $data = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'kode' => ['required', 'string', 'max:50'],
            'jenjang' => ['required', 'in:D3,S1,S2,S3,Profesi'],
            'status' => ['required', 'in:aktif,nonaktif'],
            'deskripsi' => ['nullable', 'string', 'max:1000'],
        ]);

        $programStudi->update($data);

        return redirect()->route('pimpinan.program-studi.index')->with('success', 'Program studi berhasil diperbarui.');
    }
}
