<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\KategoriAlat;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class KategoriAlatController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', KategoriAlat::class);

        return Inertia::render('Dashboard/Admin/KategoriAlat/Index', [
            'items' => KategoriAlat::withCount('alats')
                ->when($request->search, fn ($q, $s) => $q->where('nama', 'like', "%{$s}%"))
                ->orderByDesc('created_at')
                ->paginate(12)
                ->withQueryString(),
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        $this->authorize('create', KategoriAlat::class);

        return Inertia::render('Dashboard/Admin/KategoriAlat/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('create', KategoriAlat::class);

        $data = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'kode' => ['required', 'string', 'max:50', 'unique:kategori_alat,kode'],
            'deskripsi' => ['nullable', 'string'],
            'status' => ['required', 'in:aktif,nonaktif'],
        ]);

        $data['slug'] = Str::slug($data['nama']);
        KategoriAlat::create($data);

        return redirect()->route('admin.kategori-alat.index')->with('success', 'Kategori alat berhasil ditambahkan.');
    }

    public function show(KategoriAlat $kategoriAlat)
    {
        $this->authorize('view', $kategoriAlat);

        return Inertia::render('Dashboard/Admin/KategoriAlat/Show', [
            'item' => $kategoriAlat->load(['alats' => fn ($q) => $q->with('laboratorium:id,nama')->latest()->limit(50)]),
        ]);
    }

    public function edit(KategoriAlat $kategoriAlat)
    {
        $this->authorize('update', $kategoriAlat);

        return Inertia::render('Dashboard/Admin/KategoriAlat/Edit', [
            'item' => $kategoriAlat,
        ]);
    }

    public function update(Request $request, KategoriAlat $kategoriAlat)
    {
        $this->authorize('update', $kategoriAlat);

        $data = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'kode' => ['required', 'string', 'max:50', 'unique:kategori_alat,kode,' . $kategoriAlat->id],
            'deskripsi' => ['nullable', 'string'],
            'status' => ['required', 'in:aktif,nonaktif'],
        ]);

        $data['slug'] = Str::slug($data['nama']);
        $kategoriAlat->update($data);

        return redirect()->route('admin.kategori-alat.index')->with('success', 'Kategori alat berhasil diperbarui.');
    }

    public function destroy(KategoriAlat $kategoriAlat)
    {
        $this->authorize('delete', $kategoriAlat);

        $kategoriAlat->delete();

        return back()->with('success', 'Kategori alat berhasil dihapus.');
    }
}
