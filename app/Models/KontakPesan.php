<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class KontakPesan extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'kontak_pesan';

    protected $fillable = [
        'nama',
        'email',
        'subjek',
        'pesan',
        'status',
    ];

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
            ->setDescriptionForEvent(fn (string $eventName) => "Pesan kontak {$eventName}");
    }

    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeBaru(Builder $query): Builder
    {
        return $query->where('status', 'baru');
    }

    public function scopeDibaca(Builder $query): Builder
    {
        return $query->where('status', 'dibaca');
    }

    public function scopeDijawab(Builder $query): Builder
    {
        return $query->where('status', 'dijawab');
    }
}
