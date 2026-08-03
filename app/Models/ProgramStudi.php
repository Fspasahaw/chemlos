<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class ProgramStudi extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $table = 'program_studi';

    protected $fillable = [
        'nama',
        'jenjang',
        'kode',
        'status',
        'deskripsi',
    ];

    protected function casts(): array
    {
        return [
            'jenjang' => 'string',
            'status' => 'string',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->setDescriptionForEvent(fn (string $eventName) => "Program studi {$eventName}");
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'program_studi_id');
    }

    public function scopeAktif(Builder $query): Builder
    {
        return $query->where('status', 'aktif');
    }

    public function scopeByJenjang(Builder $query, string $jenjang): Builder
    {
        return $query->where('jenjang', $jenjang);
    }
}
