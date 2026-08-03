<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class PeminjamanDetail extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'peminjaman_detail';

    protected $fillable = [
        'peminjaman_id',
        'alat_id',
        'jumlah',
        'kondisi_serah_terima',
        'kondisi_pengembalian',
        'catatan_serah_terima',
        'catatan_pengembalian',
        'denda_per_alat',
    ];

    protected function casts(): array
    {
        return [
            'jumlah' => 'integer',
            'kondisi_serah_terima' => 'string',
            'kondisi_pengembalian' => 'string',
            'denda_per_alat' => 'decimal:2',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn (string $eventName) => "Detail peminjaman {$eventName}");
    }

    public function peminjaman(): BelongsTo
    {
        return $this->belongsTo(Peminjaman::class);
    }

    public function alat(): BelongsTo
    {
        return $this->belongsTo(Alat::class);
    }

    public function scopeByPeminjaman(Builder $query, int|string $id): Builder
    {
        return $query->where('peminjaman_id', $id);
    }

    public function scopeByAlat(Builder $query, int|string $id): Builder
    {
        return $query->where('alat_id', $id);
    }
}
