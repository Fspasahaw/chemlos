<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class PeminjamanStatusLog extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'peminjaman_status_log';

    const UPDATED_AT = null;

    protected $fillable = [
        'peminjaman_id',
        'status_dari',
        'status_ke',
        'keterangan',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'status_dari' => 'string',
            'status_ke' => 'string',
        ];
    }

    public function peminjaman(): BelongsTo
    {
        return $this->belongsTo(Peminjaman::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->setDescriptionForEvent(fn (string $eventName) => "Status peminjaman {$eventName}");
    }

    public function tapActivity(Activity $activity, string $eventName)
    {
        $activity->causer_id = $this->user_id;
        $activity->causer_type = User::class;
    }

    public function scopeByPeminjaman(Builder $query, int|string $id): Builder
    {
        return $query->where('peminjaman_id', $id);
    }

    public function scopeByUser(Builder $query, int|string $id): Builder
    {
        return $query->where('user_id', $id);
    }
}
