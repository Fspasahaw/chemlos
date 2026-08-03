<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class KategoriAlat extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $table = 'kategori_alat';

    protected $fillable = [
        'nama',
        'kode',
        'slug',
        'deskripsi',
        'status',
    ];

    public function alats(): HasMany
    {
        return $this->hasMany(Alat::class, 'kategori_id');
    }

    protected function casts(): array
    {
        return [
            'status' => 'string',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->setDescriptionForEvent(fn (string $eventName) => "Kategori alat {$eventName}");
    }

    public function scopeAktif(Builder $query): Builder
    {
        return $query->where('status', 'aktif');
    }
}
