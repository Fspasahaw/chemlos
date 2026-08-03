<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Alat;
use App\Models\KerusakanAlat;
use App\Models\Laboratorium;
use App\Models\MaintenanceAlat;
use App\Services\NotifikasiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MaintenanceController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', MaintenanceAlat::class);

        $query = MaintenanceAlat::with('alat:id,nama,kode,laboratorium_id', 'laboran:id,nama_lengkap', 'kerusakan', 'laboratorium:id,nama');

        if ($request->search) {
            $q = $request->search;
            $query->whereHas('alat', fn ($qq) => $qq->where('nama', 'like', "%{$q}%"))
                ->orWhere('keterangan', 'like', "%{$q}%")
                ->orWhere('teknisi', 'like', "%{$q}%");
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->laboratorium_id) {
            $query->where('laboratorium_id', $request->laboratorium_id);
        }

        return Inertia::render('Dashboard/Admin/Maintenance/Index', [
            'items' => $query->orderByDesc('created_at')->paginate(12)->withQueryString(),
            'alats' => Alat::with('laboratorium:id,nama')->get(['id', 'nama', 'kode', 'laboratorium_id']),
            'kerusakans' => KerusakanAlat::with('alat:id,nama,kode')
                ->where('status', 'dilaporkan')
                ->get(['id', 'alat_id', 'jumlah', 'keterangan', 'kondisi']),
            'labs' => Laboratorium::orderBy('nama')->get(['id', 'nama']),
            'filters' => $request->only('search', 'status', 'laboratorium_id'),
        ]);
    }

    public function show(MaintenanceAlat $maintenance)
    {
        $this->authorize('view', $maintenance);

        $maintenance->load(['alat.laboratorium', 'laboratorium:id,nama', 'laboran:id,nama_lengkap', 'kerusakan']);

        return Inertia::render('Dashboard/Admin/Maintenance/Show', [
            'item' => $maintenance->toArray(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', MaintenanceAlat::class);

        $data = $request->validate([
            'alat_id' => ['required', 'exists:alat,id'],
            'jumlah' => ['required', 'integer', 'min:1'],
            'keterangan' => ['required', 'string'],
            'tanggal_mulai' => ['required', 'date'],
            'tanggal_selesai' => ['nullable', 'date', 'after_or_equal:tanggal_mulai'],
            'teknisi' => ['nullable', 'string'],
            'kerusakan_id' => ['nullable', 'exists:kerusakan_alat,id'],
        ]);

        return DB::transaction(function () use ($data) {
            $alat = Alat::lockForUpdate()->findOrFail($data['alat_id']);
            $kerusakan = $data['kerusakan_id'] ? KerusakanAlat::lockForUpdate()->findOrFail($data['kerusakan_id']) : null;

            if ($kerusakan && $kerusakan->alat_id !== $alat->id) {
                return back()->with('error', 'Kerusakan yang dipilih tidak sesuai dengan alat.');
            }

            $jumlah = (int) $data['jumlah'];
            $needMoveStock = ! ($kerusakan && $kerusakan->stok_sudah_dialihkan);

            if ($needMoveStock) {
                if ($alat->stok_tersedia < $jumlah) {
                    return back()->with('error', 'Stok tersedia tidak mencukupi untuk maintenance.');
                }

                $alat->stok_maintenance += $jumlah;
                $alat->save();
            }

            if ($kerusakan && ! $kerusakan->stok_sudah_dialihkan) {
                $kerusakan->stok_sudah_dialihkan = true;
                $kerusakan->save();
            }

            $maintenance = MaintenanceAlat::create([
                'alat_id' => $data['alat_id'],
                'laboratorium_id' => $alat->laboratorium_id,
                'laboran_id' => auth()->id(),
                'kerusakan_id' => $data['kerusakan_id'],
                'jumlah' => $jumlah,
                'keterangan' => $data['keterangan'],
                'tanggal_mulai' => $data['tanggal_mulai'],
                'tanggal_selesai' => $data['tanggal_selesai'] ?? null,
                'status' => 'dijadwalkan',
                'biaya' => 0,
                'teknisi' => $data['teknisi'] ?? null,
            ]);

            if ($kerusakan) {
                $kerusakan->update(['status' => 'maintenance', 'maintenance_id' => $maintenance->id]);
            }

            $alat = $maintenance->alat;
            if ($kerusakan && $kerusakan->peminjaman?->user_id) {
                NotifikasiService::kirim(
                    $kerusakan->peminjaman->user_id,
                    'Maintenance Dijadwalkan',
                    "Maintenance alat {$alat->nama} ({$alat->kode}) yang terkait peminjaman Anda telah dijadwalkan.",
                    'maintenance',
                    '/dashboard/mahasiswa/peminjaman'
                );
            }

            return back()->with('success', 'Maintenance berhasil ditambahkan.');
        });
    }

    public function update(Request $request, MaintenanceAlat $maintenance)
    {
        $this->authorize('update', $maintenance);

        if ($maintenance->status !== 'dijadwalkan') {
            return back()->with('error', 'Maintenance hanya dapat diedit saat status dijadwalkan.');
        }

        $data = $request->validate([
            'keterangan' => ['required', 'string'],
            'tanggal_mulai' => ['required', 'date'],
            'tanggal_selesai' => ['nullable', 'date', 'after_or_equal:tanggal_mulai'],
            'teknisi' => ['nullable', 'string'],
            'biaya' => ['nullable', 'numeric', 'min:0'],
        ]);

        $maintenance->update([
            'keterangan' => $data['keterangan'],
            'tanggal_mulai' => $data['tanggal_mulai'],
            'tanggal_selesai' => $data['tanggal_selesai'] ?? null,
            'teknisi' => $data['teknisi'] ?? null,
            'biaya' => $data['biaya'] ?? 0,
        ]);

        return back()->with('success', 'Maintenance berhasil diperbarui.');
    }

    public function start(MaintenanceAlat $maintenance)
    {
        $this->authorize('update', $maintenance);

        if ($maintenance->status !== 'dijadwalkan') {
            return back()->with('error', 'Maintenance hanya bisa dimulai dari status dijadwalkan.');
        }

        $maintenance->update(['status' => 'berlangsung']);

        $alat = $maintenance->alat;
        if ($maintenance->kerusakan?->peminjaman?->user_id) {
            NotifikasiService::kirim(
                $maintenance->kerusakan->peminjaman->user_id,
                'Maintenance Dimulai',
                "Maintenance alat {$alat->nama} ({$alat->kode}) yang terkait peminjaman Anda telah dimulai.",
                'maintenance',
                '/dashboard/mahasiswa/peminjaman'
            );
        }

        return back()->with('success', 'Maintenance dimulai.');
    }

    public function complete(MaintenanceAlat $maintenance)
    {
        $this->authorize('update', $maintenance);

        if (! in_array($maintenance->status, ['dijadwalkan', 'berlangsung'], true)) {
            return back()->with('error', 'Maintenance tidak dapat diselesaikan.');
        }

        return DB::transaction(function () use ($maintenance) {
            $alat = Alat::lockForUpdate()->find($maintenance->alat_id);

            if ($alat->stok_maintenance < $maintenance->jumlah) {
                return back()->with('error', 'Stok maintenance tidak mencukupi.');
            }

            $alat->stok_maintenance -= $maintenance->jumlah;

            $kondisi = $maintenance->kerusakan?->kondisi;
            if (in_array($kondisi, ['rusak_berat', 'hilang'], true)) {
                if ($alat->stok_total < $maintenance->jumlah) {
                    return back()->with('error', 'Stok total tidak mencukupi untuk penghapusan unit.');
                }
                $alat->stok_total -= $maintenance->jumlah;
            }

            $alat->save();

            $maintenance->update([
                'status' => 'selesai',
                'tanggal_selesai' => now()->toDateString(),
            ]);

            if ($maintenance->kerusakan_id) {
                $maintenance->kerusakan->update(['status' => 'selesai']);
            }

            $alat = $maintenance->alat;
            NotifikasiService::kirim(
                $maintenance->laboran_id,
                'Maintenance Selesai',
                "Maintenance alat {$alat->nama} ({$alat->kode}) telah selesai.",
                'maintenance',
                '/dashboard/admin/maintenance'
            );

            if ($maintenance->kerusakan?->peminjaman?->user_id) {
                NotifikasiService::kirim(
                    $maintenance->kerusakan->peminjaman->user_id,
                    'Maintenance Alat Selesai',
                    "Maintenance alat {$alat->nama} ({$alat->kode}) yang terkait peminjaman Anda telah selesai.",
                    'maintenance',
                    '/dashboard/mahasiswa/peminjaman'
                );
            }

            return back()->with('success', 'Maintenance selesai.');
        });
    }

    public function cancel(MaintenanceAlat $maintenance)
    {
        $this->authorize('update', $maintenance);

        if (! in_array($maintenance->status, ['dijadwalkan', 'berlangsung'], true)) {
            return back()->with('error', 'Hanya maintenance yang belum selesai yang dapat dibatalkan.');
        }

        return DB::transaction(function () use ($maintenance) {
            $alat = Alat::lockForUpdate()->find($maintenance->alat_id);
            $kerusakan = $maintenance->kerusakan;

            $shouldReturnStock = ! ($kerusakan && $kerusakan->peminjaman_id);

            if ($shouldReturnStock) {
                if ($alat->stok_maintenance < $maintenance->jumlah) {
                    return back()->with('error', 'Stok maintenance tidak mencukupi.');
                }

                $alat->stok_maintenance -= $maintenance->jumlah;
                $alat->save();
            }

            $maintenance->update(['status' => 'dibatalkan']);

            if ($kerusakan) {
                $kerusakan->update([
                    'status' => 'dicek',
                    'maintenance_id' => null,
                    'stok_sudah_dialihkan' => $shouldReturnStock ? false : $kerusakan->stok_sudah_dialihkan,
                ]);
            }

            $alat = $maintenance->alat;
            if ($maintenance->kerusakan?->peminjaman?->user_id) {
                NotifikasiService::kirim(
                    $maintenance->kerusakan->peminjaman->user_id,
                    'Maintenance Dibatalkan',
                    "Maintenance alat {$alat->nama} ({$alat->kode}) yang terkait peminjaman Anda telah dibatalkan.",
                    'maintenance',
                    '/dashboard/mahasiswa/peminjaman'
                );
            }

            return back()->with('success', 'Maintenance dibatalkan.');
        });
    }
}
