<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Alat;
use App\Models\Peminjaman;
use App\Models\PeminjamanStatusLog;
use App\Services\NotifikasiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PeminjamanController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Peminjaman::class);

        $statuses = ['diajukan', 'menunggu_dosen', 'menunggu_laboran', 'disetujui', 'berlangsung', 'selesai', 'ditolak', 'dibatalkan', 'terlambat'];

        return Inertia::render('Dashboard/Admin/Peminjaman/Index', [
            'items' => Peminjaman::with('user:id,nama_lengkap,npm_nip', 'laboratorium:id,nama', 'details.alat:id,nama,kode', 'dosenPembimbing:id,nama_lengkap')
                ->when($request->search, function ($q, $s) {
                    $q->where(function ($sq) use ($s) {
                        $sq->where('kode', 'like', "%{$s}%")
                            ->orWhereHas('user', fn ($q) => $q->where('nama_lengkap', 'like', "%{$s}%"))
                            ->orWhereHas('details.alat', fn ($q) => $q->where('nama', 'like', "%{$s}%"));
                    });
                })
                ->when($request->status, fn ($q, $s) => in_array($s, $statuses) ? $q->where('status', $s) : $q)
                ->when($request->laboratorium, fn ($q, $l) => $q->where('laboratorium_id', $l))
                ->when($request->start && $request->end, fn ($q) => $q->whereBetween('tanggal_mulai', [$request->start, $request->end]))
                ->orderByDesc('created_at')
                ->paginate(12)
                ->withQueryString(),
            'filters' => $request->only('search', 'status', 'laboratorium', 'start', 'end'),
            'labs' => \App\Models\Laboratorium::orderBy('nama')->pluck('nama', 'id'),
        ]);
    }

    public function show(Peminjaman $peminjaman)
    {
        $this->authorize('view', $peminjaman);

        return Inertia::render('Dashboard/Admin/Peminjaman/Show', [
            'item' => $peminjaman->load([
                'user:id,nama_lengkap,email,npm_nip,no_hp',
                'dosenPembimbing:id,nama_lengkap,email,npm_nip',
                'laboratorium',
                'details.alat',
                'statusLogs.user:id,nama_lengkap',
                'pengembalian',
                'serahTerima',
                'kerusakanAlats',
            ]),
        ]);
    }

    public function approve(Peminjaman $peminjaman)
    {
        $this->authorize('approve', $peminjaman);

        $allowed = ['diajukan', 'menunggu_dosen', 'menunggu_laboran'];
        if (! in_array($peminjaman->status, $allowed)) {
            return back()->with('error', 'Status peminjaman tidak valid untuk disetujui.');
        }

        $statusDari = $peminjaman->status;
        $statusKe = 'disetujui';

        if ($peminjaman->status === 'menunggu_dosen') {
            $statusKe = 'menunggu_laboran';
        }

        if (in_array($peminjaman->status, ['diajukan', 'menunggu_laboran'])) {
            $statusKe = 'disetujui';
        }

        $mulai = \Carbon\Carbon::parse($peminjaman->tanggal_mulai)->setTimeFromTimeString($peminjaman->jam_mulai);
        $selesai = \Carbon\Carbon::parse($peminjaman->tanggal_selesai)->setTimeFromTimeString($peminjaman->jam_selesai);

        DB::transaction(function () use ($peminjaman, $statusDari, $statusKe, $mulai, $selesai) {
            foreach ($peminjaman->details as $detail) {
                $alat = Alat::lockForUpdate()->find($detail->alat_id);
                if ($statusKe === 'disetujui' && $statusDari !== 'disetujui') {
                    $tersedia = $alat->ketersediaanUntuk($mulai, $selesai, $peminjaman->id);
                    if ($tersedia < $detail->jumlah) {
                        throw ValidationException::withMessages([
                            'alat' => "Stok {$alat->nama} tidak mencukupi pada jadwal peminjaman (tersedia {$tersedia} unit).",
                        ]);
                    }
                }
            }

            $peminjaman->update(['status' => $statusKe]);

            PeminjamanStatusLog::create([
                'peminjaman_id' => $peminjaman->id,
                'status_dari' => $statusDari,
                'status_ke' => $statusKe,
                'keterangan' => 'Disetujui oleh admin.',
                'user_id' => auth()->id(),
            ]);

            NotifikasiService::kirim(
                $peminjaman->user_id,
                'Peminjaman Diproses Admin',
                "Peminjaman {$peminjaman->kode} telah disetujui oleh admin.",
                'peminjaman',
                '/dashboard/mahasiswa/peminjaman'
            );
        });

        return back()->with('success', 'Peminjaman berhasil disetujui.');
    }

    public function reject(Request $request, Peminjaman $peminjaman)
    {
        $this->authorize('reject', $peminjaman);

        $data = $request->validate(['alasan_penolakan' => ['required', 'string', 'max:500']]);

        if (! in_array($peminjaman->status, ['diajukan', 'menunggu_dosen', 'menunggu_laboran'])) {
            return back()->with('error', 'Status peminjaman tidak valid untuk ditolak.');
        }

        DB::transaction(function () use ($peminjaman, $data) {
            $peminjaman->update([
                'status' => 'ditolak',
                'alasan_penolakan' => $data['alasan_penolakan'],
            ]);

            foreach ($peminjaman->details as $detail) {
                $alat = Alat::lockForUpdate()->find($detail->alat_id);
                $alat->stok_reserved = max(0, $alat->stok_reserved - $detail->jumlah);
                $alat->save();
            }

            PeminjamanStatusLog::create([
                'peminjaman_id' => $peminjaman->id,
                'status_dari' => $peminjaman->status,
                'status_ke' => 'ditolak',
                'keterangan' => 'Ditolak oleh admin: ' . $data['alasan_penolakan'],
                'user_id' => auth()->id(),
            ]);

            NotifikasiService::kirim(
                $peminjaman->user_id,
                'Peminjaman Ditolak',
                "Peminjaman {$peminjaman->kode} ditolak oleh admin.",
                'peminjaman',
                '/dashboard/mahasiswa/peminjaman'
            );
        });

        return back()->with('success', 'Peminjaman ditolak.');
    }

    public function destroy(Peminjaman $peminjaman)
    {
        $this->authorize('delete', $peminjaman);

        if (! in_array($peminjaman->status, ['selesai', 'dibatalkan', 'ditolak'])) {
            foreach ($peminjaman->details as $detail) {
                $alat = Alat::lockForUpdate()->find($detail->alat_id);
                if ($peminjaman->status === 'menunggu_dosen' || $peminjaman->status === 'menunggu_laboran' || $peminjaman->status === 'diajukan') {
                    $alat->stok_reserved = max(0, $alat->stok_reserved - $detail->jumlah);
                } elseif ($peminjaman->status === 'berlangsung' || $peminjaman->status === 'terlambat') {
                    $alat->stok_dipinjam = max(0, $alat->stok_dipinjam - $detail->jumlah);
                    $alat->stok_tersedia += $detail->jumlah;
                } elseif ($peminjaman->status === 'disetujui') {
                    // reserved has not been converted yet for disetujui
                    $alat->stok_reserved = max(0, $alat->stok_reserved - $detail->jumlah);
                }
                $alat->save();
            }
        }

        $peminjaman->delete();

        return back()->with('success', 'Peminjaman berhasil dihapus.');
    }
}
