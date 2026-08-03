<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Alat;
use App\Models\KerusakanAlat;
use App\Models\Laboratorium;
use App\Models\LaboratoriumPengelola;
use App\Models\MaintenanceAlat;
use App\Services\NotifikasiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KerusakanController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', KerusakanAlat::class);

        $query = KerusakanAlat::with('alat:id,nama,kode,laboratorium_id', 'pelapor:id,nama_lengkap', 'maintenance', 'alat.laboratorium:id,nama');

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

        if ($request->laboratorium_id) {
            $query->whereHas('alat', fn ($q) => $q->where('laboratorium_id', $request->laboratorium_id));
        }

        return Inertia::render('Dashboard/Admin/Kerusakan/Index', [
            'items' => $query->orderByDesc('created_at')->paginate(12)->withQueryString(),
            'alats' => Alat::with('laboratorium:id,nama')->get(['id', 'nama', 'kode', 'laboratorium_id']),
            'labs' => Laboratorium::orderBy('nama')->get(['id', 'nama']),
            'filters' => $request->only('status', 'kondisi', 'laboratorium_id'),
        ]);
    }

    public function show(KerusakanAlat $kerusakan)
    {
        $this->authorize('view', $kerusakan);

        $kerusakan->load(['alat.laboratorium', 'pelapor:id,nama_lengkap', 'peminjaman:id,kode', 'maintenance']);

        return Inertia::render('Dashboard/Admin/Kerusakan/Show', [
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
            $pengelolaIds = LaboratoriumPengelola::where('laboratorium_id', $alat->laboratorium_id)
                ->pluck('user_id');

            foreach ($pengelolaIds as $pengelolaId) {
                NotifikasiService::kirim(
                    $pengelolaId,
                    'Laporan Kerusakan Alat',
                    "Alat {$alat->nama} ({$alat->kode}) dilaporkan rusak. Kondisi: {$data['kondisi']}.",
                    'kerusakan',
                    '/dashboard/admin/kerusakan'
                );
            }

            return back()->with('success', 'Kerusakan berhasil dilaporkan.');
        });
    }

    public function updateStatus(Request $request, KerusakanAlat $kerusakan)
    {
        $this->authorize('update', $kerusakan);

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
            if ($kerusakan->peminjaman?->user_id) {
                NotifikasiService::kirim(
                    $kerusakan->peminjaman->user_id,
                    'Status Kerusakan Diperbarui',
                    "Status kerusakan alat {$alat->nama} ({$alat->kode}) telah diperbarui menjadi {$data['status']}.",
                    'kerusakan',
                    '/dashboard/mahasiswa/peminjaman'
                );
            }

            return back()->with('success', 'Status kerusakan diperbarui.');
        });
    }

    public function update(Request $request, KerusakanAlat $kerusakan)
    {
        $this->authorize('update', $kerusakan);

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
