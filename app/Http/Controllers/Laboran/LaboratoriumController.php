<?php

namespace App\Http\Controllers\Laboran;

use App\Http\Controllers\Controller;
use App\Models\KerusakanAlat;
use App\Models\Laboratorium;
use App\Models\LaboratoriumDokumen;
use App\Models\LaboratoriumGaleri;
use App\Models\LaboratoriumTataTertib;
use App\Models\MaintenanceAlat;
use App\Models\Peminjaman;
use App\Models\User;
use App\Services\DetailDataService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class LaboratoriumController extends Controller
{
    protected function labIds(): array
    {
        return \App\Models\LaboratoriumPengelola::where('user_id', auth()->id())
            ->pluck('laboratorium_id')
            ->toArray();
    }

    protected function viewNamespace(): string
    {
        return 'Dashboard/Laboran';
    }

    protected function routePrefix(): string
    {
        return 'laboran';
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

        return Inertia::render('Dashboard/Laboran/Laboratorium/Index', [
            'items' => $items,
            'filters' => $request->only('search', 'status'),
        ]);
    }

    public function show(Laboratorium $laboratorium)
    {
        $this->authorize('view', $laboratorium);

        if (! in_array($laboratorium->id, $this->labIds())) {
            abort(403);
        }

        $laboratorium->load([
            'alats.kategoriAlat:id,nama,slug',
            'laboratoriumPengelolas.user:id,nama_lengkap',
            'laboratoriumGaleris' => fn ($q) => $q->orderBy('urutan'),
            'laboratoriumDokumens' => fn ($q) => $q->orderBy('urutan'),
            'laboratoriumTataTertibs' => fn ($q) => $q->orderBy('urutan'),
        ]);

        return Inertia::render($this->viewNamespace().'/Laboratorium/Show', [
            'item' => $laboratorium->toArray(),
            'events' => DetailDataService::eventsForLaboratorium($laboratorium),
            'riwayat' => DetailDataService::riwayatForLaboratorium($laboratorium),
        ]);
    }

    protected function laboratoriumEditProps(Laboratorium $laboratorium): array
    {
        $laboratorium->load([
            'alats.kategoriAlat:id,nama,slug',
            'laboratoriumPengelolas.user:id,nama_lengkap',
            'laboratoriumGaleris' => fn ($q) => $q->orderBy('urutan'),
            'laboratoriumDokumens' => fn ($q) => $q->orderBy('urutan'),
            'laboratoriumTataTertibs' => fn ($q) => $q->orderBy('urutan'),
        ]);

        return [
            'item' => $laboratorium,
            'events' => \App\Services\DetailDataService::eventsForLaboratorium($laboratorium),
            'riwayat' => \App\Services\DetailDataService::riwayatForLaboratorium($laboratorium),
            'pengelola' => User::whereIn('status', ['approved'])->role(['laboran', 'kepala_lab', 'admin'])->get(['id', 'nama_lengkap', 'email']),
        ];
    }

    public function edit(Laboratorium $laboratorium)
    {
        $this->authorize('update', $laboratorium);

        return Inertia::render('Dashboard/Laboran/Laboratorium/Edit', $this->laboratoriumEditProps($laboratorium));
    }

    public function update(Request $request, Laboratorium $laboratorium)
    {
        $this->authorize('update', $laboratorium);

        $data = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'kode' => ['required', 'string', 'max:50', 'unique:laboratorium,kode,' . $laboratorium->id],
            'deskripsi' => ['nullable', 'string'],
            'lokasi' => ['required', 'string', 'max:255'],
            'gedung' => ['nullable', 'string', 'max:100'],
            'lantai' => ['nullable', 'string', 'max:50'],
            'ruangan' => ['nullable', 'string', 'max:50'],
            'kapasitas' => ['nullable', 'integer', 'min:0'],
            'jam_buka' => ['nullable', 'date_format:H:i'],
            'jam_tutup' => ['nullable', 'date_format:H:i'],
            'hari_operasional' => ['nullable', 'array'],
            'hari_operasional.*' => ['in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu'],
            'email' => ['nullable', 'email', 'max:255'],
            'telepon' => ['nullable', 'string', 'max:30'],
            'status' => ['required', 'in:aktif,nonaktif'],
            'foto_utama' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $data['slug'] = Str::slug($data['nama']);
        $data['hari_operasional'] = $data['hari_operasional'] ?? [];

        if ($request->hasFile('foto_utama')) {
            if ($laboratorium->foto_utama) {
                Storage::disk('public')->delete($laboratorium->foto_utama);
            }
            $data['foto_utama'] = $request->file('foto_utama')->store('laboratorium', 'public');
        } elseif ($request->boolean('remove_foto_utama')) {
            if ($laboratorium->foto_utama) {
                Storage::disk('public')->delete($laboratorium->foto_utama);
            }
            $data['foto_utama'] = null;
        } else {
            unset($data['foto_utama']);
        }

        $laboratorium->update($data);

        return redirect()->route($this->routePrefix() . '.laboratorium.index')->with('success', 'Laboratorium berhasil diperbarui.');
    }

    public function storeGaleri(Request $request, Laboratorium $laboratorium)
    {
        $this->authorize('update', $laboratorium);

        $request->validate([
            'file' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'judul' => ['nullable', 'string', 'max:255'],
        ]);

        $path = $request->file('file')->store('laboratorium/galeri', 'public');
        $laboratorium->laboratoriumGaleris()->create([
            'file' => $path,
            'judul' => $request->input('judul'),
            'urutan' => $laboratorium->laboratoriumGaleris()->count(),
        ]);

        return back()->with('success', 'Foto galeri berhasil ditambahkan.');
    }

    public function destroyGaleri(Laboratorium $laboratorium, LaboratoriumGaleri $galeri)
    {
        $this->authorize('update', $laboratorium);

        if ($galeri->laboratorium_id !== $laboratorium->id) {
            abort(404);
        }

        Storage::disk('public')->delete($galeri->file);
        $galeri->delete();

        return back()->with('success', 'Foto galeri berhasil dihapus.');
    }

    public function storeDokumen(Request $request, Laboratorium $laboratorium)
    {
        $this->authorize('update', $laboratorium);

        $request->validate([
            'file' => ['required', 'mimes:pdf', 'max:5120'],
            'judul' => ['required', 'string', 'max:255'],
        ]);

        $path = $request->file('file')->store('laboratorium/dokumen', 'public');
        $laboratorium->laboratoriumDokumens()->create([
            'file' => $path,
            'judul' => $request->input('judul'),
        ]);

        return back()->with('success', 'Dokumen berhasil diunggah.');
    }

    public function destroyDokumen(Laboratorium $laboratorium, LaboratoriumDokumen $dokumen)
    {
        $this->authorize('update', $laboratorium);

        if ($dokumen->laboratorium_id !== $laboratorium->id) {
            abort(404);
        }

        Storage::disk('public')->delete($dokumen->file);
        $dokumen->delete();

        return back()->with('success', 'Dokumen berhasil dihapus.');
    }

    public function reorderGaleri(Request $request, Laboratorium $laboratorium)
    {
        $this->authorize('update', $laboratorium);

        $data = $request->validate([
            'urutan' => ['required', 'array'],
            'urutan.*' => ['integer'],
        ]);

        foreach ($data['urutan'] as $index => $id) {
            LaboratoriumGaleri::where('id', $id)->where('laboratorium_id', $laboratorium->id)->update(['urutan' => $index + 1]);
        }

        return back()->with('success', 'Urutan galeri diperbarui.');
    }

    public function reorderDokumen(Request $request, Laboratorium $laboratorium)
    {
        $this->authorize('update', $laboratorium);

        $data = $request->validate([
            'urutan' => ['required', 'array'],
            'urutan.*' => ['integer'],
        ]);

        foreach ($data['urutan'] as $index => $id) {
            LaboratoriumDokumen::where('id', $id)->where('laboratorium_id', $laboratorium->id)->update(['urutan' => $index + 1]);
        }

        return back()->with('success', 'Urutan dokumen diperbarui.');
    }

    public function storeTataTertib(Request $request, Laboratorium $laboratorium)
    {
        $this->authorize('update', $laboratorium);

        if (! in_array($laboratorium->id, $this->labIds())) {
            abort(403);
        }

        $data = $request->validate(['isi' => ['required', 'string']]);

        $laboratorium->laboratoriumTataTertibs()->create([
            'isi' => $data['isi'],
            'urutan' => $laboratorium->laboratoriumTataTertibs()->count(),
        ]);

        return back()->with('success', 'Tata tertib berhasil ditambahkan.');
    }

    public function updateTataTertib(Request $request, Laboratorium $laboratorium, LaboratoriumTataTertib $tataTertib)
    {
        $this->authorize('update', $laboratorium);

        if ($tataTertib->laboratorium_id !== $laboratorium->id || ! in_array($laboratorium->id, $this->labIds())) {
            abort(404);
        }

        $data = $request->validate(['isi' => ['required', 'string']]);
        $tataTertib->update($data);

        return back()->with('success', 'Tata tertib berhasil diperbarui.');
    }

    public function destroyTataTertib(Laboratorium $laboratorium, LaboratoriumTataTertib $tataTertib)
    {
        $this->authorize('update', $laboratorium);

        if ($tataTertib->laboratorium_id !== $laboratorium->id || ! in_array($laboratorium->id, $this->labIds())) {
            abort(404);
        }

        $tataTertib->delete();

        return back()->with('success', 'Tata tertib berhasil dihapus.');
    }

    public function reorderTataTertib(Request $request, Laboratorium $laboratorium)
    {
        $this->authorize('update', $laboratorium);

        if (! in_array($laboratorium->id, $this->labIds())) {
            abort(403);
        }

        $data = $request->validate([
            'urutan' => ['required', 'array'],
            'urutan.*' => ['integer'],
        ]);

        foreach ($data['urutan'] as $index => $id) {
            LaboratoriumTataTertib::where('id', $id)->where('laboratorium_id', $laboratorium->id)->update(['urutan' => $index + 1]);
        }

        return back()->with('success', 'Urutan tata tertib diperbarui.');
    }
}
