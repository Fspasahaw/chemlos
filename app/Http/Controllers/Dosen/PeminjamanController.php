<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\Alat;
use App\Models\Peminjaman;
use App\Models\PeminjamanStatusLog;
use App\Services\NotifikasiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PeminjamanController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Peminjaman::class);

        $statuses = ['menunggu_dosen', 'disetujui', 'ditolak', 'menunggu_laboran', 'berlangsung', 'selesai', 'terlambat'];

        $items = Peminjaman::with('user:id,nama_lengkap,npm_nip', 'laboratorium:id,nama', 'details.alat:id,nama,kode')
            ->where('dosen_pembimbing_id', auth()->id())
            ->whereIn('status', $statuses)
            ->when($request->search, function ($q, $s) {
                $q->where(function ($sq) use ($s) {
                    $sq->where('kode', 'like', "%{$s}%")
                        ->orWhereHas('user', fn ($q2) => $q2->where('nama_lengkap', 'like', "%{$s}%"))
                        ->orWhereHas('details.alat', fn ($q2) => $q2->where('nama', 'like', "%{$s}%"));
                });
            })
            ->when($request->status, fn ($q, $s) => in_array($s, $statuses) ? $q->where('status', $s) : $q)
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Dashboard/Dosen/Peminjaman/Index', [
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
            'role' => 'dosen',
        ]);
    }

    public function approve(Peminjaman $peminjaman)
    {
        $this->authorize('approve', $peminjaman);

        if ($peminjaman->status !== 'menunggu_dosen') {
            return back()->with('error', 'Status peminjaman tidak valid.');
        }

        DB::transaction(function () use ($peminjaman) {
            $peminjaman->update(['status' => 'menunggu_laboran']);

            PeminjamanStatusLog::create([
                'peminjaman_id' => $peminjaman->id,
                'status_dari' => 'menunggu_dosen',
                'status_ke' => 'menunggu_laboran',
                'keterangan' => 'Disetujui oleh dosen pembimbing, menunggu persetujuan laboran.',
                'user_id' => auth()->id(),
            ]);

            $pengelolaIds = \App\Models\LaboratoriumPengelola::where('laboratorium_id', $peminjaman->laboratorium_id)
                ->whereIn('peran', ['laboran', 'kepala_lab'])
                ->pluck('user_id');

            foreach ($pengelolaIds as $pengelolaId) {
                NotifikasiService::kirim(
                    $pengelolaId,
                    'Peminjaman Perlu Persetujuan',
                    "Peminjaman {$peminjaman->kode} telah disetujui dosen dan menunggu persetujuan Anda.",
                    'peminjaman',
                    '/dashboard/laboran/peminjaman'
                );
            }

            NotifikasiService::kirim(
                $peminjaman->user_id,
                'Peminjaman Disetujui Dosen',
                "Peminjaman {$peminjaman->kode} telah disetujui dosen pembimbing dan menunggu persetujuan laboran.",
                'peminjaman',
                '/dashboard/mahasiswa/peminjaman'
            );
        });

        return back()->with('success', 'Peminjaman disetujui.');
    }

    public function reject(Request $request, Peminjaman $peminjaman)
    {
        $this->authorize('reject', $peminjaman);

        $data = $request->validate(['alasan_penolakan' => ['required', 'string', 'max:500']]);

        if ($peminjaman->status !== 'menunggu_dosen') {
            return back()->with('error', 'Status peminjaman tidak valid.');
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
                'status_dari' => 'menunggu_dosen',
                'status_ke' => 'ditolak',
                'keterangan' => 'Ditolak oleh dosen pembimbing: ' . $data['alasan_penolakan'],
                'user_id' => auth()->id(),
            ]);

            NotifikasiService::kirim(
                $peminjaman->user_id,
                'Peminjaman Ditolak',
                "Peminjaman {$peminjaman->kode} ditolak oleh dosen pembimbing.",
                'peminjaman',
                '/dashboard/mahasiswa/peminjaman'
            );
        });

        return back()->with('success', 'Peminjaman ditolak.');
    }
}
