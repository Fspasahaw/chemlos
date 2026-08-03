<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Alat extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $table = 'alat';

    protected $fillable = [
        'nama',
        'kode',
        'slug',
        'laboratorium_id',
        'kategori_id',
        'deskripsi',
        'spesifikasi',
        'kondisi',
        'status',
        'stok_total',
        'stok_tersedia',
        'stok_reserved',
        'stok_dipinjam',
        'stok_maintenance',
        'persyaratan_khusus',
        'pelatihan_wajib',
        'foto_utama',
        'qr_kode_path',
    ];

    protected function casts(): array
    {
        return [
            'spesifikasi' => 'array',
            'kondisi' => 'string',
            'status' => 'string',
            'stok_total' => 'integer',
            'stok_tersedia' => 'integer',
            'stok_reserved' => 'integer',
            'stok_dipinjam' => 'integer',
            'stok_maintenance' => 'integer',
            'pelatihan_wajib' => 'boolean',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->setDescriptionForEvent(fn (string $eventName) => "Alat {$eventName}");
    }

    protected function stokTersediaAktual(): Attribute
    {
        return Attribute::make(
            get: fn () => max(0, (int) ($this->stok_total ?? 0) - (int) ($this->stok_reserved ?? 0) - (int) ($this->stok_dipinjam ?? 0) - (int) ($this->stok_maintenance ?? 0))
        );
    }

    protected static function booted(): void
    {
        static::saving(static function (self $alat) {
            $alat->stok_tersedia = $alat->hitungStokTersedia();
            $alat->status = $alat->tentukanStatus();
        });
    }

    public function laboratorium(): BelongsTo
    {
        return $this->belongsTo(Laboratorium::class);
    }

    public function kategoriAlat(): BelongsTo
    {
        return $this->belongsTo(KategoriAlat::class, 'kategori_id');
    }

    public function alatGaleris(): HasMany
    {
        return $this->hasMany(AlatGaleri::class, 'alat_id');
    }

    public function galeri(): HasMany
    {
        return $this->alatGaleris();
    }

    public function alatDokumens(): HasMany
    {
        return $this->hasMany(AlatDokumen::class, 'alat_id');
    }

    public function dokumen(): HasMany
    {
        return $this->alatDokumens();
    }

    public function videoTutorials(): HasMany
    {
        return $this->hasMany(VideoTutorial::class, 'alat_id');
    }

    public function kerusakanAlats(): HasMany
    {
        return $this->hasMany(KerusakanAlat::class, 'alat_id');
    }

    public function maintenanceAlats(): HasMany
    {
        return $this->hasMany(MaintenanceAlat::class, 'alat_id');
    }

    public function peminjamanDetails(): HasMany
    {
        return $this->hasMany(PeminjamanDetail::class, 'alat_id');
    }

    public function hitungStokTersedia(): int
    {
        $total = (int) ($this->stok_total ?? 0);
        $reserved = (int) ($this->stok_reserved ?? 0);
        $dipinjam = (int) ($this->stok_dipinjam ?? 0);
        $maintenance = (int) ($this->stok_maintenance ?? 0);

        return max(0, $total - $reserved - $dipinjam - $maintenance);
    }

    public function tentukanStatus(): string
    {
        $total = (int) ($this->stok_total ?? 0);
        $maintenance = (int) ($this->stok_maintenance ?? 0);
        $dipinjam = (int) ($this->stok_dipinjam ?? 0);
        $tersedia = (int) ($this->stok_tersedia ?? 0);

        if ($maintenance > 0 && $maintenance === $total) {
            return 'maintenance';
        }

        if ($tersedia > 0) {
            return 'tersedia';
        }

        if ($dipinjam > 0) {
            return 'dipinjam';
        }

        return 'tidak_tersedia';
    }

    /**
     * Hitung jumlah unit alat yang tersedia pada rentang waktu tertentu,
     * dengan memperhitungkan peminjaman dan maintenance yang overlap.
     */
    public function ketersediaanUntuk(string|Carbon $mulai, string|Carbon $selesai, ?int $excludePeminjamanId = null): int
    {
        $start = $mulai instanceof Carbon ? $mulai : Carbon::parse($mulai);
        $end = $selesai instanceof Carbon ? $selesai : Carbon::parse($selesai);

        if ($start >= $end) {
            return 0;
        }

        $total = (int) ($this->stok_total ?? 0);

        $overlapPinjam = PeminjamanDetail::where('alat_id', $this->id)
            ->whereHas('peminjaman', function ($q) use ($start, $end, $excludePeminjamanId) {
                $q->whereNotIn('status', ['ditolak', 'dibatalkan', 'selesai'])
                    ->when($excludePeminjamanId, fn ($qq, $id) => $qq->where('id', '!=', $id))
                    ->whereDate('tanggal_mulai', '<=', $end->toDateString())
                    ->whereDate('tanggal_selesai', '>=', $start->toDateString());
            })
            ->with('peminjaman:id,tanggal_mulai,jam_mulai,tanggal_selesai,jam_selesai')
            ->get()
            ->sum(function ($detail) use ($start, $end) {
                $p = $detail->peminjaman;
                $pStart = Carbon::parse($p->tanggal_mulai->toDateString() . ' ' . $p->jam_mulai);
                $pEnd = Carbon::parse($p->tanggal_selesai->toDateString() . ' ' . $p->jam_selesai);

                return ($start < $pEnd && $end > $pStart) ? (int) $detail->jumlah : 0;
            });

        $overlapMaintenance = MaintenanceAlat::where('alat_id', $this->id)
            ->whereNotIn('status', ['dibatalkan', 'selesai'])
            ->whereDate('tanggal_mulai', '<=', $end->toDateString())
            ->where(function ($q) use ($start) {
                $q->whereNull('tanggal_selesai')
                    ->orWhereDate('tanggal_selesai', '>=', $start->toDateString());
            })
            ->sum('jumlah');

        return max(0, $total - $overlapPinjam - $overlapMaintenance);
    }

    public function scopeByKategori(Builder $query, $kategoriId): Builder
    {
        return $query->where('kategori_id', $kategoriId);
    }

    public function scopeByLaboratorium(Builder $query, $labId): Builder
    {
        return $query->where('laboratorium_id', $labId);
    }

    public function scopeByStatus(Builder $query, $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeBisaDipinjam(Builder $query, int $jumlah = 1): Builder
    {
        return $query->where('stok_tersedia', '>=', $jumlah);
    }

    public function scopeByKondisi(Builder $query, string $kondisi): Builder
    {
        return $query->where('kondisi', $kondisi);
    }

    public function scopeTersedia(Builder $query): Builder
    {
        return $query->where('status', 'tersedia');
    }
}
