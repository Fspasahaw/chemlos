<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\KerusakanAlat;
use App\Models\Laboratorium;
use App\Models\LaboratoriumDokumen;
use App\Models\LaboratoriumGaleri;
use App\Models\LaboratoriumTataTertib;
use App\Models\MaintenanceAlat;
use App\Models\Peminjaman;
use App\Models\Pengembalian;
use App\Models\User;
use App\Services\DetailDataService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class LaboratoriumController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Laboratorium::class);

        return Inertia::render('Dashboard/Admin/Laboratorium/Index', [
            'items' => Laboratorium::withCount('alats')
                ->withCount(['laboratoriumPengelolas as kepala_lab_count' => fn ($q) => $q->where('peran', 'kepala_lab')])
                ->withCount(['laboratoriumPengelolas as laboran_count' => fn ($q) => $q->where('peran', 'laboran')])
                ->when($request->search, fn ($q, $s) => $q->where('nama', 'like', "%{$s}%"))
                ->when($request->status, fn ($q, $s) => $q->where('status', $s))
                ->orderByDesc('created_at')
                ->paginate(12)
                ->withQueryString(),
            'filters' => $request->only('search', 'status'),
        ]);
    }

    public function create()
    {
        $this->authorize('create', Laboratorium::class);

        return Inertia::render('Dashboard/Admin/Laboratorium/Create', [
            'pengelola' => User::whereIn('status', ['approved'])->role(['laboran', 'kepala_lab', 'admin'])->get(['id', 'nama_lengkap', 'email']),
        ]);
    }

    public function show(Laboratorium $laboratorium)
    {
        $this->authorize('view', $laboratorium);

        $laboratorium->load([
            'alats.kategoriAlat:id,nama,slug',
            'laboratoriumPengelolas.user:id,nama_lengkap,email',
            'laboratoriumGaleris' => fn ($q) => $q->orderBy('urutan'),
            'laboratoriumDokumens' => fn ($q) => $q->orderBy('urutan'),
            'laboratoriumTataTertibs' => fn ($q) => $q->orderBy('urutan'),
        ]);

        return Inertia::render('Dashboard/Admin/Laboratorium/Show', [
            'item' => $laboratorium,
            'events' => DetailDataService::eventsForLaboratorium($laboratorium),
            'riwayat' => DetailDataService::riwayatForLaboratorium($laboratorium),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Laboratorium::class);

        $data = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'kode' => ['required', 'string', 'max:50', 'unique:laboratorium,kode'],
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
            'pengelola' => ['nullable', 'array'],
            'pengelola.*' => ['exists:users,id'],
            'pengelola_peran' => ['nullable', 'array'],
            'pengelola_peran.*' => ['in:laboran,kepala_lab'],
        ]);

        $data['slug'] = Str::slug($data['nama']);
        $data['hari_operasional'] = $data['hari_operasional'] ?? [];

        if ($request->hasFile('foto_utama')) {
            $data['foto_utama'] = $request->file('foto_utama')->store('laboratorium', 'public');
        } else {
            unset($data['foto_utama']);
        }

        $lab = Laboratorium::create($data);

        if (! empty($data['pengelola'])) {
            foreach ($data['pengelola'] as $index => $userId) {
                $peran = $request->input("pengelola_peran.{$index}") ?? 'laboran';
                $lab->laboratoriumPengelolas()->create([
                    'user_id' => $userId,
                    'peran' => in_array($peran, ['laboran', 'kepala_lab']) ? $peran : 'laboran',
                    'is_primary' => false,
                ]);
            }
        }

        return redirect()->route('admin.laboratorium.edit', $lab)->with('success', 'Laboratorium berhasil ditambahkan. Silakan tambahkan galeri, dokumen, dan tata tertib jika diperlukan.');
    }

    public function edit(Laboratorium $laboratorium)
    {
        $this->authorize('update', $laboratorium);

        $laboratorium->load([
            'alats.kategoriAlat:id,nama,slug',
            'laboratoriumPengelolas.user:id,nama_lengkap',
            'laboratoriumGaleris' => fn ($q) => $q->orderBy('urutan'),
            'laboratoriumDokumens' => fn ($q) => $q->orderBy('urutan'),
            'laboratoriumTataTertibs' => fn ($q) => $q->orderBy('urutan'),
        ]);

        return Inertia::render('Dashboard/Admin/Laboratorium/Edit', [
            'item' => $laboratorium,
            'events' => DetailDataService::eventsForLaboratorium($laboratorium),
            'riwayat' => DetailDataService::riwayatForLaboratorium($laboratorium),
            'pengelola' => User::whereIn('status', ['approved'])->role(['laboran', 'kepala_lab', 'admin'])->get(['id', 'nama_lengkap', 'email']),
        ]);
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
            'pengelola' => ['nullable', 'array'],
            'pengelola.*' => ['exists:users,id'],
            'pengelola_peran' => ['nullable', 'array'],
            'pengelola_peran.*' => ['in:laboran,kepala_lab'],
        ]);

        $data['slug'] = Str::slug($data['nama']);
        $data['hari_operasional'] = $data['hari_operasional'] ?? [];

        if ($request->hasFile('foto_utama')) {
            if ($laboratorium->foto_utama) {
                Storage::disk('public')->delete($laboratorium->foto_utama);
            }
            $data['foto_utama'] = $request->file('foto_utama')->store('laboratorium', 'public');
        } else {
            unset($data['foto_utama']);
        }

        $laboratorium->update($data);

        $laboratorium->laboratoriumPengelolas()->delete();
        if (! empty($data['pengelola'])) {
            foreach ($data['pengelola'] as $index => $userId) {
                $peran = $request->input("pengelola_peran.{$index}") ?? 'laboran';
                $laboratorium->laboratoriumPengelolas()->create([
                    'user_id' => $userId,
                    'peran' => in_array($peran, ['laboran', 'kepala_lab']) ? $peran : 'laboran',
                    'is_primary' => false,
                ]);
            }
        }

        return redirect()->route('admin.laboratorium.index')->with('success', 'Laboratorium berhasil diperbarui.');
    }

    public function destroy(Laboratorium $laboratorium)
    {
        $this->authorize('delete', $laboratorium);

        $laboratorium->delete();

        return back()->with('success', 'Laboratorium berhasil dihapus.');
    }

    public function storeGaleri(Request $request, Laboratorium $laboratorium)
    {
        $this->authorize('update', $laboratorium);

        $data = $request->validate([
            'file' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'judul' => ['nullable', 'string', 'max:255'],
        ]);

        $path = $request->file('file')->store('laboratorium/galeri', 'public');
        $laboratorium->laboratoriumGaleris()->create([
            'file' => $path,
            'judul' => $data['judul'] ?? null,
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

    public function storeDokumen(Request $request, Laboratorium $laboratorium)
    {
        $this->authorize('update', $laboratorium);

        $data = $request->validate([
            'file' => ['required', 'mimes:pdf', 'max:5120'],
            'judul' => ['required', 'string', 'max:255'],
            'jenis' => ['required', 'in:sop,tata_tertib,lainnya'],
        ]);

        $path = $request->file('file')->store('laboratorium/dokumen', 'public');
        $laboratorium->laboratoriumDokumens()->create([
            'file' => $path,
            'judul' => $data['judul'],
            'jenis' => $data['jenis'],
            'urutan' => $laboratorium->laboratoriumDokumens()->count(),
        ]);

        return back()->with('success', 'Dokumen berhasil diunggah.');
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

    public function storeTataTertib(Request $request, Laboratorium $laboratorium)
    {
        $this->authorize('update', $laboratorium);

        $data = $request->validate([
            'isi' => ['required', 'string'],
        ]);

        $laboratorium->laboratoriumTataTertibs()->create([
            'isi' => $data['isi'],
            'urutan' => $laboratorium->laboratoriumTataTertibs()->count(),
        ]);

        return back()->with('success', 'Tata tertib berhasil ditambahkan.');
    }

    public function updateTataTertib(Request $request, Laboratorium $laboratorium, LaboratoriumTataTertib $tataTertib)
    {
        $this->authorize('update', $laboratorium);

        if ($tataTertib->laboratorium_id !== $laboratorium->id) {
            abort(404);
        }

        $data = $request->validate([
            'isi' => ['required', 'string'],
        ]);

        $tataTertib->update($data);

        return back()->with('success', 'Tata tertib berhasil diperbarui.');
    }

    public function destroyTataTertib(Laboratorium $laboratorium, LaboratoriumTataTertib $tataTertib)
    {
        $this->authorize('update', $laboratorium);

        if ($tataTertib->laboratorium_id !== $laboratorium->id) {
            abort(404);
        }

        $tataTertib->delete();

        return back()->with('success', 'Tata tertib berhasil dihapus.');
    }

    public function reorderTataTertib(Request $request, Laboratorium $laboratorium)
    {
        $this->authorize('update', $laboratorium);

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
