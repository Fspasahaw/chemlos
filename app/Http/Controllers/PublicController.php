<?php

namespace App\Http\Controllers;

use App\Models\Alat;
use App\Models\KontakPesan;
use App\Models\Laboratorium;
use App\Models\MaintenanceAlat;
use App\Models\Peminjaman;
use App\Models\User;
use App\Models\VideoTutorial;
use App\Services\DetailDataService;
use App\Services\KalenderService;
use App\Services\NotifikasiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use ReCaptcha\ReCaptcha;

class PublicController extends Controller
{
    public function beranda()
    {
        $peminjaman = Peminjaman::with([
                'laboratorium:id,nama',
                'user:id,nama_lengkap',
                'dosenPembimbing:id,nama_lengkap',
                'details.alat:id,nama',
            ])
            ->whereNotIn('status', ['ditolak', 'dibatalkan'])
            ->get();

        $maintenance = MaintenanceAlat::with(['laboratorium:id,nama', 'alat:id,nama', 'laboran:id,nama_lengkap'])
            ->whereNotIn('status', ['dibatalkan'])
            ->get();

        $events = $peminjaman
            ->map(fn (Peminjaman $p): array => KalenderService::eventDariPeminjaman($p))
            ->merge($maintenance->map(fn (MaintenanceAlat $m): array => KalenderService::eventDariMaintenance($m)))
            ->values();

        $labOptions = Laboratorium::where('status', 'aktif')
            ->orderBy('nama')
            ->get(['id', 'nama'])
            ->map(fn ($l) => ['value' => (string) $l->id, 'label' => $l->nama]);

        $statusOptions = [
            ['value' => 'diajukan', 'label' => 'Diajukan'],
            ['value' => 'menunggu_dosen', 'label' => 'Menunggu Dosen'],
            ['value' => 'menunggu_laboran', 'label' => 'Menunggu Laboran'],
            ['value' => 'disetujui', 'label' => 'Disetujui'],
            ['value' => 'berlangsung', 'label' => 'Berlangsung'],
            ['value' => 'selesai', 'label' => 'Selesai'],
            ['value' => 'terlambat', 'label' => 'Terlambat'],
            ['value' => 'maintenance', 'label' => 'Dalam Perbaikan'],
        ];

        return Inertia::render('Public/Beranda', [
            'appName' => config('app.name'),
            'stats' => [
                'laboratorium' => Laboratorium::where('status', 'aktif')->count(),
                'alat' => (int) Alat::where('status', 'tersedia')->sum('stok_tersedia'),
                'peminjaman' => Peminjaman::whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
                'pengguna' => User::where('status', 'approved')->count(),
            ],
            'labs' => Laboratorium::withCount('alats')->where('status', 'aktif')->limit(6)->get(),
            'events' => $events,
            'labOptions' => $labOptions,
            'statusOptions' => $statusOptions,
        ]);
    }

    public function laboratorium(Request $request)
    {
        $lokasiOptions = Laboratorium::whereNotNull('lokasi')
            ->distinct()
            ->orderBy('lokasi')
            ->pluck('lokasi')
            ->map(fn ($l) => ['value' => $l, 'label' => $l])
            ->prepend(['value' => '', 'label' => 'Semua'])
            ->values();

        $kapasitasOptions = [
            ['value' => '', 'label' => 'Semua'],
            ['value' => '<20', 'label' => '< 20 orang'],
            ['value' => '20-30', 'label' => '20 - 30 orang'],
            ['value' => '>30', 'label' => '> 30 orang'],
        ];

        return Inertia::render('Public/Laboratorium', [
            'laboratorium' => Laboratorium::withCount('alats')
                ->when($request->search, fn ($q, $s) => $q->where(function ($qq) use ($s) {
                    $qq->where('nama', 'like', "%{$s}%")
                        ->orWhere('kode', 'like', "%{$s}%")
                        ->orWhere('lokasi', 'like', "%{$s}%");
                }))
                ->when($request->status, fn ($q, $s) => $q->where('status', $s))
                ->when($request->lokasi, fn ($q, $l) => $q->where('lokasi', $l))
                ->when($request->kapasitas, function ($q, $r) {
                    match ($r) {
                        '<20' => $q->where('kapasitas', '<', 20),
                        '20-30' => $q->whereBetween('kapasitas', [20, 30]),
                        '>30' => $q->where('kapasitas', '>', 30),
                    };
                })
                ->paginate(12)
                ->withQueryString(),
            'filters' => array_merge(['search' => null, 'status' => null, 'lokasi' => null, 'kapasitas' => null], $request->only('search', 'status', 'lokasi', 'kapasitas')),
            'statusOptions' => [['value' => '', 'label' => 'Semua'], ['value' => 'aktif', 'label' => 'Aktif'], ['value' => 'nonaktif', 'label' => 'Nonaktif']],
            'lokasiOptions' => $lokasiOptions,
            'kapasitasOptions' => $kapasitasOptions,
        ]);
    }

    public function alat(Request $request)
    {
        $laboratoriumOptions = Laboratorium::where('status', 'aktif')
            ->orderBy('nama')
            ->get(['id', 'nama'])
            ->map(fn ($l) => ['value' => (string) $l->id, 'label' => $l->nama])
            ->prepend(['value' => '', 'label' => 'Semua'])
            ->values();

        $kategoriOptions = \App\Models\KategoriAlat::orderBy('nama')
            ->get(['id', 'nama'])
            ->map(fn ($k) => ['value' => (string) $k->id, 'label' => $k->nama])
            ->prepend(['value' => '', 'label' => 'Semua'])
            ->values();

        $query = Alat::with('laboratorium:id,nama,slug', 'kategoriAlat:id,nama,slug')
            ->when($request->search, fn ($q, $s) => $q->where(function ($qq) use ($s) {
                $qq->where('nama', 'like', "%{$s}%")
                    ->orWhere('kode', 'like', "%{$s}%");
            }))
            ->when($request->laboratorium, fn ($q, $id) => $q->where('laboratorium_id', $id))
            ->when($request->kategori, fn ($q, $id) => $q->where('kategori_id', $id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->kondisi, fn ($q, $k) => $q->where('kondisi', $k));

        $sort = $request->input('sort', 'terbaru');
        match ($sort) {
            'nama' => $query->orderBy('nama'),
            'tersedia' => $query->orderByDesc('stok_tersedia'),
            default => $query->orderByDesc('created_at'),
        };

        return Inertia::render('Public/Alat', [
            'alat' => $query->paginate(12)->withQueryString(),
            'filters' => array_merge(['search' => null, 'laboratorium' => null, 'kategori' => null, 'status' => null, 'kondisi' => null, 'sort' => null], $request->only('search', 'laboratorium', 'kategori', 'status', 'kondisi', 'sort')),
            'laboratoriumOptions' => $laboratoriumOptions,
            'kategoriOptions' => $kategoriOptions,
            'statusOptions' => [['value' => '', 'label' => 'Semua'], ['value' => 'tersedia', 'label' => 'Tersedia'], ['value' => 'dipinjam', 'label' => 'Dipinjam'], ['value' => 'maintenance', 'label' => 'Dalam Perbaikan'], ['value' => 'tidak_tersedia', 'label' => 'Tidak Tersedia']],
            'kondisiOptions' => [['value' => '', 'label' => 'Semua'], ['value' => 'baik', 'label' => 'Baik'], ['value' => 'rusak_ringan', 'label' => 'Rusak Ringan'], ['value' => 'rusak_berat', 'label' => 'Rusak Berat']],
        ]);
    }

    public function laboratoriumDetail(string $slug)
    {
        $lab = Laboratorium::with(['alats' => function ($q) {
            $q->with('kategoriAlat:id,nama,slug')->orderBy('nama');
        }, 'galeri' => function ($q) {
            $q->orderBy('urutan');
        }, 'dokumen' => function ($q) {
            $q->orderBy('urutan');
        }, 'laboratoriumTataTertibs' => function ($q) {
            $q->orderBy('urutan');
        }, 'pengelola' => function ($q) {
            $q->with('user:id,nama_lengkap');
        }])
            ->where('slug', $slug)
            ->where('status', 'aktif')
            ->firstOrFail();

        $statusOptions = [
            ['value' => 'diajukan', 'label' => 'Diajukan'],
            ['value' => 'menunggu_dosen', 'label' => 'Menunggu Dosen'],
            ['value' => 'menunggu_laboran', 'label' => 'Menunggu Laboran'],
            ['value' => 'disetujui', 'label' => 'Disetujui'],
            ['value' => 'berlangsung', 'label' => 'Berlangsung'],
            ['value' => 'selesai', 'label' => 'Selesai'],
            ['value' => 'terlambat', 'label' => 'Terlambat'],
            ['value' => 'maintenance', 'label' => 'Dalam Perbaikan'],
        ];

        return Inertia::render('Public/LaboratoriumDetail', [
            'lab' => $lab->toArray(),
            'events' => DetailDataService::eventsForLaboratorium($lab),
            'statusOptions' => $statusOptions,
        ]);
    }

    /**
     * @return \Inertia\Response
     */
    public function alatDetail(string $slug)
    {
        $alat = Alat::with(['laboratorium', 'kategoriAlat', 'galeri', 'dokumen', 'videoTutorials' => function ($q) {
            $q->where('status', 'aktif');
        }])
            ->where('slug', $slug)
            ->firstOrFail();

        $relatedAlats = Alat::with('laboratorium:id,nama,slug')
            ->where('laboratorium_id', $alat->laboratorium_id)
            ->where('id', '!=', $alat->id)
            ->where('stok_tersedia', '>', 0)
            ->limit(4)
            ->get();

        $statusOptions = [
            ['value' => 'diajukan', 'label' => 'Diajukan'],
            ['value' => 'menunggu_dosen', 'label' => 'Menunggu Dosen'],
            ['value' => 'menunggu_laboran', 'label' => 'Menunggu Laboran'],
            ['value' => 'disetujui', 'label' => 'Disetujui'],
            ['value' => 'berlangsung', 'label' => 'Berlangsung'],
            ['value' => 'selesai', 'label' => 'Selesai'],
            ['value' => 'terlambat', 'label' => 'Terlambat'],
            ['value' => 'maintenance', 'label' => 'Dalam Perbaikan'],
        ];

        return Inertia::render('Public/AlatDetail', [
            'alat' => $alat->toArray(),
            'relatedAlats' => $relatedAlats->toArray(),
            'events' => DetailDataService::eventsForAlat($alat),
            'history' => DetailDataService::riwayatForAlat($alat),
            'statusOptions' => $statusOptions,
        ]);
    }

    public function tutorial(Request $request)
    {
        return Inertia::render('Public/Tutorial', [
            'tutorials' => VideoTutorial::with('alat:id,nama,slug')
                ->where('status', 'aktif')
                ->when($request->search, fn ($q, $s) => $q->where('judul', 'like', "%{$s}%"))
                ->when($request->jenis, fn ($q, $j) => $q->where('jenis', $j))
                ->orderByDesc('created_at')
                ->paginate(12)
                ->withQueryString(),
            'filters' => array_merge(['search' => null, 'jenis' => null], $request->only('search', 'jenis')),
            'jenisOptions' => [['value' => '', 'label' => 'Semua'], ['value' => 'alat', 'label' => 'Tutorial Alat'], ['value' => 'aplikasi', 'label' => 'Tutorial Aplikasi']],
        ]);
    }

    public function tutorialDetail(string $slug)
    {
        $video = VideoTutorial::with('alat:id,nama,slug')->where('slug', $slug)->where('status', 'aktif')->firstOrFail();

        return Inertia::render('Public/TutorialDetail', [
            'video' => $video,
            'related' => VideoTutorial::where('status', 'aktif')
                ->where('id', '!=', $video->id)
                ->where(function ($q) use ($video) {
                    $q->where('jenis', $video->jenis)->orWhere('alat_id', $video->alat_id);
                })
                ->limit(4)
                ->get(),
        ]);
    }

    public function tentang()
    {
        return Inertia::render('Public/Tentang', [
            'tentang' => [
                'tagline' => \App\Models\Pengaturan::get('tentang.tagline', 'Sistem informasi peminjaman dan manajemen inventaris alat laboratorium terintegrasi.'),
                'visi' => \App\Models\Pengaturan::get('tentang.visi', 'Menjadikan peminjaman alat laboratorium lebih transparan, efisien, dan terukur.'),
                'misi' => \App\Models\Pengaturan::get('tentang.misi', "1. Memudahkan civitas akademika mengakses alat laboratorium secara online.\n2. Meningkatkan akuntabilitas penggunaan dan pemeliharaan alat.\n3. Mendukung transparansi jadwal, stok, dan status alat laboratorium."),
            ],
        ]);
    }

    public function faq()
    {
        $faqs = \App\Models\Faq::aktif()
            ->orderBy('urutan')
            ->orderBy('id')
            ->get()
            ->groupBy('kategori')
            ->map(fn ($items) => $items->map(fn ($f) => ['q' => $f->pertanyaan, 'a' => $f->jawaban])->values())
            ->toArray();

        return Inertia::render('Public/FAQ', [
            'faqs' => $faqs,
        ]);
    }

    public function kontak()
    {
        return Inertia::render('Public/Kontak');
    }

    public function kirimKontak(Request $request)
    {
        $data = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'subjek' => ['required', 'string', 'max:255'],
            'pesan' => ['required', 'string', 'max:5000'],
            'recaptcha_token' => ['nullable', 'string'],
        ]);

        if (config('services.recaptcha.enabled')) {
            $token = $request->input('recaptcha_token');
            if (empty($token)) {
                throw ValidationException::withMessages(['recaptcha_token' => 'Verifikasi reCAPTCHA wajib diisi.']);
            }

            $recaptcha = new ReCaptcha((string) config('services.recaptcha.secret_key'));
            $response = $recaptcha
                ->setScoreThreshold((float) config('services.recaptcha.score_threshold', 0.5))
                ->setExpectedAction('kontak')
                ->verify($token, $request->ip());

            if (! $response->isSuccess()) {
                throw ValidationException::withMessages(['recaptcha_token' => 'Verifikasi reCAPTCHA gagal. Silakan coba lagi.']);
            }
        }

        $pesan = KontakPesan::create([
            'nama' => $data['nama'],
            'email' => $data['email'],
            'subjek' => $data['subjek'],
            'pesan' => $data['pesan'],
            'status' => 'baru',
        ]);

        $admins = User::role('admin')->get();
        foreach ($admins as $admin) {
            NotifikasiService::kirim(
                $admin,
                'Pesan Kontak Baru',
                "Pesan dari {$data['nama']} dengan subjek \"{$data['subjek']}\" telah diterima.",
                'kontak',
                '/dashboard/admin/pesan-kontak',
                [],
                ['no_email']
            );
        }

        $emailKontak = config('mail.from.address', 'chemlos@che.ui.ac.id');

        Mail::raw($data['pesan'], function ($message) use ($data, $emailKontak) {
            $message->to($emailKontak)
                ->replyTo($data['email'], $data['nama'])
                ->subject('[ChemLOS Kontak] ' . $data['subjek']);
        });

        return back()->with('success', 'Pesan Anda telah dikirim. Tim kami akan segera merespons.');
    }
}
