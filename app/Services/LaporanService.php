<?php

namespace App\Services;

use App\Models\Alat;
use App\Models\KerusakanAlat;
use App\Models\Laboratorium;
use App\Models\MaintenanceAlat;
use App\Models\Peminjaman;
use App\Models\Pengembalian;
use App\Models\ProgramStudi;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Activity;
use Spatie\Permission\Models\Role;

class LaporanService
{
    private const JENIS_LABELS = [
        'pengguna' => 'Pengguna',
        'laboratorium' => 'Laboratorium',
        'alat' => 'Alat',
        'kerusakan' => 'Riwayat Kerusakan',
        'maintenance' => 'Maintenance',
        'peminjaman' => 'Peminjaman',
        'pengembalian' => 'Pengembalian',
        'aktivitas' => 'Audit Log / Aktivitas',
    ];

    private const STATUS_OPTIONS = [
        'user' => ['pending_email' => 'Pending Email', 'pending_approval' => 'Pending Persetujuan', 'approved' => 'Aktif', 'rejected' => 'Ditolak', 'suspended' => 'Dinonaktifkan'],
        'peminjaman' => ['diajukan' => 'Diajukan', 'menunggu_dosen' => 'Menunggu Dosen', 'menunggu_laboran' => 'Menunggu Laboran', 'disetujui' => 'Disetujui', 'berlangsung' => 'Berlangsung', 'selesai' => 'Selesai', 'terlambat' => 'Terlambat', 'ditolak' => 'Ditolak', 'dibatalkan' => 'Dibatalkan'],
        'kerusakan' => ['dilaporkan' => 'Dilaporkan', 'dicek' => 'Dicek', 'maintenance' => 'Maintenance', 'diabaikan' => 'Diabaikan', 'selesai' => 'Selesai'],
        'maintenance' => ['dijadwalkan' => 'Dijadwalkan', 'berlangsung' => 'Berlangsung', 'selesai' => 'Selesai', 'dibatalkan' => 'Dibatalkan'],
        'alat' => ['tersedia' => 'Tersedia', 'dipinjam' => 'Dipinjam', 'maintenance' => 'Maintenance', 'tidak_tersedia' => 'Tidak Tersedia'],
        'alat_kondisi' => ['baik' => 'Baik', 'rusak_ringan' => 'Rusak Ringan', 'rusak_berat' => 'Rusak Berat', 'hilang' => 'Hilang'],
        'laboratorium' => ['aktif' => 'Aktif', 'nonaktif' => 'Nonaktif'],
    ];

    private const FIELDS = [
        'pengguna' => ['nama', 'email', 'npm_nip', 'peran', 'program_studi', 'status', 'tanggal_daftar'],
        'laboratorium' => ['kode', 'nama', 'lokasi', 'kapasitas', 'jumlah_alat', 'kepala_lab', 'laboran', 'status'],
        'alat' => ['kode', 'nama', 'laboratorium', 'kategori', 'stok_total', 'stok_tersedia', 'stok_dipinjam', 'stok_maintenance', 'kondisi', 'status'],
        'kerusakan' => ['kode_alat', 'nama_alat', 'laboratorium', 'jumlah', 'kondisi', 'status', 'pelapor', 'tanggal'],
        'maintenance' => ['kode_alat', 'nama_alat', 'laboratorium', 'jumlah', 'teknisi', 'tanggal_mulai', 'tanggal_selesai', 'biaya', 'status'],
        'peminjaman' => ['kode', 'peminjam', 'laboratorium', 'dosen', 'alat', 'periode', 'status', 'denda'],
        'pengembalian' => ['kode_peminjaman', 'peminjam', 'laboratorium', 'alat', 'tanggal_kembali', 'kondisi', 'denda'],
        'aktivitas' => ['waktu', 'pengguna', 'aktivitas', 'entitas', 'perubahan'],
    ];

    private const LABELS = [
        'pengguna' => ['Nama', 'Email', 'NPM/NIP', 'Peran', 'Program Studi', 'Status', 'Tanggal Daftar'],
        'laboratorium' => ['Kode', 'Nama', 'Lokasi', 'Kapasitas', 'Jumlah Alat', 'Kepala Lab', 'Laboran', 'Status'],
        'alat' => ['Kode', 'Nama', 'Laboratorium', 'Kategori', 'Stok Total', 'Stok Tersedia', 'Stok Dipinjam', 'Stok Maintenance', 'Kondisi', 'Status'],
        'kerusakan' => ['Kode Alat', 'Nama Alat', 'Laboratorium', 'Jumlah', 'Kondisi', 'Status', 'Pelapor', 'Tanggal'],
        'maintenance' => ['Kode Alat', 'Nama Alat', 'Laboratorium', 'Jumlah', 'Teknisi', 'Tanggal Mulai', 'Tanggal Selesai', 'Biaya', 'Status'],
        'peminjaman' => ['Kode', 'Peminjam', 'Laboratorium', 'Dosen Pembimbing', 'Alat', 'Periode', 'Status', 'Denda'],
        'pengembalian' => ['Kode Peminjaman', 'Peminjam', 'Laboratorium', 'Alat', 'Tanggal Kembali', 'Kondisi', 'Denda'],
        'aktivitas' => ['Waktu', 'Pengguna', 'Aktivitas', 'Entitas', 'Perubahan'],
    ];

    public static function allowedJenis(string $type): array
    {
        return match ($type) {
            'admin', 'pimpinan' => ['pengguna', 'laboratorium', 'alat', 'kerusakan', 'maintenance', 'peminjaman', 'pengembalian', 'aktivitas'],
            'kepala_lab', 'laboran' => ['laboratorium', 'alat', 'kerusakan', 'maintenance', 'peminjaman', 'pengembalian'],
            'dosen' => ['kerusakan', 'peminjaman', 'pengembalian'],
            default => ['peminjaman'],
        };
    }

    public static function label(string $jenis): string
    {
        return self::JENIS_LABELS[$jenis] ?? Str::title(str_replace('_', ' ', $jenis));
    }

    public static function filterKeys(string $jenis): array
    {
        return match ($jenis) {
            'pengguna' => ['search', 'status', 'role', 'program_studi_id', 'start', 'end'],
            'laboratorium' => ['search', 'status', 'start', 'end'],
            'alat' => ['search', 'laboratorium_id', 'kategori_id', 'status', 'kondisi', 'start', 'end'],
            'kerusakan' => ['search', 'status', 'kondisi', 'laboratorium_id', 'start', 'end'],
            'maintenance' => ['search', 'status', 'laboratorium_id', 'start', 'end'],
            'peminjaman' => ['search', 'status', 'laboratorium_id', 'start', 'end'],
            'pengembalian' => ['search', 'status', 'laboratorium_id', 'start', 'end'],
            'aktivitas' => ['search', 'user', 'action', 'tabel', 'start', 'end'],
            default => ['search', 'start', 'end'],
        };
    }

    public static function filtersFromRequest($request, string $jenis): array
    {
        $filters = [];
        foreach (self::filterKeys($jenis) as $key) {
            $filters[$key] = $request->input($key);
        }
        return $filters;
    }

    public static function query(string $jenis, array $filters, array $context): Builder
    {
        $type = $context['type'] ?? 'admin';
        $labIds = $context['labIds'] ?? [];
        $dosenId = $context['dosenId'] ?? null;

        $search = $filters['search'] ?? null;
        $status = $filters['status'] ?? null;
        $start = $filters['start'] ?? null;
        $end = $filters['end'] ?? null;

        return match ($jenis) {
            'pengguna' => self::queryPengguna($search, $status, $filters['role'] ?? null, $filters['program_studi_id'] ?? null, $start, $end),
            'laboratorium' => self::queryLaboratorium($search, $status, $start, $end, $labIds),
            'alat' => self::queryAlat($search, $filters['laboratorium_id'] ?? null, $filters['kategori_id'] ?? null, $status, $filters['kondisi'] ?? null, $start, $end, $labIds),
            'kerusakan' => self::queryKerusakan($search, $status, $filters['kondisi'] ?? null, $filters['laboratorium_id'] ?? null, $start, $end, $labIds, $dosenId),
            'maintenance' => self::queryMaintenance($search, $status, $filters['laboratorium_id'] ?? null, $start, $end, $labIds),
            'peminjaman' => self::queryPeminjaman($search, $status, $filters['laboratorium_id'] ?? null, $start, $end, $labIds, $dosenId),
            'pengembalian' => self::queryPengembalian($search, $status, $filters['laboratorium_id'] ?? null, $start, $end, $labIds, $dosenId),
            'aktivitas' => self::queryAktivitas($search, $filters['user'] ?? null, $filters['action'] ?? null, $filters['tabel'] ?? null, $start, $end),
            default => Peminjaman::query(),
        };
    }

    private static function queryPengguna(?string $search, ?string $status, ?string $role, ?string $prodiId, ?string $start, ?string $end): Builder
    {
        return User::with('roles:id,name', 'programStudi:id,nama')
            ->when($search, fn ($q, $s) => $q->where(fn ($qq) => $qq
                ->where('nama_lengkap', 'like', "%{$s}%")
                ->orWhere('email', 'like', "%{$s}%")
                ->orWhere('npm_nip', 'like', "%{$s}%")))
            ->when($status, fn ($q, $s) => $q->where('status', $s))
            ->when($role, fn ($q, $r) => $q->role($r))
            ->when($prodiId, fn ($q, $id) => $q->where('program_studi_id', $id))
            ->when($start, fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($end, fn ($q, $d) => $q->whereDate('created_at', '<=', $d));
    }

    private static function queryLaboratorium(?string $search, ?string $status, ?string $start, ?string $end, array $labIds): Builder
    {
        return Laboratorium::withCount('alats')->with('pengelola.user:id,nama_lengkap,email', 'pengelola')
            ->when($labIds, fn ($q, $ids) => $q->whereIn('id', $ids))
            ->when($search, fn ($q, $s) => $q->where(fn ($qq) => $qq
                ->where('nama', 'like', "%{$s}%")
                ->orWhere('kode', 'like', "%{$s}%")
                ->orWhere('lokasi', 'like', "%{$s}%")))
            ->when($status, fn ($q, $s) => $q->where('status', $s))
            ->when($start, fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($end, fn ($q, $d) => $q->whereDate('created_at', '<=', $d));
    }

    private static function queryAlat(?string $search, ?string $labId, ?string $katId, ?string $status, ?string $kondisi, ?string $start, ?string $end, array $labIds): Builder
    {
        return Alat::with('laboratorium:id,nama', 'kategoriAlat:id,nama')
            ->when($labIds, fn ($q, $ids) => $q->whereIn('laboratorium_id', $ids))
            ->when($search, fn ($q, $s) => $q->where(fn ($qq) => $qq
                ->where('nama', 'like', "%{$s}%")
                ->orWhere('kode', 'like', "%{$s}%")))
            ->when($labId, fn ($q, $id) => $q->where('laboratorium_id', $id))
            ->when($katId, fn ($q, $id) => $q->where('kategori_id', $id))
            ->when($status, fn ($q, $s) => $q->where('status', $s))
            ->when($kondisi, fn ($q, $s) => $q->where('kondisi', $s))
            ->when($start, fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($end, fn ($q, $d) => $q->whereDate('created_at', '<=', $d));
    }

    private static function queryKerusakan(?string $search, ?string $status, ?string $kondisi, ?string $labId, ?string $start, ?string $end, array $labIds, ?int $dosenId): Builder
    {
        return KerusakanAlat::with('alat:id,nama,kode,laboratorium_id', 'alat.laboratorium:id,nama', 'pelapor:id,nama_lengkap', 'peminjaman:id,kode')
            ->when($dosenId, fn ($q) => $q->whereHas('peminjaman', fn ($qq) => $qq->where('dosen_pembimbing_id', $dosenId)))
            ->when($labIds, fn ($q, $ids) => $q->whereHas('alat', fn ($qq) => $qq->whereIn('laboratorium_id', $ids)))
            ->when($search, fn ($q, $s) => $q->whereHas('alat', fn ($qq) => $qq
                ->where('nama', 'like', "%{$s}%")
                ->orWhere('kode', 'like', "%{$s}%")))
            ->when($labId, fn ($q, $id) => $q->whereHas('alat', fn ($qq) => $qq->where('laboratorium_id', $id)))
            ->when($status, fn ($q, $s) => $q->where('status', $s))
            ->when($kondisi, fn ($q, $s) => $q->where('kondisi', $s))
            ->when($start, fn ($q, $d) => $q->whereDate('tanggal_dilaporkan', '>=', $d))
            ->when($end, fn ($q, $d) => $q->whereDate('tanggal_dilaporkan', '<=', $d));
    }

    private static function queryMaintenance(?string $search, ?string $status, ?string $labId, ?string $start, ?string $end, array $labIds): Builder
    {
        return MaintenanceAlat::with('alat:id,nama,kode', 'laboratorium:id,nama', 'laboran:id,nama_lengkap')
            ->when($labIds, fn ($q, $ids) => $q->whereIn('laboratorium_id', $ids))
            ->when($search, fn ($q, $s) => $q->whereHas('alat', fn ($qq) => $qq
                ->where('nama', 'like', "%{$s}%")
                ->orWhere('kode', 'like', "%{$s}%")))
            ->when($labId, fn ($q, $id) => $q->where('laboratorium_id', $id))
            ->when($status, fn ($q, $s) => $q->where('status', $s))
            ->when($start, fn ($q, $d) => $q->whereDate('tanggal_mulai', '>=', $d))
            ->when($end, fn ($q, $d) => $q->whereDate('tanggal_mulai', '<=', $d));
    }

    private static function queryPeminjaman(?string $search, ?string $status, ?string $labId, ?string $start, ?string $end, array $labIds, ?int $dosenId): Builder
    {
        return Peminjaman::with('user:id,nama_lengkap,npm_nip', 'laboratorium:id,nama', 'dosenPembimbing:id,nama_lengkap', 'details.alat:id,nama,kode', 'pengembalian:id,peminjaman_id,total_denda')
            ->when($dosenId, fn ($q) => $q->where('dosen_pembimbing_id', $dosenId))
            ->when($labIds, fn ($q, $ids) => $q->whereIn('laboratorium_id', $ids))
            ->when($search, fn ($q, $s) => $q->where(fn ($qq) => $qq
                ->where('kode', 'like', "%{$s}%")
                ->orWhereHas('user', fn ($u) => $u->where('nama_lengkap', 'like', "%{$s}%"))))
            ->when($labId, fn ($q, $id) => $q->where('laboratorium_id', $id))
            ->when($status, fn ($q, $s) => $q->where('status', $s))
            ->when($start, fn ($q, $d) => $q->whereDate('tanggal_mulai', '>=', $d))
            ->when($end, fn ($q, $d) => $q->whereDate('tanggal_selesai', '<=', $d));
    }

    private static function queryPengembalian(?string $search, ?string $status, ?string $labId, ?string $start, ?string $end, array $labIds, ?int $dosenId): Builder
    {
        return Pengembalian::with('peminjaman.user:id,nama_lengkap,npm_nip', 'peminjaman.laboratorium:id,nama', 'peminjaman.details.alat:id,nama,kode')
            ->when($dosenId, fn ($q) => $q->whereHas('peminjaman', fn ($qq) => $qq->where('dosen_pembimbing_id', $dosenId)))
            ->when($labIds, fn ($q, $ids) => $q->whereHas('peminjaman', fn ($qq) => $qq->whereIn('laboratorium_id', $ids)))
            ->when($search, fn ($q, $s) => $q->whereHas('peminjaman', fn ($qq) => $qq
                ->where('kode', 'like', "%{$s}%")
                ->orWhereHas('user', fn ($u) => $u->where('nama_lengkap', 'like', "%{$s}%"))))
            ->when($labId, fn ($q, $id) => $q->whereHas('peminjaman', fn ($qq) => $qq->where('laboratorium_id', $id)))
            ->when($status, fn ($q, $s) => $q->whereHas('peminjaman', fn ($qq) => $qq->where('status', $s)))
            ->when($start, fn ($q, $d) => $q->whereDate('waktu_pengembalian', '>=', $d))
            ->when($end, fn ($q, $d) => $q->whereDate('waktu_pengembalian', '<=', $d));
    }

    private static function queryAktivitas(?string $search, ?string $userId, ?string $action, ?string $tabel, ?string $start, ?string $end): Builder
    {
        return Activity::with('causer:id,nama_lengkap', 'subject')
            ->when($search, fn ($q, $s) => $q->where('description', 'like', "%{$s}%"))
            ->when($userId, fn ($q, $id) => $q->where('causer_id', $id)->where('causer_type', User::class))
            ->when($action, fn ($q, $s) => $q->where('event', 'like', "%{$s}%"))
            ->when($tabel, fn ($q, $s) => $q->where('subject_type', 'like', "%{$s}%"))
            ->when($start, fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($end, fn ($q, $d) => $q->whereDate('created_at', '<=', $d));
    }

    public static function fields(string $jenis): array
    {
        return self::FIELDS[$jenis] ?? [];
    }

    public static function columns(string $jenis): array
    {
        $fields = self::FIELDS[$jenis] ?? [];
        $labels = self::LABELS[$jenis] ?? [];
        $columns = [];
        foreach ($fields as $i => $key) {
            $columns[] = ['key' => $key, 'label' => $labels[$i] ?? $key];
        }
        return $columns;
    }

    public static function headings(string $jenis): array
    {
        return self::LABELS[$jenis] ?? [];
    }

    public static function row(string $jenis, $item): array
    {
        $row = match ($jenis) {
            'pengguna' => [
                'nama' => $item->nama_lengkap,
                'email' => $item->email,
                'npm_nip' => $item->npm_nip,
                'peran' => $item->roles->pluck('name')->implode(', '),
                'program_studi' => $item->programStudi?->nama ?? '-',
                'status' => $item->status,
                'tanggal_daftar' => $item->created_at?->format('Y-m-d H:i'),
            ],
            'laboratorium' => [
                'kode' => $item->kode,
                'nama' => $item->nama,
                'lokasi' => $item->lokasi,
                'kapasitas' => $item->kapasitas ?? '-',
                'jumlah_alat' => $item->alats_count ?? 0,
                'kepala_lab' => self::formatPengelola($item->pengelola, 'kepala_lab'),
                'laboran' => self::formatPengelola($item->pengelola, 'laboran'),
                'status' => $item->status,
            ],
            'alat' => [
                'kode' => $item->kode,
                'nama' => $item->nama,
                'laboratorium' => $item->laboratorium?->nama ?? '-',
                'kategori' => $item->kategoriAlat?->nama ?? '-',
                'stok_total' => $item->stok_total ?? 0,
                'stok_tersedia' => $item->stok_tersedia ?? 0,
                'stok_dipinjam' => $item->stok_dipinjam ?? 0,
                'stok_maintenance' => $item->stok_maintenance ?? 0,
                'kondisi' => $item->kondisi,
                'status' => $item->status,
            ],
            'kerusakan' => [
                'kode_alat' => $item->alat?->kode ?? '-',
                'nama_alat' => $item->alat?->nama ?? '-',
                'laboratorium' => $item->alat?->laboratorium?->nama ?? '-',
                'jumlah' => $item->jumlah,
                'kondisi' => $item->kondisi,
                'status' => $item->status,
                'pelapor' => $item->pelapor?->nama_lengkap ?? '-',
                'tanggal' => $item->tanggal_dilaporkan?->format('Y-m-d'),
            ],
            'maintenance' => [
                'kode_alat' => $item->alat?->kode ?? '-',
                'nama_alat' => $item->alat?->nama ?? '-',
                'laboratorium' => $item->laboratorium?->nama ?? '-',
                'jumlah' => $item->jumlah,
                'teknisi' => $item->teknisi ?? ($item->laboran?->nama_lengkap ?? '-'),
                'tanggal_mulai' => $item->tanggal_mulai?->format('Y-m-d'),
                'tanggal_selesai' => $item->tanggal_selesai?->format('Y-m-d') ?? '-',
                'biaya' => $item->biaya ? 'Rp ' . number_format($item->biaya, 0, ',', '.') : '-',
                'status' => $item->status,
            ],
            'peminjaman' => [
                'kode' => $item->kode,
                'peminjam' => $item->user?->nama_lengkap ?? '-',
                'laboratorium' => $item->laboratorium?->nama ?? '-',
                'dosen' => $item->dosenPembimbing?->nama_lengkap ?? '-',
                'alat' => $item->details->map(fn ($d) => ($d->alat?->nama ?? '-') . ' (' . ($d->jumlah ?? 1) . ')')->implode(', ') ?: '-',
                'periode' => $item->tanggal_mulai && $item->tanggal_selesai
                    ? $item->tanggal_mulai->format('Y-m-d') . ' s/d ' . $item->tanggal_selesai->format('Y-m-d')
                    : '-',
                'status' => $item->status,
                'denda' => 'Rp ' . number_format($item->pengembalian?->total_denda ?? 0, 0, ',', '.'),
            ],
            'pengembalian' => [
                'kode_peminjaman' => $item->peminjaman?->kode ?? '-',
                'peminjam' => $item->peminjaman?->user?->nama_lengkap ?? '-',
                'laboratorium' => $item->peminjaman?->laboratorium?->nama ?? '-',
                'alat' => $item->peminjaman?->details->map(fn ($d) => ($d->alat?->nama ?? '-') . ' (' . ($d->kondisi_pengembalian ?? $d->alat?->kondisi ?? '-') . ')')->implode(', ') ?: '-',
                'tanggal_kembali' => $item->waktu_pengembalian?->format('Y-m-d H:i') ?? '-',
                'kondisi' => collect($item->peminjaman?->details ?? [])
                    ->map(fn ($d) => ($d->alat?->nama ?? '-') . ': ' . ($d->kondisi_pengembalian ?? '-'))
                    ->implode(', ') ?: '-',
                'denda' => 'Rp ' . number_format($item->total_denda ?? 0, 0, ',', '.'),
            ],
            'aktivitas' => [
                'waktu' => $item->created_at?->format('Y-m-d H:i:s'),
                'pengguna' => $item->causer?->nama_lengkap ?? 'Sistem',
                'aktivitas' => $item->description,
                'entitas' => $item->subject_type ? (class_basename($item->subject_type) . ' #' . $item->subject_id) : '-',
                'perubahan' => $item->properties ? json_encode($item->properties, JSON_UNESCAPED_UNICODE) : '-',
            ],
            default => [],
        };

        // Pastikan urutan key sesuai FIELDS untuk preview & export
        $ordered = [];
        foreach (self::FIELDS[$jenis] ?? [] as $key) {
            $ordered[$key] = $row[$key] ?? '-';
        }
        return $ordered;
    }

    private static function formatPengelola($pengelola, string $peran): string
    {
        if (! $pengelola || $pengelola->isEmpty()) {
            return '-';
        }

        return $pengelola
            ->filter(fn ($p) => $p->peran === $peran)
            ->map(fn ($p) => $p->user?->nama_lengkap ?? $p->user?->name ?? '-')
            ->implode(', ') ?: '-';
    }

    public static function filterOptions(string $jenis, array $context): array
    {
        $type = $context['type'] ?? 'admin';
        $labIds = $context['labIds'] ?? [];

        $allLabs = in_array($type, ['laboran', 'kepala_lab'])
            ? Laboratorium::whereIn('id', $labIds)->orderBy('nama')->pluck('nama', 'id')
            : Laboratorium::aktif()->orderBy('nama')->pluck('nama', 'id');

        return match ($jenis) {
            'pengguna' => [
                'status' => self::STATUS_OPTIONS['user'],
                'role' => Role::orderBy('name')->pluck('name', 'name')->toArray(),
                'program_studi' => ProgramStudi::aktif()->orderBy('nama')->pluck('nama', 'id')->toArray(),
            ],
            'laboratorium' => ['status' => self::STATUS_OPTIONS['laboratorium']],
            'alat' => [
                'laboratorium' => $allLabs->toArray(),
                'kategori' => \App\Models\KategoriAlat::orderBy('nama')->pluck('nama', 'id')->toArray(),
                'status' => self::STATUS_OPTIONS['alat'],
                'kondisi' => self::STATUS_OPTIONS['alat_kondisi'],
            ],
            'kerusakan' => [
                'laboratorium' => $allLabs->toArray(),
                'status' => self::STATUS_OPTIONS['kerusakan'],
                'kondisi' => self::STATUS_OPTIONS['alat_kondisi'],
            ],
            'maintenance' => [
                'laboratorium' => $allLabs->toArray(),
                'status' => self::STATUS_OPTIONS['maintenance'],
            ],
            'peminjaman' => [
                'laboratorium' => $allLabs->toArray(),
                'status' => self::STATUS_OPTIONS['peminjaman'],
            ],
            'pengembalian' => [
                'laboratorium' => $allLabs->toArray(),
                'status' => self::STATUS_OPTIONS['peminjaman'],
            ],
            'aktivitas' => [
                'user' => User::orderBy('nama_lengkap')->pluck('nama_lengkap', 'id')->toArray(),
                'tabel' => [
                    'User' => 'User',
                    'Laboratorium' => 'Laboratorium',
                    'Alat' => 'Alat',
                    'Peminjaman' => 'Peminjaman',
                    'KerusakanAlat' => 'Kerusakan Alat',
                    'MaintenanceAlat' => 'Maintenance Alat',
                    'Pengaturan' => 'Pengaturan',
                ],
            ],
            default => [],
        };
    }

    public static function statusLabel(string $group, string $value): string
    {
        $map = self::STATUS_OPTIONS[$group] ?? [];
        return $map[$value] ?? $value;
    }

    public static function filename(string $jenis, string $ext = 'xlsx'): string
    {
        return 'laporan-' . str_replace('_', '-', $jenis) . '-' . now()->format('Y-m-d_His') . '.' . $ext;
    }
}
