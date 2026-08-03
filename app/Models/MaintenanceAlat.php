<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class MaintenanceAlat extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'maintenance_alat';

    protected $fillable = [
        'alat_id',
        'laboratorium_id',
        'laboran_id',
        'kerusakan_id',
        'jumlah',
        'keterangan',
        'tanggal_mulai',
        'tanggal_selesai',
        'status',
        'biaya',
        'teknisi',
    ];

    protected function casts(): array
    {
        return [
            'jumlah' => 'integer',
            'tanggal_mulai' => 'date',
            'tanggal_selesai' => 'date',
            'status' => 'string',
            'biaya' => 'decimal:2',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn (string $eventName) => "Maintenance alat {$eventName}");
    }

    public function alat(): BelongsTo
    {
        return $this->belongsTo(Alat::class);
    }

    public function laboratorium(): BelongsTo
    {
        return $this->belongsTo(Laboratorium::class);
    }

    public function laboran(): BelongsTo
    {
        return $this->belongsTo(User::class, 'laboran_id');
    }

    public function kerusakan(): BelongsTo
    {
        return $this->belongsTo(KerusakanAlat::class, 'kerusakan_id');
    }

    public function kerusakanAlats(): HasMany
    {
        return $this->hasMany(KerusakanAlat::class, 'maintenance_id');
    }

    public function scopeByAlat(Builder $query, int|string $id): Builder
    {
        return $query->where('alat_id', $id);
    }

    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeByLaboratorium(Builder $query, int|string $id): Builder
    {
        return $query->where('laboratorium_id', $id);
    }

    public function scopeBerlangsung(Builder $query): Builder
    {
        return $query->whereNotIn('status', ['dibatalkan', 'selesai'])
            ->where(function (Builder $q) {
                $q->whereNull('tanggal_selesai')
                    ->orWhereDate('tanggal_selesai', '>=', now()->toDateString());
            });
    }
}
