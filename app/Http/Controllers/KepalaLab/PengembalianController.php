<?php

namespace App\Http\Controllers\KepalaLab;

use App\Http\Controllers\Laboran\PengembalianController as BaseController;
use App\Models\Peminjaman;
use App\Models\Pengembalian;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PengembalianController extends BaseController
{
    public function index()
    {
        return Inertia::render('Dashboard/KepalaLab/Pengembalian/Index', [
            'items' => Peminjaman::with('user:id,nama_lengkap,npm_nip', 'laboratorium:id,nama', 'details.alat:id,nama,kode', 'pengembalian')
                ->whereIn('laboratorium_id', $this->labIds())
                ->when(request('search'), fn ($q, $s) => $q->where(function ($sq) use ($s) {
                    $sq->where('kode', 'like', "%{$s}%")
                        ->orWhereHas('user', fn ($q2) => $q2->where('nama_lengkap', 'like', "%{$s}%"))
                        ->orWhereHas('details.alat', fn ($q2) => $q2->where('nama', 'like', "%{$s}%"));
                }))
                ->when(request('status'), fn ($q, $s) => $q->where('status', $s))
                ->orderBy('tanggal_selesai')
                ->paginate(12)
                ->withQueryString(),
            'filters' => request()->only('search', 'status'),
        ]);
    }

    public function store(Request $request, Peminjaman $peminjaman)
    {
        abort(403, 'Kepala Lab hanya dapat memantau pengembalian, bukan memprosesnya.');
    }

    public function bayarDenda(Pengembalian $pengembalian)
    {
        abort(403, 'Kepala Lab hanya dapat memantau pengembalian, bukan memprosesnya.');
    }
}
