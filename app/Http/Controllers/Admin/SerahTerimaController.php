<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Alat;
use App\Models\Peminjaman;
use App\Models\PeminjamanStatusLog;
use App\Models\SerahTerima;
use App\Services\NotifikasiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SerahTerimaController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Peminjaman::class);

        return Inertia::render('Dashboard/Admin/SerahTerima/Index', [
            'items' => Peminjaman::with('user:id,nama_lengkap', 'laboratorium:id,nama', 'details.alat:id,nama,kode')
                ->where('status', 'disetujui')
                ->when($request->search, function ($q, $s) {
                    $q->where('kode', 'like', "%{$s}%")
                        ->orWhereHas('user', fn ($q) => $q->where('nama_lengkap', 'like', "%{$s}%"));
                })
                ->orderBy('tanggal_mulai')
                ->paginate(12)
                ->withQueryString(),
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request, Peminjaman $peminjaman)
    {
        $this->authorize('update', $peminjaman);

        if ($peminjaman->status !== 'disetujui') {
            return back()->with('error', 'Tidak dapat memproses serah terima.');
        }

        $data = $request->validate([
            'waktu_serah_terima' => ['required', 'date'],
            'kondisi_umum' => ['nullable', 'string'],
            'foto_bukti' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'detail.*.kondisi_serah_terima' => ['required', 'in:baik,rusak_ringan,rusak_berat,hilang'],
            'detail.*.catatan_serah_terima' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($peminjaman, $data, $request) {
            SerahTerima::create([
                'peminjaman_id' => $peminjaman->id,
                'laboran_id' => auth()->id(),
                'waktu_serah_terima' => $data['waktu_serah_terima'],
                'foto_bukti' => $request->hasFile('foto_bukti') ? $request->file('foto_bukti')->store('serah-terima', 'public') : null,
                'catatan' => $data['kondisi_umum'] ?? null,
            ]);

            foreach ($peminjaman->details as $detail) {
                $input = $data['detail'][$detail->id] ?? [];
                $detail->update([
                    'kondisi_serah_terima' => $input['kondisi_serah_terima'] ?? 'baik',
                    'catatan_serah_terima' => $input['catatan_serah_terima'] ?? null,
                ]);

                $alat = Alat::lockForUpdate()->find($detail->alat_id);
                $alat->stok_reserved = max(0, $alat->stok_reserved - $detail->jumlah);
                $alat->stok_dipinjam += $detail->jumlah;
                $alat->save();
            }

            $peminjaman->update(['status' => 'berlangsung']);

            PeminjamanStatusLog::create([
                'peminjaman_id' => $peminjaman->id,
                'status_dari' => 'disetujui',
                'status_ke' => 'berlangsung',
                'keterangan' => 'Alat telah diserahkan ke peminjam oleh admin.',
                'user_id' => auth()->id(),
            ]);

            NotifikasiService::kirim(
                $peminjaman->user_id,
                'Serah Terima Berhasil',
                "Peminjaman {$peminjaman->kode} telah diserahkan. Status peminjaman saat ini Berlangsung.",
                'peminjaman',
                '/dashboard/mahasiswa/peminjaman'
            );
        });

        return back()->with('success', 'Serah terima berhasil.');
    }
}
