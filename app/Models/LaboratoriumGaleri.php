<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class LaboratoriumGaleri extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'laboratorium_galeri';

    protected $fillable = [
        'laboratorium_id',
        'file',
        'judul',
        'urutan',
    ];

    protected function casts(): array
    {
        return [
            'urutan' => 'integer',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn (string $eventName) => "Galeri laboratorium {$eventName}");
    }

    public function laboratorium(): BelongsTo
    {
        return $this->belongsTo(Laboratorium::class);
    }

    public function scopeByLaboratorium(Builder $query, int|string $id): Builder
    {
        return $query->where('laboratorium_id', $id);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('urutan', 'asc');
    }
}
