<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class LaboratoriumDokumen extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'laboratorium_dokumen';

    protected $fillable = [
        'laboratorium_id',
        'judul',
        'jenis',
        'file',
    ];

    protected function casts(): array
    {
        return [
            'jenis' => 'string',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn (string $eventName) => "Dokumen laboratorium {$eventName}");
    }

    public function laboratorium(): BelongsTo
    {
        return $this->belongsTo(Laboratorium::class);
    }

    public function scopeByLaboratorium(Builder $query, int|string $id): Builder
    {
        return $query->where('laboratorium_id', $id);
    }

    public function scopeByJenis(Builder $query, string $jenis): Builder
    {
        return $query->where('jenis', $jenis);
    }
}
