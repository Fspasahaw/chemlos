<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Alat;
use App\Models\Laboratorium;
use App\Models\Peminjaman;
use App\Models\PeminjamanDetail;
use App\Models\PeminjamanStatusLog;
use App\Models\Pengaturan;
use App\Models\Pengembalian;
use App\Models\User;
use App\Services\NotifikasiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PeminjamanController extends Controller
{
    public function index(Request $request)
    {
        $statuses = ['diajukan', 'menunggu_dosen', 'menunggu_laboran', 'disetujui', 'berlangsung', 'selesai', 'terlambat', 'ditolak', 'dibatalkan'];

        $items = Peminjaman::with('laboratorium:id,nama,slug', 'details.alat:id,nama,kode')
            ->where('user_id', auth()->id())
            ->when($request->search, function ($q, $s) {
                $q->where(function ($sq) use ($s) {
                    $sq->where('kode', 'like', "%{$s}%")
                        ->orWhereHas('details.alat', fn ($q2) => $q2->where('nama', 'like', "%{$s}%"));
                });
            })
            ->when($request->status, fn ($q, $s) => in_array($s, $statuses) ? $q->where('status', $s) : $q)
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Dashboard/Mahasiswa/Peminjaman/Index', [
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
            'role' => 'mahasiswa',
        ]);
    }

    public function baru(Request $request)
    {
        $step = min(max((int) $request->input('step', 1), 1), 4);
        $selectedLab = $request->input('lab') ?: $request->session()->get('peminjaman.lab');

        $tools = null;
        if ($selectedLab) {
            $tools = Alat::where('laboratorium_id', $selectedLab)
                ->where('kondisi', 'baik')
                ->where('stok_tersedia', '>', 0)
                ->with('kategoriAlat:id,nama')
                ->get(['id', 'nama', 'kode', 'stok_tersedia', 'stok_total', 'kondisi', 'foto_utama', 'kategori_id']);
        }

        return Inertia::render('Dashboard/Mahasiswa/Peminjaman/Baru', [
            'step' => $step,
            'labId' => (int) $selectedLab ?: null,
            'labs' => Laboratorium::aktif()->orderBy('nama')->get(['id', 'nama', 'slug']),
            'dosens' => User::role('dosen')->where('status', 'approved')->get(['id', 'nama_lengkap', 'email']),
            'tools' => $tools,
        ]);
    }

    public function pilihLab(Request $request)
    {
        $request->validate(['laboratorium_id' => ['required', 'exists:laboratorium,id,status,aktif']]);
        $request->session()->put('peminjaman.lab', $request->input('laboratorium_id'));

        return redirect('/dashboard/mahasiswa/peminjaman/baru?step=2&lab=' . $request->input('laboratorium_id'));
    }

    public function cariAlat(Request $request)
    {
        $labId = $request->input('laboratorium_id') ?: $request->session()->get('peminjaman.lab');

        return response()->json([
            'alat' => Alat::where('laboratorium_id', $labId)
                ->where('kondisi', 'baik')
                ->where('stok_tersedia', '>', 0)
                ->with('kategoriAlat:id,nama')
                ->get(['id', 'nama', 'kode', 'stok_tersedia', 'stok_total', 'kondisi', 'foto_utama', 'kategori_id']),
        ]);
    }

    public function store(Request $request)
    {
        $this->validateRecaptcha($request, 'peminjaman_buat');

        $data = $request->validate([
            'laboratorium_id' => ['required', 'exists:laboratorium,id,status,aktif'],
            'dosen_pembimbing_id' => ['required', 'exists:users,id'],
            'tujuan' => ['required', 'string', 'max:1000'],
            'tanggal_mulai' => ['required', 'date', 'after_or_equal:today'],
            'jam_mulai' => ['required', 'date_format:H:i'],
            'tanggal_selesai' => ['required', 'date', 'after_or_equal:tanggal_mulai'],
            'jam_selesai' => ['required', 'date_format:H:i'],
            'alat' => ['required', 'array', 'min:1'],
            'alat.*.alat_id' => [
                'required',
                Rule::exists('alat', 'id')->where('laboratorium_id', $request->input('laboratorium_id')),
            ],
            'alat.*.jumlah' => ['required', 'integer', 'min:1'],
            'file_jsa' => ['nullable', 'file', 'mimes:pdf', 'max:15360'],
        ]);

        // Validasi pengaturan sistem
        $maksimalDurasi = (int) Pengaturan::get('peminjaman.maksimal_durasi_hari', 7);
        $minimalDurasi = (int) Pengaturan::get('peminjaman.minimal_durasi_hari', 1);
        $maksimalAlat = (int) Pengaturan::get('peminjaman.maksimal_alat_per_peminjaman', 5);
        $maksimalAktif = (int) Pengaturan::get('peminjaman.maksimal_peminjaman_aktif', 3);
        $wajibJsa = Pengaturan::getBool('peminjaman.wajib_upload_jsa', true);
        $wajibDosen = Pengaturan::getBool('peminjaman.wajib_dosen_pembimbing', true);
        $blokirJikaDenda = Pengaturan::getBool('denda.blokir_pinjaman_jika_denda', true);

        if (count($data['alat']) > $maksimalAlat) {
            throw ValidationException::withMessages(['alat' => "Maksimal {$maksimalAlat} alat per peminjaman."]);
        }

        if ($wajibDosen && empty($data['dosen_pembimbing_id'])) {
            throw ValidationException::withMessages(['dosen_pembimbing_id' => 'Dosen pembimbing wajib dipilih.']);
        }

        if ($wajibJsa && ! $request->hasFile('file_jsa')) {
            throw ValidationException::withMessages(['file_jsa' => 'File JSA wajib diupload.']);
        }

        $mulai = \Carbon\Carbon::parse($data['tanggal_mulai'] . ' ' . $data['jam_mulai']);
        $selesai = \Carbon\Carbon::parse($data['tanggal_selesai'] . ' ' . $data['jam_selesai']);

        if ($mulai >= $selesai) {
            throw ValidationException::withMessages(['jam_selesai' => 'Waktu selesai harus setelah waktu mulai.']);
        }

        $durasiHari = (int) $mulai->diffInDays($selesai) + 1;

        if ($durasiHari < $minimalDurasi) {
            throw ValidationException::withMessages(['tanggal_selesai' => "Durasi minimal {$minimalDurasi} hari."]);
        }

        if ($durasiHari > $maksimalDurasi) {
            throw ValidationException::withMessages(['tanggal_selesai' => "Durasi maksimal {$maksimalDurasi} hari."]);
        }

        if ($blokirJikaDenda) {
            $dendaBelumLunas = Pengembalian::whereHas('peminjaman', fn ($q) => $q->where('user_id', auth()->id()))
                ->where('total_denda', '>', 0)
                ->where(function ($q) {
                    $q->whereNull('denda_dibayar')->orWhereColumn('denda_dibayar', '<', 'total_denda');
                })
                ->exists();

            if ($dendaBelumLunas) {
                throw ValidationException::withMessages(['alat' => 'Anda memiliki denda yang belum lunas. Selesaikan denda terlebih dahulu.']);
            }
        }

        $peminjamanAktif = Peminjaman::where('user_id', auth()->id())
            ->whereIn('status', ['diajukan', 'menunggu_dosen', 'menunggu_laboran', 'disetujui', 'berlangsung', 'terlambat'])
            ->count();

        if ($peminjamanAktif >= $maksimalAktif) {
            throw ValidationException::withMessages(['alat' => "Maksimal {$maksimalAktif} peminjaman aktif."]);
        }

        DB::transaction(function () use ($data, $request, $mulai, $selesai) {
            $kode = 'PINJ-' . now()->format('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

            $peminjaman = Peminjaman::create([
                'user_id' => auth()->id(),
                'laboratorium_id' => $data['laboratorium_id'],
                'dosen_pembimbing_id' => $data['dosen_pembimbing_id'],
                'kode' => $kode,
                'tujuan' => $data['tujuan'],
                'tanggal_mulai' => $data['tanggal_mulai'],
                'jam_mulai' => $data['jam_mulai'],
                'tanggal_selesai' => $data['tanggal_selesai'],
                'jam_selesai' => $data['jam_selesai'],
                'file_jsa' => $request->hasFile('file_jsa') ? $request->file('file_jsa')->store('jsa', 'public') : null,
                'status' => 'menunggu_dosen',
            ]);

            PeminjamanStatusLog::create([
                'peminjaman_id' => $peminjaman->id,
                'status_dari' => 'diajukan',
                'status_ke' => 'menunggu_dosen',
                'keterangan' => 'Peminjaman diajukan, menunggu persetujuan dosen pembimbing.',
                'user_id' => auth()->id(),
            ]);

            foreach ($data['alat'] as $a) {
                $alat = Alat::lockForUpdate()->find($a['alat_id']);

                $tersediaUntukWaktu = $alat->ketersediaanUntuk($mulai, $selesai);
                if ($tersediaUntukWaktu < $a['jumlah']) {
                    throw ValidationException::withMessages(['alat' => "Stok {$alat->nama} tidak mencukupi pada rentang waktu yang dipilih (tersedia {$tersediaUntukWaktu} unit)."]);
                }

                PeminjamanDetail::create([
                    'peminjaman_id' => $peminjaman->id,
                    'alat_id' => $a['alat_id'],
                    'jumlah' => $a['jumlah'],
                ]);

                $alat->stok_reserved += $a['jumlah'];
                $alat->save();
            }

            // Notifikasi ke dosen pembimbing
            NotifikasiService::kirim(
                $data['dosen_pembimbing_id'],
                'Peminjaman Perlu Persetujuan',
                "Peminjaman {$peminjaman->kode} menunggu persetujuan Anda.",
                'peminjaman',
                '/dashboard/dosen/peminjaman'
            );

            // Notifikasi ke laboran pengelola lab
            $laboranIds = \App\Models\LaboratoriumPengelola::where('laboratorium_id', $data['laboratorium_id'])
                ->pluck('user_id');

            foreach ($laboranIds as $laboranId) {
                NotifikasiService::kirim(
                    $laboranId,
                    'Peminjaman Baru Diajukan',
                    "Peminjaman {$peminjaman->kode} baru diajukan ke laboratorium Anda.",
                    'peminjaman',
                    '/dashboard/laboran/peminjaman'
                );
            }
        });

        $request->session()->forget('peminjaman');

        return redirect()->route('mahasiswa.peminjaman.index')->with('success', 'Peminjaman berhasil diajukan.');
    }

    public function cancel(Peminjaman $peminjaman)
    {
        if ($peminjaman->user_id !== auth()->id() || ! in_array($peminjaman->status, ['diajukan', 'menunggu_dosen', 'menunggu_laboran'])) {
            return back()->with('error', 'Tidak dapat membatalkan peminjaman ini.');
        }

        DB::transaction(function () use ($peminjaman) {
            $statusLama = $peminjaman->status;

            $peminjaman->update([
                'status' => 'dibatalkan',
                'dibatalkan_oleh' => auth()->id(),
                'catatan' => 'Dibatalkan oleh peminjam.',
            ]);

            foreach ($peminjaman->details as $detail) {
                $alat = Alat::lockForUpdate()->find($detail->alat_id);
                $alat->stok_reserved = max(0, $alat->stok_reserved - $detail->jumlah);
                $alat->save();
            }

            PeminjamanStatusLog::create([
                'peminjaman_id' => $peminjaman->id,
                'status_dari' => $statusLama,
                'status_ke' => 'dibatalkan',
                'keterangan' => 'Dibatalkan oleh peminjam.',
                'user_id' => auth()->id(),
            ]);

            $laboranIds = \App\Models\LaboratoriumPengelola::where('laboratorium_id', $peminjaman->laboratorium_id)
                ->pluck('user_id');

            foreach ($laboranIds as $laboranId) {
                NotifikasiService::kirim(
                    $laboranId,
                    'Peminjaman Dibatalkan',
                    "Peminjaman {$peminjaman->kode} dibatalkan oleh peminjam.",
                    'peminjaman',
                    '/dashboard/laboran/peminjaman'
                );
            }
        });

        return back()->with('success', 'Peminjaman dibatalkan.');
    }

    public function ketersediaan(Request $request, Alat $alat)
    {
        $data = $request->validate([
            'tanggal_mulai' => ['required', 'date'],
            'jam_mulai' => ['required', 'date_format:H:i'],
            'tanggal_selesai' => ['required', 'date'],
            'jam_selesai' => ['required', 'date_format:H:i'],
        ]);

        $mulai = \Carbon\Carbon::parse($data['tanggal_mulai'] . ' ' . $data['jam_mulai']);
        $selesai = \Carbon\Carbon::parse($data['tanggal_selesai'] . ' ' . $data['jam_selesai']);

        return response()->json([
            'alat_id' => $alat->id,
            'nama' => $alat->nama,
            'stok_total' => $alat->stok_total,
            'tersedia' => $alat->ketersediaanUntuk($mulai, $selesai),
            'mulai' => $mulai,
            'selesai' => $selesai,
        ]);
    }
}
