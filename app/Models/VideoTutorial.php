<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class VideoTutorial extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $table = 'video_tutorial';

    protected $fillable = [
        'judul',
        'slug',
        'deskripsi',
        'jenis',
        'sumber',
        'url',
        'file',
        'thumbnail',
        'durasi',
        'alat_id',
        'urutan',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'durasi' => 'integer',
            'jenis' => 'string',
            'sumber' => 'string',
            'status' => 'string',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn (string $eventName) => "Video tutorial {$eventName}");
    }

    public function alat(): BelongsTo
    {
        return $this->belongsTo(Alat::class);
    }

    public function scopeByJenis(Builder $query, string $jenis): Builder
    {
        return $query->where('jenis', $jenis);
    }

    public function scopeAktif(Builder $query): Builder
    {
        return $query->where('status', 'aktif');
    }

    public function scopeByAlat(Builder $query, int|string $id): Builder
    {
        return $query->where('alat_id', $id);
    }
}
