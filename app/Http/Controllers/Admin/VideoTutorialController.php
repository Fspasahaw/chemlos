<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Alat;
use App\Models\VideoTutorial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class VideoTutorialController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', VideoTutorial::class);

        return Inertia::render('Dashboard/Admin/VideoTutorial/Index', [
            'items' => VideoTutorial::with('alat:id,nama')
                ->when($request->search, fn ($q, $s) => $q->where('judul', 'like', "%{$s}%"))
                ->when($request->jenis, fn ($q, $s) => $q->where('jenis', $s))
                ->when($request->alat, fn ($q, $id) => $q->where('alat_id', $id))
                ->when($request->status, fn ($q, $s) => $q->where('status', $s))
                ->when($request->sumber, fn ($q, $s) => $q->where('sumber', $s))
                ->orderByDesc('created_at')
                ->paginate(12)
                ->withQueryString(),
            'filters' => $request->only('search', 'jenis', 'alat', 'status', 'sumber'),
            'alatOptions' => Alat::orderBy('nama')->get(['id', 'nama']),
        ]);
    }

    public function create()
    {
        $this->authorize('create', VideoTutorial::class);

        return Inertia::render('Dashboard/Admin/VideoTutorial/Create', [
            'alatOptions' => Alat::orderBy('nama')->get(['id', 'nama']),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', VideoTutorial::class);

        $data = $request->validate([
            'judul' => ['required', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string'],
            'jenis' => ['required', 'in:aplikasi,alat'],
            'alat_id' => ['required_if:jenis,alat', 'nullable', 'exists:alat,id'],
            'sumber' => ['required', 'in:youtube,url_eksternal,upload'],
            'url' => ['required_if:sumber,youtube,url_eksternal', 'nullable', 'url', 'max:500'],
            'file' => ['required_if:sumber,upload', 'nullable', 'mimetypes:video/mp4,video/webm,video/ogg', 'max:10240'],
            'durasi' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', 'in:aktif,nonaktif'],
        ]);

        $data['slug'] = Str::slug($data['judul']);
        $data['durasi'] = $data['durasi'] ?? null;
        $data['alat_id'] = $data['jenis'] === 'alat' ? ($data['alat_id'] ?? null) : null;

        if ($request->hasFile('file')) {
            $folder = $data['jenis'] === 'alat' ? 'video-tutorial/alat' : 'video-tutorial/aplikasi';
            $data['file'] = $request->file('file')->store($folder, 'public');
        } elseif (empty($data['url'])) {
            $data['url'] = null;
        }

        VideoTutorial::create($data);

        return redirect()->route('admin.video-tutorial.index')->with('success', 'Video tutorial berhasil ditambahkan.');
    }

    public function show(VideoTutorial $video)
    {
        $this->authorize('view', $video);

        return Inertia::render('Dashboard/Admin/VideoTutorial/Show', [
            'item' => $video->load('alat:id,nama'),
        ]);
    }

    public function edit(VideoTutorial $video)
    {
        $this->authorize('update', $video);

        return Inertia::render('Dashboard/Admin/VideoTutorial/Edit', [
            'item' => $video->load('alat:id,nama'),
            'alatOptions' => Alat::orderBy('nama')->get(['id', 'nama']),
        ]);
    }

    public function update(Request $request, VideoTutorial $video)
    {
        $this->authorize('update', $video);

        $data = $request->validate([
            'judul' => ['required', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string'],
            'jenis' => ['required', 'in:aplikasi,alat'],
            'alat_id' => ['required_if:jenis,alat', 'nullable', 'exists:alat,id'],
            'sumber' => ['required', 'in:youtube,url_eksternal,upload'],
            'url' => ['required_if:sumber,youtube,url_eksternal', 'nullable', 'url', 'max:500'],
            'file' => ['nullable', 'mimetypes:video/mp4,video/webm,video/ogg', 'max:10240'],
            'durasi' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', 'in:aktif,nonaktif'],
        ]);

        $data['slug'] = Str::slug($data['judul']);
        $data['durasi'] = $data['durasi'] ?? null;
        $data['alat_id'] = $data['jenis'] === 'alat' ? ($data['alat_id'] ?? null) : null;

        $oldFile = $video->file;
        $oldJenis = $video->jenis;

        if ($request->hasFile('file')) {
            if ($oldFile) {
                Storage::disk('public')->delete($oldFile);
            }
            $folder = $data['jenis'] === 'alat' ? 'video-tutorial/alat' : 'video-tutorial/aplikasi';
            $data['file'] = $request->file('file')->store($folder, 'public');
        } else {
            unset($data['file']);
        }

        if ($data['sumber'] !== 'upload') {
            $data['file'] = null;
            if ($oldFile) {
                Storage::disk('public')->delete($oldFile);
            }
        }

        if ($data['jenis'] === 'aplikasi' && $oldJenis === 'alat' && $oldFile) {
            Storage::disk('public')->delete($oldFile);
            $data['file'] = null;
        }

        $video->update($data);

        return redirect()->route('admin.video-tutorial.index')->with('success', 'Video tutorial berhasil diperbarui.');
    }

    public function destroy(VideoTutorial $video)
    {
        $this->authorize('delete', $video);

        if ($video->file) {
            Storage::disk('public')->delete($video->file);
        }
        $video->delete();

        return back()->with('success', 'Video tutorial berhasil dihapus.');
    }
}
