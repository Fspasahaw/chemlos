<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class AlatDokumen extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'alat_dokumen';

    protected $fillable = [
        'alat_id',
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
            ->setDescriptionForEvent(fn (string $eventName) => "Dokumen alat {$eventName}");
    }

    public function alat(): BelongsTo
    {
        return $this->belongsTo(Alat::class);
    }

    public function scopeByAlat(Builder $query, int|string $id): Builder
    {
        return $query->where('alat_id', $id);
    }

    public function scopeByJenis(Builder $query, string $jenis): Builder
    {
        return $query->where('jenis', $jenis);
    }
}
