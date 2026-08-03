<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class LaboratoriumPengelola extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'laboratorium_pengelola';

    protected $fillable = [
        'laboratorium_id',
        'user_id',
        'peran',
        'is_primary',
    ];

    protected function casts(): array
    {
        return [
            'peran' => 'string',
            'is_primary' => 'boolean',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn (string $eventName) => "Pengelola laboratorium {$eventName}");
    }

    public function laboratorium(): BelongsTo
    {
        return $this->belongsTo(Laboratorium::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeByLaboratorium(Builder $query, int|string $id): Builder
    {
        return $query->where('laboratorium_id', $id);
    }

    public function scopeByUser(Builder $query, int|string $id): Builder
    {
        return $query->where('user_id', $id);
    }

    public function scopeByPeran(Builder $query, string $peran): Builder
    {
        return $query->where('peran', $peran);
    }

    public function scopePrimary(Builder $query): Builder
    {
        return $query->where('is_primary', true);
    }
}
