<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Alat;
use App\Models\KerusakanAlat;
use App\Models\Peminjaman;
use App\Models\PeminjamanStatusLog;
use App\Models\Pengembalian;
use App\Services\DendaService;
use App\Services\NotifikasiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PengembalianController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Peminjaman::class);

        return Inertia::render('Dashboard/Admin/Pengembalian/Index', [
            'items' => Peminjaman::with('user:id,nama_lengkap', 'laboratorium:id,nama', 'details.alat:id,nama,kode')
                ->select('peminjaman.*')
                ->whereIn('status', ['berlangsung', 'terlambat'])
                ->when($request->search, function ($q, $s) {
                    $q->where('kode', 'like', "%{$s}%")
                        ->orWhereHas('user', fn ($q) => $q->where('nama_lengkap', 'like', "%{$s}%"));
                })
                ->orderBy('tanggal_selesai')
                ->paginate(12)
                ->withQueryString(),
            'filters' => $request->only('search'),
            'dendaSettings' => DendaService::settings(),
        ]);
    }

    public function store(Request $request, Peminjaman $peminjaman)
    {
        $this->authorize('update', $peminjaman);

        if (! in_array($peminjaman->status, ['berlangsung', 'terlambat'])) {
            return back()->with('error', 'Tidak dapat memproses pengembalian.');
        }

        $data = $request->validate([
            'waktu_pengembalian' => ['required', 'date'],
            'kondisi_umum' => ['nullable', 'string'],
            'foto_bukti' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'detail.*.kondisi_pengembalian' => ['required', 'in:baik,rusak_ringan,rusak_berat,hilang'],
            'detail.*.catatan_pengembalian' => ['nullable', 'string'],
            'detail.*.denda_per_alat' => ['nullable', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($peminjaman, $data, $request) {
            $denda = DendaService::hitung($peminjaman, $data['detail'] ?? [], $data['waktu_pengembalian']);

            $fotoBukti = $request->hasFile('foto_bukti') ? $request->file('foto_bukti')->store('pengembalian', 'public') : null;

            Pengembalian::create([
                'peminjaman_id' => $peminjaman->id,
                'laboran_id' => auth()->id(),
                'waktu_pengembalian' => $data['waktu_pengembalian'],
                'foto_kondisi' => $fotoBukti,
                'keterlambatan_menit' => $denda['keterlambatan_menit'],
                'total_denda' => $denda['total'],
                'catatan' => $data['kondisi_umum'] ?? null,
            ]);

            foreach ($peminjaman->details as $detail) {
                $input = $data['detail'][$detail->id] ?? [];
                $kondisi = $input['kondisi_pengembalian'] ?? 'baik';

                $detail->update([
                    'kondisi_pengembalian' => $kondisi,
                    'catatan_pengembalian' => $input['catatan_pengembalian'] ?? null,
                    'denda_per_alat' => $denda['per_alat'][$detail->id] ?? 0,
                ]);

                $alat = Alat::lockForUpdate()->find($detail->alat_id);
                $alat->stok_dipinjam = max(0, $alat->stok_dipinjam - $detail->jumlah);

                if ($kondisi !== 'baik') {
                    $alat->stok_maintenance += $detail->jumlah;
                    $alat->kondisi = $kondisi;

                    KerusakanAlat::create([
                        'alat_id' => $detail->alat_id,
                        'peminjaman_id' => $peminjaman->id,
                        'pelapor_id' => auth()->id(),
                        'jumlah' => $detail->jumlah,
                        'kondisi' => $kondisi,
                        'keterangan' => $input['catatan_pengembalian'] ?? 'Laporan saat pengembalian',
                        'tanggal_dilaporkan' => now()->toDateString(),
                        'status' => 'dilaporkan',
                        'foto' => $fotoBukti,
                        'stok_sudah_dialihkan' => true,
                    ]);
                } else {
                    $alat->stok_tersedia += $detail->jumlah;
                }

                $alat->save();
            }

            $nextStatus = $denda['terlambat'] ? 'terlambat' : 'selesai';
            $peminjaman->update(['status' => $nextStatus]);

            PeminjamanStatusLog::create([
                'peminjaman_id' => $peminjaman->id,
                'status_dari' => 'berlangsung',
                'status_ke' => $nextStatus,
                'keterangan' => 'Pengembalian diproses oleh admin.',
                'user_id' => auth()->id(),
            ]);

            NotifikasiService::kirim(
                $peminjaman->user_id,
                $denda['terlambat'] ? 'Pengembalian Terlambat' : 'Pengembalian Selesai',
                "Peminjaman {$peminjaman->kode} telah dikembalikan. " . ($denda['total'] > 0 ? 'Total denda Rp '.number_format($denda['total'], 0, ',', '.') : 'Tidak ada denda.'),
                'peminjaman',
                '/dashboard/mahasiswa/peminjaman'
            );
        });

        return back()->with('success', 'Pengembalian berhasil diproses.');
    }
}
