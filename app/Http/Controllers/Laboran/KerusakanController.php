<?php

namespace App\Http\Controllers\Laboran;

use App\Http\Controllers\Controller;
use App\Models\Alat;
use App\Models\KerusakanAlat;
use App\Models\LaboratoriumPengelola;
use App\Models\MaintenanceAlat;
use App\Services\NotifikasiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KerusakanController extends Controller
{
    private function labIds(): array
    {
        return LaboratoriumPengelola::where('user_id', auth()->id())->pluck('laboratorium_id')->toArray();
    }

    private function belongsToManagedLab(KerusakanAlat $kerusakan): bool
    {
        return in_array($kerusakan->alat->laboratorium_id, $this->labIds(), true);
    }

    protected function viewName(): string
    {
        return 'Dashboard/Laboran/Kerusakan/Index';
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', KerusakanAlat::class);

        $query = KerusakanAlat::with('alat:id,nama,kode,laboratorium_id', 'alat.laboratorium:id,nama', 'pelapor:id,nama_lengkap', 'maintenance')
            ->whereHas('alat', fn ($q) => $q->whereIn('laboratorium_id', $this->labIds()));

        if ($request->search) {
            $q = $request->search;
            $query->whereHas('alat', fn ($qq) => $qq->where('nama', 'like', "%{$q}%"))
                ->orWhereHas('pelapor', fn ($qq) => $qq->where('nama_lengkap', 'like', "%{$q}%"))
                ->orWhere('keterangan', 'like', "%{$q}%");
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->kondisi) {
            $query->where('kondisi', $request->kondisi);
        }

        return Inertia::render($this->viewName(), [
            'items' => $query->orderByDesc('created_at')->paginate(12)->withQueryString(),
            'alats' => Alat::whereIn('laboratorium_id', $this->labIds())->get(['id', 'nama', 'kode', 'laboratorium_id']),
            'filters' => $request->only('search', 'status', 'kondisi'),
        ]);
    }

    public function show(KerusakanAlat $kerusakan)
    {
        $this->authorize('view', $kerusakan);

        if (! $this->belongsToManagedLab($kerusakan)) {
            abort(403);
        }

        $kerusakan->load(['alat.laboratorium', 'pelapor:id,nama_lengkap', 'peminjaman:id,kode', 'maintenance']);

        return Inertia::render(str_replace('Index', 'Show', $this->viewName()), [
            'item' => $kerusakan->toArray(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', KerusakanAlat::class);

        $data = $request->validate([
            'alat_id' => ['required', 'exists:alat,id'],
            'jumlah' => ['required', 'integer', 'min:1'],
            'kondisi' => ['required', 'in:rusak_ringan,rusak_berat,hilang'],
            'keterangan' => ['nullable', 'string'],
            'foto' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        return DB::transaction(function () use ($data, $request) {
            $alat = Alat::lockForUpdate()->findOrFail($data['alat_id']);

            if (! in_array($alat->laboratorium_id, $this->labIds(), true)) {
                abort(403);
            }

            if ($alat->stok_tersedia < $data['jumlah']) {
                return back()->with('error', 'Jumlah kerusakan melebihi stok tersedia saat ini.');
            }

            $kerusakan = KerusakanAlat::create([
                'alat_id' => $data['alat_id'],
                'pelapor_id' => auth()->id(),
                'jumlah' => $data['jumlah'],
                'kondisi' => $data['kondisi'],
                'keterangan' => $data['keterangan'] ?? null,
                'foto' => $request->hasFile('foto') ? $request->file('foto')->store('kerusakan', 'public') : null,
                'tanggal_dilaporkan' => now()->toDateString(),
                'status' => 'dilaporkan',
                'stok_sudah_dialihkan' => false,
            ]);

            $alat = $kerusakan->alat;
            $kepalaIds = LaboratoriumPengelola::where('laboratorium_id', $alat->laboratorium_id)
                ->where('peran', 'kepala_lab')
                ->pluck('user_id');

            foreach ($kepalaIds as $kepalaId) {
                NotifikasiService::kirim(
                    $kepalaId,
                    'Laporan Kerusakan Alat',
                    "Alat {$alat->nama} ({$alat->kode}) dilaporkan rusak oleh laboran. Kondisi: {$data['kondisi']}.",
                    'kerusakan',
                    '/dashboard/kepala-lab/kerusakan'
                );
            }

            return back()->with('success', 'Kerusakan berhasil dilaporkan.');
        });
    }

    public function updateStatus(Request $request, KerusakanAlat $kerusakan)
    {
        $this->authorize('update', $kerusakan);

        if (! $this->belongsToManagedLab($kerusakan)) {
            abort(403);
        }

        $data = $request->validate([
            'status' => ['required', 'in:dicek,diabaikan,selesai'],
            'keterangan' => ['nullable', 'string'],
        ]);

        return DB::transaction(function () use ($kerusakan, $data) {
            if ($kerusakan->stok_sudah_dialihkan && in_array($data['status'], ['diabaikan', 'selesai'], true)) {
                $alat = Alat::lockForUpdate()->find($kerusakan->alat_id);

                if ($alat->stok_maintenance < $kerusakan->jumlah) {
                    return back()->with('error', 'Stok maintenance tidak mencukupi untuk memperbarui status.');
                }

                $alat->stok_maintenance -= $kerusakan->jumlah;

                if ($data['status'] === 'selesai' && in_array($kerusakan->kondisi, ['rusak_berat', 'hilang'], true)) {
                    if ($alat->stok_total < $kerusakan->jumlah) {
                        return back()->with('error', 'Stok total tidak mencukupi untuk penghapusan unit.');
                    }
                    $alat->stok_total -= $kerusakan->jumlah;
                }

                $alat->save();
                $kerusakan->stok_sudah_dialihkan = false;
            }

            $kerusakan->update([
                'status' => $data['status'],
                'keterangan' => $data['keterangan'] ?? $kerusakan->keterangan,
            ]);

            $alat = $kerusakan->alat;
            if ($kerusakan->pelapor_id) {
                NotifikasiService::kirim(
                    $kerusakan->pelapor_id,
                    'Status Kerusakan Diperbarui',
                    "Status kerusakan alat {$alat->nama} ({$alat->kode}) telah diperbarui menjadi {$data['status']}.",
                    'kerusakan',
                    '/dashboard/laboran/kerusakan',
                    ['alat' => $alat->nama, 'kondisi' => $kerusakan->kondisi, 'status' => $data['status']]
                );
            }

            if ($kerusakan->peminjaman?->user_id) {
                NotifikasiService::kirim(
                    $kerusakan->peminjaman->user_id,
                    'Status Kerusakan Diperbarui',
                    "Status kerusakan alat {$alat->nama} ({$alat->kode}) pada peminjaman Anda telah diperbarui menjadi {$data['status']}.",
                    'kerusakan',
                    '/dashboard/mahasiswa/peminjaman',
                    ['kode' => $kerusakan->peminjaman->kode, 'alat' => $alat->nama, 'status' => $data['status']]
                );
            }

            return back()->with('success', 'Status kerusakan diperbarui.');
        });
    }

    public function registerMaintenance(Request $request, KerusakanAlat $kerusakan)
    {
        $this->authorize('update', $kerusakan);

        if (! $this->belongsToManagedLab($kerusakan)) {
            abort(403);
        }

        return DB::transaction(function () use ($kerusakan, $request) {
            $alat = Alat::lockForUpdate()->find($kerusakan->alat_id);

            if (! in_array($alat->laboratorium_id, $this->labIds(), true)) {
                abort(403);
            }

            $jumlah = $request->input('jumlah', $kerusakan->jumlah);

            if ($jumlah > $alat->stok_tersedia) {
                return back()->with('error', 'Stok tersedia tidak mencukupi untuk maintenance.');
            }

            $alat->stok_maintenance += $jumlah;
            $alat->save();

            $maintenance = MaintenanceAlat::create([
                'alat_id' => $alat->id,
                'laboratorium_id' => $alat->laboratorium_id,
                'laboran_id' => auth()->id(),
                'kerusakan_id' => $kerusakan->id,
                'jumlah' => $jumlah,
                'keterangan' => $request->input('keterangan', 'Maintenance otomatis dari kerusakan'),
                'tanggal_mulai' => $request->input('tanggal_mulai', now()->toDateString()),
                'tanggal_selesai' => $request->input('tanggal_selesai'),
                'status' => 'dijadwalkan',
                'biaya' => 0,
                'teknisi' => $request->input('teknisi'),
            ]);

            $kerusakan->update(['status' => 'maintenance', 'maintenance_id' => $maintenance->id, 'stok_sudah_dialihkan' => true]);

            NotifikasiService::kirim(
                $maintenance->laboran_id,
                'Maintenance Dijadwalkan',
                "Maintenance untuk alat {$alat->nama} ({$alat->kode}) telah dijadwalkan. Status: dijadwalkan.",
                'maintenance',
                '/dashboard/laboran/maintenance'
            );

            return back()->with('success', 'Kerusakan berhasil didaftarkan ke maintenance.');
        });
    }

    public function update(Request $request, KerusakanAlat $kerusakan)
    {
        $this->authorize('update', $kerusakan);

        if (! $this->belongsToManagedLab($kerusakan)) {
            abort(403);
        }

        if ($kerusakan->maintenance_id) {
            return back()->with('error', 'Kerusakan sudah didaftarkan ke maintenance, tidak dapat diedit.');
        }

        $data = $request->validate([
            'alat_id' => ['required', 'exists:alat,id'],
            'jumlah' => ['required', 'integer', 'min:1'],
            'kondisi' => ['required', 'in:rusak_ringan,rusak_berat,hilang'],
            'keterangan' => ['nullable', 'string'],
            'foto' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        return DB::transaction(function () use ($data, $request, $kerusakan) {
            $alat = Alat::lockForUpdate()->findOrFail($data['alat_id']);

            if (! in_array($alat->laboratorium_id, $this->labIds(), true)) {
                abort(403);
            }

            if ($kerusakan->peminjaman_id && $data['alat_id'] != $kerusakan->alat_id) {
                return back()->with('error', 'Alat tidak dapat diubah karena kerusakan berasal dari peminjaman.');
            }

            if ($alat->stok_tersedia < $data['jumlah']) {
                return back()->with('error', 'Jumlah kerusakan melebihi stok tersedia saat ini.');
            }

            $foto = $kerusakan->foto;
            if ($request->hasFile('foto')) {
                $foto = $request->file('foto')->store('kerusakan', 'public');
            }

            $kerusakan->update([
                'alat_id' => $data['alat_id'],
                'jumlah' => $data['jumlah'],
                'kondisi' => $data['kondisi'],
                'keterangan' => $data['keterangan'] ?? $kerusakan->keterangan,
                'foto' => $foto,
            ]);

            return back()->with('success', 'Kerusakan berhasil diperbarui.');
        });
    }

    public function destroy(KerusakanAlat $kerusakan)
    {
        $this->authorize('delete', $kerusakan);

        if (! $this->belongsToManagedLab($kerusakan)) {
            abort(403);
        }

        return DB::transaction(function () use ($kerusakan) {
            if ($kerusakan->stok_sudah_dialihkan) {
                $alat = Alat::lockForUpdate()->find($kerusakan->alat_id);

                if ($alat->stok_maintenance >= $kerusakan->jumlah) {
                    $alat->stok_maintenance -= $kerusakan->jumlah;
                    $alat->save();
                }
            }

            if ($kerusakan->maintenance_id) {
                MaintenanceAlat::where('id', $kerusakan->maintenance_id)->update(['status' => 'dibatalkan']);
            }

            $kerusakan->delete();

            return back()->with('success', 'Kerusakan berhasil dihapus.');
        });
    }
}
