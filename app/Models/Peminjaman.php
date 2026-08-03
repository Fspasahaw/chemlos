<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Peminjaman extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'peminjaman';

    protected $fillable = [
        'user_id',
        'dosen_pembimbing_id',
        'laboratorium_id',
        'kode',
        'tujuan',
        'tanggal_mulai',
        'jam_mulai',
        'tanggal_selesai',
        'jam_selesai',
        'file_jsa',
        'status',
        'alasan_penolakan',
        'dibatalkan_oleh',
        'catatan',
        'total_denda',
        'denda_dibayar',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_mulai' => 'date',
            'tanggal_selesai' => 'date',
            'status' => 'string',
            'total_denda' => 'decimal:2',
            'denda_dibayar' => 'decimal:2',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogIfAttributesChangedOnly(['updated_at'])
            ->setDescriptionForEvent(fn (string $eventName) => "Peminjaman {$eventName}");
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function dosenPembimbing(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dosen_pembimbing_id');
    }

    public function laboratorium(): BelongsTo
    {
        return $this->belongsTo(Laboratorium::class);
    }

    public function dibatalkanOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibatalkan_oleh');
    }

    public function details(): HasMany
    {
        return $this->hasMany(PeminjamanDetail::class, 'peminjaman_id');
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(PeminjamanStatusLog::class, 'peminjaman_id');
    }

    public function serahTerima(): HasOne
    {
        return $this->hasOne(SerahTerima::class, 'peminjaman_id');
    }

    public function pengembalian(): HasOne
    {
        return $this->hasOne(Pengembalian::class, 'peminjaman_id');
    }

    public function kerusakanAlats(): HasMany
    {
        return $this->hasMany(KerusakanAlat::class, 'peminjaman_id');
    }

    public function scopeByStatus(Builder $query, $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeByUser(Builder $query, $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByLab(Builder $query, $labId): Builder
    {
        return $query->where('laboratorium_id', $labId);
    }

    public function scopeTanggalMulaiBetween(Builder $query, $start, $end): Builder
    {
        return $query->whereBetween('tanggal_mulai', [$start, $end]);
    }

    public function scopeByLaboratorium(Builder $query, int|string $labId): Builder
    {
        return $query->where('laboratorium_id', $labId);
    }

    public function scopeAktif(Builder $query): Builder
    {
        return $query->whereNotIn('status', ['ditolak', 'dibatalkan', 'selesai']);
    }

    public function scopeSelesai(Builder $query): Builder
    {
        return $query->where('status', 'selesai');
    }

    public function scopeTerlambat(Builder $query): Builder
    {
        return $query->where('status', 'terlambat');
    }

    public function statusLabel(): string
    {
        return match ($this->status) {
            'diajukan' => 'Diajukan',
            'menunggu_dosen' => 'Menunggu Persetujuan Dosen',
            'menunggu_laboran' => 'Menunggu Persetujuan Laboran',
            'disetujui' => 'Disetujui',
            'berlangsung' => 'Berlangsung',
            'selesai' => 'Selesai',
            'terlambat' => 'Terlambat',
            'ditolak' => 'Ditolak',
            'dibatalkan' => 'Dibatalkan',
            default => $this->status,
        };
    }
}
