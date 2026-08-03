<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProgramStudi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgramStudiController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', ProgramStudi::class);

        return Inertia::render('Dashboard/Admin/ProgramStudi/Index', [
            'items' => ProgramStudi::withCount(['users as mahasiswa_count' => fn ($q) => $q->whereHas('roles', fn ($r) => $r->where('name', 'mahasiswa'))])
                ->when($request->search, fn ($q, $s) => $q->where('nama', 'like', "%{$s}%"))
                ->when($request->jenjang, fn ($q, $j) => $q->where('jenjang', $j))
                ->when($request->status, fn ($q, $s) => $q->where('status', $s))
                ->orderByDesc('created_at')
                ->paginate(12)
                ->withQueryString(),
            'filters' => $request->only('search', 'jenjang', 'status'),
        ]);
    }

    public function create()
    {
        $this->authorize('create', ProgramStudi::class);

        return Inertia::render('Dashboard/Admin/ProgramStudi/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('create', ProgramStudi::class);
        $data = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'jenjang' => ['required', 'in:D3,S1,S2,S3,Profesi'],
            'kode' => ['required', 'string', 'max:50', 'unique:program_studi,kode'],
            'status' => ['required', 'in:aktif,nonaktif'],
            'deskripsi' => ['nullable', 'string'],
        ]);

        ProgramStudi::create($data);

        return redirect()->route('admin.program-studi.index')->with('success', 'Program studi berhasil ditambahkan.');
    }

    public function show(ProgramStudi $programStudi)
    {
        $this->authorize('view', $programStudi);

        return Inertia::render('Dashboard/Admin/ProgramStudi/Show', [
            'item' => $programStudi->load(['users' => fn ($q) => $q->with('roles')->orderBy('nama_lengkap')]),
        ]);
    }

    public function edit(ProgramStudi $programStudi)
    {
        $this->authorize('update', $programStudi);

        return Inertia::render('Dashboard/Admin/ProgramStudi/Edit', [
            'item' => $programStudi,
        ]);
    }

    public function update(Request $request, ProgramStudi $programStudi)
    {
        $this->authorize('update', $programStudi);
        $data = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'jenjang' => ['required', 'in:D3,S1,S2,S3,Profesi'],
            'kode' => ['required', 'string', 'max:50', 'unique:program_studi,kode,' . $programStudi->id],
            'status' => ['required', 'in:aktif,nonaktif'],
            'deskripsi' => ['nullable', 'string'],
        ]);

        $programStudi->update($data);

        return redirect()->route('admin.program-studi.index')->with('success', 'Program studi berhasil diperbarui.');
    }

    public function destroy(ProgramStudi $programStudi)
    {
        $this->authorize('delete', $programStudi);

        $programStudi->delete();

        return back()->with('success', 'Program studi berhasil dihapus.');
    }
}
