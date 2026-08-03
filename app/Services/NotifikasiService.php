<?php

namespace App\Services;

use App\Events\NotifikasiBaru;
use App\Mail\NotifikasiMail;
use App\Models\Notifikasi;
use App\Models\Pengaturan;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class NotifikasiService
{
    /**
     * Map kategori notifikasi ke base key template yang tersedia di pengaturan.
     * Jika kategori belum memiliki template khusus, fallback ke 'umum'.
     */
    protected static array $templateMap = [
        'umum' => 'umum',
        'kontak' => 'umum',
        'peminjaman' => 'peminjaman',
        'pengingat_serah_terima' => 'pengingat_serah_terima',
        'pengingat_pengembalian' => 'pengingat_pengembalian',
        'peminjaman_terlambat' => 'peminjaman_terlambat',
        'pengguna' => 'pengguna',
        'akun_disetujui' => 'pengguna',
        'akun_ditolak' => 'pengguna',
        'pendaftaran_baru' => 'pengguna',
        'email_terverifikasi' => 'pengguna',
        'kerusakan' => 'kerusakan',
        'maintenance' => 'maintenance',
        'denda' => 'peminjaman',
    ];

    public static function kirim(
        User|int $penerima,
        string $judul,
        string $pesan,
        string $kategori = 'umum',
        ?string $link = null,
        array $data = [],
        array $opsi = []
    ): ?Notifikasi {
        $user = $penerima instanceof User ? $penerima : User::find($penerima);

        if (! $user) {
            Log::warning('Notifikasi tidak dikirim: penerima tidak ditemukan.', ['penerima' => $penerima]);

            return null;
        }

        $emailEnabled = Pengaturan::getBool('notifikasi.email_enabled', true);
        $waEnabled = Pengaturan::getBool('notifikasi.whatsapp_enabled', false);

        $baseTemplate = self::resolveTemplateBase($kategori);
        $templateKey = "notifikasi.template_email_{$baseTemplate}";
        $waTemplateKey = "notifikasi.template_whatsapp_{$baseTemplate}";
        $emailTemplate = Pengaturan::get($templateKey) ?: Pengaturan::get('notifikasi.template_email_umum');
        $waTemplate = Pengaturan::get($waTemplateKey) ?: Pengaturan::get('notifikasi.template_whatsapp_umum');

        $variableMap = array_merge([
            'nama' => $data['nama'] ?? $data['nama_lengkap'] ?? $user->nama_lengkap,
            'nama_lengkap' => $data['nama_lengkap'] ?? $user->nama_lengkap,
            'email' => $user->email,
            'kode' => $data['kode'] ?? $data['kode_peminjaman'] ?? null,
            'kode_peminjaman' => $data['kode_peminjaman'] ?? $data['kode'] ?? null,
            'status' => $data['status'] ?? self::deriveStatus($kategori) ?? null,
            'alasan' => $data['alasan'] ?? null,
            'batas' => $data['batas'] ?? null,
            'laboratorium' => $data['laboratorium'] ?? null,
            'alat' => $data['alat'] ?? null,
            'denda' => $data['denda'] ?? null,
            'tanggal_mulai' => $data['tanggal_mulai'] ?? null,
            'tanggal_selesai' => $data['tanggal_selesai'] ?? null,
            'teknisi' => $data['teknisi'] ?? null,
            'biaya' => $data['biaya'] ?? null,
            'kondisi' => $data['kondisi'] ?? null,
            'pelapor' => $data['pelapor'] ?? null,
            'jumlah' => $data['jumlah'] ?? null,
            'foto' => $data['foto'] ?? null,
            'pesan' => $pesan,
            'link' => $link ?? ($data['link_detail'] ?? null),
            'link_detail' => $link ?? ($data['link_detail'] ?? null),
        ], $data);

        $emailBody = $emailTemplate ? self::isiTemplate($emailTemplate, $variableMap) : $pesan;
        $waBody = $waTemplate ? self::isiTemplate($waTemplate, $variableMap) : $pesan;

        $context = array_merge($variableMap, [
            'pesan_templated' => $emailBody,
        ]);

        $notifikasi = null;
        $inAppEnabled = ($user->notifikasi_in_app ?? true) && ! in_array('no_in_app', $opsi, true);

        if ($inAppEnabled) {
            $notifikasi = Notifikasi::create([
                'user_id' => $user->id,
                'judul' => $judul,
                'pesan' => $pesan,
                'kategori' => $kategori,
                'jenis' => self::mapKategoriToJenis($kategori),
                'link' => $link,
            ]);

            try {
                broadcast(new NotifikasiBaru($notifikasi));
            } catch (\Throwable $e) {
                Log::warning('Broadcast notifikasi gagal: '.$e->getMessage());
            }
        }

        $mailModel = $notifikasi ?? new Notifikasi([
            'user_id' => $user->id,
            'judul' => $judul,
            'pesan' => $pesan,
            'kategori' => $kategori,
            'jenis' => self::mapKategoriToJenis($kategori),
            'link' => $link,
        ]);

        if ($emailEnabled && $user->notifikasi_email !== false && ! in_array('no_email', $opsi, true)) {
            try {
                Mail::to($user->email)->queue(new NotifikasiMail($mailModel, $context));
            } catch (\Throwable $e) {
                Log::error('Gagal mengirim email notifikasi: '.$e->getMessage());
            }
        }

        if ($waEnabled && $user->notifikasi_whatsapp !== false && ! in_array('no_wa', $opsi, true)) {
            try {
                WhatsAppService::kirim($user->no_hp, $judul, $waBody, $context);
            } catch (\Throwable $e) {
                Log::error('Gagal mengirim WA notifikasi: '.$e->getMessage());
            }
        }

        return $notifikasi;
    }

    public static function kirimBanyak(
        array $penerimaIds,
        string $judul,
        string $pesan,
        string $kategori = 'umum',
        ?string $link = null,
        array $data = []
    ): void {
        foreach ($penerimaIds as $id) {
            self::kirim($id, $judul, $pesan, $kategori, $link, $data);
        }
    }

    private static function isiTemplate(string $template, array $variables): string
    {
        return preg_replace_callback('/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/', function ($matches) use ($variables) {
            $key = $matches[1];

            return (string) ($variables[$key] ?? $matches[0]);
        }, $template);
    }

    public static function mapKategoriToJenis(string $kategori): string
    {
        $kategoriLower = strtolower($kategori);

        if (str_contains($kategoriLower, 'kerusakan') || str_contains($kategoriLower, 'terlambat') || str_contains($kategoriLower, 'ditolak') || str_contains($kategoriLower, 'dibatalkan') || str_contains($kategoriLower, 'rusak') || str_contains($kategoriLower, 'gagal') || str_contains($kategoriLower, 'danger')) {
            return 'danger';
        }

        if (str_contains($kategoriLower, 'pengingat') || str_contains($kategoriLower, 'peringatan') || str_contains($kategoriLower, 'maintenance') || str_contains($kategoriLower, 'warning')) {
            return 'warning';
        }

        if (str_contains($kategoriLower, 'disetujui') || str_contains($kategoriLower, 'selesai') || str_contains($kategoriLower, 'diterima') || str_contains($kategoriLower, 'success') || str_contains($kategoriLower, 'sukses')) {
            return 'success';
        }

        return 'info';
    }

    private static function resolveTemplateBase(string $kategori): string
    {
        $slug = Str::slug($kategori, '_');

        return self::$templateMap[$slug] ?? self::$templateMap[$kategori] ?? 'umum';
    }

    private static function deriveStatus(string $kategori): ?string
    {
        return match (Str::slug($kategori, '_')) {
            'akun_disetujui' => 'disetujui',
            'akun_ditolak' => 'ditolak',
            'pendaftaran_baru' => 'menunggu persetujuan',
            'email_terverifikasi' => 'terverifikasi',
            default => null,
        };
    }
}
