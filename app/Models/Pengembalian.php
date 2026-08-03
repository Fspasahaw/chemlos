<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Pengembalian extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'pengembalian';

    protected $fillable = [
        'peminjaman_id',
        'laboran_id',
        'waktu_pengembalian',
        'foto_kondisi',
        'keterlambatan_menit',
        'total_denda',
        'denda_dibayar',
        'kondisi_alat',
        'denda_keterlambatan',
        'denda_kerusakan',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'waktu_pengembalian' => 'datetime',
            'keterlambatan_menit' => 'integer',
            'total_denda' => 'decimal:2',
            'denda_dibayar' => 'decimal:2',
            'kondisi_alat' => 'array',
            'denda_keterlambatan' => 'decimal:2',
            'denda_kerusakan' => 'decimal:2',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->setDescriptionForEvent(fn (string $eventName) => "Pengembalian {$eventName}");
    }

    public function peminjaman(): BelongsTo
    {
        return $this->belongsTo(Peminjaman::class);
    }

    public function laboran(): BelongsTo
    {
        return $this->belongsTo(User::class, 'laboran_id');
    }

    public function scopeByPeminjaman(Builder $query, int|string $id): Builder
    {
        return $query->where('peminjaman_id', $id);
    }

    public function scopeByLaboratorium(Builder $query, int|string $labId): Builder
    {
        return $query->whereHas('peminjaman', function (Builder $q) use ($labId) {
            $q->where('laboratorium_id', $labId);
        });
    }

    public function scopeByTanggal(Builder $query, string $mulai, string $selesai): Builder
    {
        return $query->whereBetween('waktu_pengembalian', [$mulai, $selesai]);
    }

    public function scopeTerlambat(Builder $query): Builder
    {
        return $query->where('keterlambatan_menit', '>', 0);
    }
}
