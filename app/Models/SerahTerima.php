<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class SerahTerima extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'serah_terima';

    protected $fillable = [
        'peminjaman_id',
        'laboran_id',
        'waktu_serah_terima',
        'foto_bukti',
        'kondisi_alat',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'waktu_serah_terima' => 'datetime',
            'kondisi_alat' => 'array',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->setDescriptionForEvent(fn (string $eventName) => "Serah terima {$eventName}");
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
        return $query->whereBetween('waktu_serah_terima', [$mulai, $selesai]);
    }
}
