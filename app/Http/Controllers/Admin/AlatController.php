<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\GeneratesQrLabel;
use App\Http\Controllers\Controller;
use App\Models\Alat;
use App\Models\AlatDokumen;
use App\Models\AlatGaleri;
use App\Models\KategoriAlat;
use App\Models\KerusakanAlat;
use App\Models\Laboratorium;
use App\Models\MaintenanceAlat;
use App\Models\PeminjamanDetail;
use App\Models\VideoTutorial;
use App\Services\DetailDataService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AlatController extends Controller
{
    use GeneratesQrLabel;
    public function index(Request $request)
    {
        $this->authorize('viewAny', Alat::class);

        return Inertia::render('Dashboard/Admin/Alat/Index', [
            'items' => Alat::with('laboratorium:id,nama,slug', 'kategoriAlat:id,nama,slug')
                ->when($request->search, fn ($q, $s) => $q->where('nama', 'like', "%{$s}%"))
                ->when($request->laboratorium, fn ($q, $id) => $q->where('laboratorium_id', $id))
                ->when($request->kategori, fn ($q, $id) => $q->where('kategori_id', $id))
                ->orderByDesc('created_at')
                ->paginate(12)
                ->withQueryString(),
            'filters' => $request->only('search', 'laboratorium', 'kategori'),
            'labs' => Laboratorium::orderBy('nama')->pluck('nama', 'id'),
            'kategoris' => KategoriAlat::orderBy('nama')->pluck('nama', 'id'),
            'base' => '/dashboard/admin/alat',
        ]);
    }

    public function create()
    {
        $this->authorize('create', Alat::class);

        return Inertia::render('Dashboard/Admin/Alat/Create', [
            'labs' => Laboratorium::aktif()->orderBy('nama')->get(['id', 'nama']),
            'kategoris' => KategoriAlat::where('status', 'aktif')->orderBy('nama')->get(['id', 'nama']),
            'base' => '/dashboard/admin/alat',
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Alat::class);

        $data = $this->validateAlat($request);
        $data['spesifikasi'] = $data['spesifikasi'] ?? [];
        $data['slug'] = Str::slug($data['nama']);

        if ($request->hasFile('foto_utama')) {
            $data['foto_utama'] = $request->file('foto_utama')->store('alat', 'public');
        } else {
            unset($data['foto_utama']);
        }

        $alat = Alat::create($data);
        $this->generateQrCode($alat);

        return redirect()->route('admin.alat.edit', $alat)->with('success', 'Alat berhasil ditambahkan. Silakan tambahkan galeri, dokumen, dan video jika diperlukan.');
    }

    public function show(Alat $alat)
    {
        $this->authorize('view', $alat);

        $alat->load([
            'laboratorium',
            'kategoriAlat',
            'alatGaleris' => fn ($q) => $q->orderBy('urutan'),
            'alatDokumens' => fn ($q) => $q->orderBy('urutan'),
            'videoTutorials' => fn ($q) => $q->orderBy('urutan'),
        ]);

        return Inertia::render('Dashboard/Admin/Alat/Show', [
            'item' => $alat,
            'events' => DetailDataService::eventsForAlat($alat),
            'riwayat' => DetailDataService::riwayatForAlat($alat),
        ]);
    }

    public function edit(Alat $alat)
    {
        $this->authorize('update', $alat);

        $alat->load([
            'laboratorium',
            'kategoriAlat',
            'alatGaleris' => fn ($q) => $q->orderBy('urutan'),
            'alatDokumens' => fn ($q) => $q->orderBy('urutan'),
            'videoTutorials' => fn ($q) => $q->orderBy('urutan'),
        ]);

        return Inertia::render('Dashboard/Admin/Alat/Edit', [
            'item' => $alat,
            'events' => DetailDataService::eventsForAlat($alat),
            'riwayat' => DetailDataService::riwayatForAlat($alat),
            'labs' => Laboratorium::aktif()->orderBy('nama')->get(['id', 'nama']),
            'kategoris' => KategoriAlat::where('status', 'aktif')->orderBy('nama')->get(['id', 'nama']),
            'base' => '/dashboard/admin/alat',
        ]);
    }

    public function update(Request $request, Alat $alat)
    {
        $this->authorize('update', $alat);

        $data = $this->validateAlat($request, $alat);
        $data['spesifikasi'] = $data['spesifikasi'] ?? [];
        $data['slug'] = Str::slug($data['nama']);

        if ($request->hasFile('foto_utama')) {
            if ($alat->foto_utama) {
                Storage::disk('public')->delete($alat->foto_utama);
            }
            $data['foto_utama'] = $request->file('foto_utama')->store('alat', 'public');
        } else {
            unset($data['foto_utama']);
        }

        $alat->update($data);

        if ($alat->wasChanged('slug') || ! $alat->qr_kode_path) {
            $this->generateQrCode($alat);
        }

        return redirect()->route('admin.alat.index')->with('success', 'Alat berhasil diperbarui.');
    }

    public function destroy(Alat $alat)
    {
        $this->authorize('delete', $alat);

        $alat->delete();

        return back()->with('success', 'Alat berhasil dihapus.');
    }

    public function downloadQr(Alat $alat)
    {
        $this->authorize('view', $alat);

        if (! $alat->qr_kode_path || ! Storage::disk('public')->exists($alat->qr_kode_path)) {
            $this->generateQrCode($alat);
        }

        $extension = pathinfo($alat->qr_kode_path, PATHINFO_EXTENSION);
        $filename = 'qr-' . $alat->slug . '.' . $extension;

        return response()->download(Storage::disk('public')->path($alat->qr_kode_path), $filename, [
            'Content-Type' => $extension === 'svg' ? 'image/svg+xml' : 'image/png',
        ]);
    }

    public function regenerateQr(Alat $alat)
    {
        $this->authorize('update', $alat);

        if ($alat->qr_kode_path) {
            Storage::disk('public')->delete($alat->qr_kode_path);
        }
        $this->generateQrCode($alat);

        return back()->with('success', 'QR code berhasil diregenerasi.');
    }

    public function storeGaleri(Request $request, Alat $alat)
    {
        $this->authorize('manageGaleri', $alat);

        $data = $request->validate([
            'file' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'judul' => ['nullable', 'string', 'max:255'],
        ]);

        $path = $request->file('file')->store('alat/galeri', 'public');
        $alat->alatGaleris()->create([
            'file' => $path,
            'judul' => $data['judul'] ?? null,
            'urutan' => $alat->alatGaleris()->count(),
        ]);

        return back()->with('success', 'Foto galeri berhasil ditambahkan.');
    }

    public function destroyGaleri(Alat $alat, AlatGaleri $galeri)
    {
        $this->authorize('manageGaleri', $alat);

        if ($galeri->alat_id !== $alat->id) {
            abort(404);
        }
        Storage::disk('public')->delete($galeri->file);
        $galeri->delete();

        return back()->with('success', 'Foto galeri berhasil dihapus.');
    }

    public function reorderGaleri(Request $request, Alat $alat)
    {
        $this->authorize('manageGaleri', $alat);

        $data = $request->validate([
            'urutan' => ['required', 'array'],
            'urutan.*' => ['integer'],
        ]);

        foreach ($data['urutan'] as $index => $id) {
            AlatGaleri::where('id', $id)->where('alat_id', $alat->id)->update(['urutan' => $index + 1]);
        }

        return back()->with('success', 'Urutan galeri diperbarui.');
    }

    public function storeDokumen(Request $request, Alat $alat)
    {
        $this->authorize('manageDokumen', $alat);

        $data = $request->validate([
            'file' => ['required', 'mimes:pdf', 'max:5120'],
            'judul' => ['required', 'string', 'max:255'],
            'jenis' => ['required', 'in:manual,sop,sertifikat_kalibrasi,lainnya'],
        ]);

        $path = $request->file('file')->store('alat/dokumen', 'public');
        $alat->alatDokumens()->create([
            'file' => $path,
            'judul' => $data['judul'],
            'jenis' => $data['jenis'],
            'urutan' => $alat->alatDokumens()->count(),
        ]);

        return back()->with('success', 'Dokumen berhasil diunggah.');
    }

    public function reorderDokumen(Request $request, Alat $alat)
    {
        $this->authorize('manageDokumen', $alat);

        $data = $request->validate([
            'urutan' => ['required', 'array'],
            'urutan.*' => ['integer'],
        ]);

        foreach ($data['urutan'] as $index => $id) {
            AlatDokumen::where('id', $id)->where('alat_id', $alat->id)->update(['urutan' => $index + 1]);
        }

        return back()->with('success', 'Urutan dokumen diperbarui.');
    }

    public function destroyDokumen(Alat $alat, AlatDokumen $dokumen)
    {
        $this->authorize('manageDokumen', $alat);

        if ($dokumen->alat_id !== $alat->id) {
            abort(404);
        }
        Storage::disk('public')->delete($dokumen->file);
        $dokumen->delete();

        return back()->with('success', 'Dokumen berhasil dihapus.');
    }

    public function storeVideo(Request $request, Alat $alat)
    {
        $this->authorize('manageVideo', $alat);

        $data = $request->validate([
            'judul' => ['required', 'string', 'max:255'],
            'sumber' => ['required', 'in:youtube,url_eksternal,upload'],
            'url' => ['required_if:sumber,youtube,url_eksternal', 'nullable', 'url', 'max:500'],
            'file' => ['required_if:sumber,upload', 'nullable', 'mimetypes:video/mp4,video/webm,video/ogg', 'max:10240'],
            'durasi' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', 'in:aktif,nonaktif'],
        ]);

        $data['alat_id'] = $alat->id;
        $data['slug'] = Str::slug($data['judul']);
        $data['jenis'] = 'alat';
        $data['urutan'] = $alat->videoTutorials()->count();

        if ($request->hasFile('file')) {
            $data['file'] = $request->file('file')->store('alat/video', 'public');
        } elseif (empty($data['url'])) {
            $data['url'] = null;
        }

        VideoTutorial::create($data);

        return back()->with('success', 'Video tutorial berhasil ditambahkan.');
    }

    public function reorderVideo(Request $request, Alat $alat)
    {
        $this->authorize('manageVideo', $alat);

        $data = $request->validate([
            'urutan' => ['required', 'array'],
            'urutan.*' => ['integer'],
        ]);

        foreach ($data['urutan'] as $index => $id) {
            VideoTutorial::where('id', $id)->where('alat_id', $alat->id)->update(['urutan' => $index + 1]);
        }

        return back()->with('success', 'Urutan video diperbarui.');
    }

    public function destroyVideo(Alat $alat, VideoTutorial $video)
    {
        $this->authorize('manageVideo', $alat);

        if ($video->alat_id !== $alat->id) {
            abort(404);
        }
        if ($video->file) {
            Storage::disk('public')->delete($video->file);
        }
        $video->delete();

        return back()->with('success', 'Video tutorial berhasil dihapus.');
    }

    private function validateAlat(Request $request, ?Alat $alat = null): array
    {
        return $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'kode' => ['required', 'string', 'max:50', 'unique:alat,kode,' . ($alat?->id ?? 'NULL')],
            'laboratorium_id' => ['required', 'exists:laboratorium,id'],
            'kategori_id' => ['required', 'exists:kategori_alat,id'],
            'deskripsi' => ['nullable', 'string'],
            'spesifikasi' => ['nullable', 'array'],
            'kondisi' => ['required', 'in:baik,rusak_ringan,rusak_berat,hilang'],
            'stok_total' => ['required', 'integer', 'min:0'],
            'persyaratan_khusus' => ['nullable', 'string'],
            'pelatihan_wajib' => ['nullable', 'boolean'],
            'foto_utama' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);
    }

}
