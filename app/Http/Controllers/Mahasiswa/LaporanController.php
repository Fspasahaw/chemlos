<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Peminjaman;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LaporanController extends Controller
{
    public function index(Request $request)
    {
        $statuses = ['selesai', 'terlambat', 'ditolak', 'dibatalkan'];

        $items = Peminjaman::with('laboratorium:id,nama,slug', 'details.alat:id,nama,kode', 'pengembalian:id,peminjaman_id,total_denda,denda_dibayar,waktu_pengembalian')
            ->where('user_id', auth()->id())
            ->when($request->status && in_array($request->status, $statuses), fn ($q, $s) => $q->where('status', $s))
            ->when($request->search, function ($q, $s) {
                $q->where(function ($sq) use ($s) {
                    $sq->where('kode', 'like', "%{$s}%")
                        ->orWhereHas('details.alat', fn ($q2) => $q2->where('nama', 'like', "%{$s}%"));
                });
            })
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        $summary = Peminjaman::where('user_id', auth()->id())
            ->whereIn('status', ['selesai', 'terlambat'])
            ->with('pengembalian:id,peminjaman_id,total_denda,denda_dibayar')
            ->get()
            ->reduce(function ($carry, $item) {
                $carry['total'] += (float) ($item->pengembalian?->total_denda ?? 0);
                $carry['dibayar'] += (float) ($item->pengembalian?->denda_dibayar ?? 0);
                return $carry;
            }, ['total' => 0, 'dibayar' => 0]);

        $summary['sisa'] = max(0, $summary['total'] - $summary['dibayar']);

        return Inertia::render('Dashboard/Mahasiswa/Laporan/Index', [
            'items' => $items,
            'summary' => $summary,
            'filters' => $request->only('search', 'status'),
        ]);
    }
}
