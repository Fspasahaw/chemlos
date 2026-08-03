<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class KerusakanAlat extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'kerusakan_alat';

    protected $fillable = [
        'alat_id',
        'peminjaman_id',
        'pelapor_id',
        'jumlah',
        'kondisi',
        'tanggal_dilaporkan',
        'status',
        'keterangan',
        'foto',
        'maintenance_id',
        'stok_sudah_dialihkan',
    ];

    protected function casts(): array
    {
        return [
            'jumlah' => 'integer',
            'kondisi' => 'string',
            'tanggal_dilaporkan' => 'date',
            'status' => 'string',
            'stok_sudah_dialihkan' => 'boolean',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn (string $eventName) => "Kerusakan alat {$eventName}");
    }

    public function alat(): BelongsTo
    {
        return $this->belongsTo(Alat::class);
    }

    public function peminjaman(): BelongsTo
    {
        return $this->belongsTo(Peminjaman::class);
    }

    public function pelapor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pelapor_id');
    }

    public function maintenance(): BelongsTo
    {
        return $this->belongsTo(MaintenanceAlat::class, 'maintenance_id');
    }

    public function scopeByAlat(Builder $query, int|string $id): Builder
    {
        return $query->where('alat_id', $id);
    }

    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeByKondisi(Builder $query, string $kondisi): Builder
    {
        return $query->where('kondisi', $kondisi);
    }

    public function scopeByPeminjaman(Builder $query, int|string $id): Builder
    {
        return $query->where('peminjaman_id', $id);
    }
}
