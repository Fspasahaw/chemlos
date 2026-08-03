<?php

namespace App\Http\Controllers\KepalaLab;

use App\Http\Controllers\Laboran\PeminjamanController as BaseController;
use App\Models\Peminjaman;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PeminjamanController extends BaseController
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Peminjaman::class);

        $statuses = ['menunggu_laboran', 'disetujui', 'berlangsung', 'selesai', 'terlambat', 'ditolak'];

        $items = Peminjaman::with('user:id,nama_lengkap,npm_nip', 'laboratorium:id,nama', 'details.alat:id,nama,kode')
            ->whereIn('laboratorium_id', $this->labIds())
            ->whereIn('status', $statuses)
            ->when($request->search, function ($q, $s) {
                $q->where(function ($sq) use ($s) {
                    $sq->where('kode', 'like', "%{$s}%")
                        ->orWhereHas('user', fn ($q2) => $q2->where('nama_lengkap', 'like', "%{$s}%"))
                        ->orWhereHas('details.alat', fn ($q2) => $q2->where('nama', 'like', "%{$s}%"));
                });
            })
            ->when($request->status && in_array($request->status, $statuses), fn ($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Dashboard/KepalaLab/Peminjaman/Index', [
            'items' => $items,
            'filters' => $request->only('search', 'status'),
        ]);
    }

    public function show(Peminjaman $peminjaman)
    {
        $this->authorize('view', $peminjaman);

        return Inertia::render('Dashboard/Peminjaman/Show', [
            'peminjaman' => $peminjaman->load([
                'user:id,nama_lengkap,npm_nip,email',
                'dosenPembimbing:id,nama_lengkap,email',
                'laboratorium:id,nama,slug,lokasi',
                'details.alat:id,nama,kode,stok_total',
                'statusLogs.user:id,nama_lengkap',
                'serahTerima',
                'pengembalian',
                'kerusakanAlats',
            ]),
            'role' => 'kepala_lab',
        ]);
    }
}
