<?php

namespace App\Http\Controllers\Laboran;

use App\Http\Controllers\Controller;
use App\Models\Alat;
use App\Models\LaboratoriumPengelola;
use App\Models\Peminjaman;
use App\Models\PeminjamanStatusLog;
use App\Services\NotifikasiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PeminjamanController extends Controller
{
    protected function labIds(): array
    {
        return LaboratoriumPengelola::where('user_id', auth()->id())->pluck('laboratorium_id')->toArray();
    }

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
            ->when($request->status, fn ($q, $s) => in_array($s, $statuses) ? $q->where('status', $s) : $q)
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Dashboard/Laboran/Peminjaman/Index', [
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
            'role' => 'laboran',
        ]);
    }

    public function approve(Peminjaman $peminjaman)
    {
        $this->authorize('approve', $peminjaman);

        if (! in_array($peminjaman->laboratorium_id, $this->labIds())) {
            abort(403);
        }

        if ($peminjaman->status !== 'menunggu_laboran') {
            return back()->with('error', 'Status peminjaman tidak valid.');
        }

        $mulai = \Carbon\Carbon::parse($peminjaman->tanggal_mulai)->setTimeFromTimeString($peminjaman->jam_mulai);
        $selesai = \Carbon\Carbon::parse($peminjaman->tanggal_selesai)->setTimeFromTimeString($peminjaman->jam_selesai);

        DB::transaction(function () use ($peminjaman, $mulai, $selesai) {
            foreach ($peminjaman->details as $detail) {
                $alat = Alat::lockForUpdate()->find($detail->alat_id);
                $tersedia = $alat->ketersediaanUntuk($mulai, $selesai, $peminjaman->id);

                if ($tersedia < $detail->jumlah) {
                    throw ValidationException::withMessages([
                        'alat' => "Stok {$alat->nama} tidak mencukupi pada jadwal peminjaman (tersedia {$tersedia} unit).",
                    ]);
                }
            }

            $peminjaman->update(['status' => 'disetujui']);

            PeminjamanStatusLog::create([
                'peminjaman_id' => $peminjaman->id,
                'status_dari' => 'menunggu_laboran',
                'status_ke' => 'disetujui',
                'keterangan' => 'Disetujui oleh laboran.',
                'user_id' => auth()->id(),
            ]);

            NotifikasiService::kirim(
                $peminjaman->user_id,
                'Peminjaman Disetujui Laboran',
                "Peminjaman {$peminjaman->kode} telah disetujui laboran. Silakan lakukan serah terima sesuai jadwal.",
                'peminjaman',
                '/dashboard/mahasiswa/peminjaman'
            );
        });

        return back()->with('success', 'Peminjaman disetujui laboran.');
    }

    public function reject(Request $request, Peminjaman $peminjaman)
    {
        $this->authorize('reject', $peminjaman);

        $data = $request->validate(['alasan_penolakan' => ['required', 'string', 'max:500']]);

        if (! in_array($peminjaman->laboratorium_id, $this->labIds())) {
            abort(403);
        }

        if ($peminjaman->status !== 'menunggu_laboran') {
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
                'status_dari' => 'menunggu_laboran',
                'status_ke' => 'ditolak',
                'keterangan' => 'Ditolak oleh laboran: ' . $data['alasan_penolakan'],
                'user_id' => auth()->id(),
            ]);

            NotifikasiService::kirim(
                $peminjaman->user_id,
                'Peminjaman Ditolak',
                "Peminjaman {$peminjaman->kode} ditolak oleh laboran.",
                'peminjaman',
                '/dashboard/mahasiswa/peminjaman'
            );
        });

        return back()->with('success', 'Peminjaman ditolak.');
    }
}
