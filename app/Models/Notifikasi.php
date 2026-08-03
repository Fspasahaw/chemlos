<?php

namespace App\Models;

use App\Services\NotifikasiService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Notifikasi extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'notifikasi';

    protected $fillable = [
        'user_id',
        'judul',
        'pesan',
        'jenis',
        'kategori',
        'link',
        'dibaca_pada',
    ];

    protected function casts(): array
    {
        return [
            'jenis' => 'string',
            'kategori' => 'string',
            'dibaca_pada' => 'datetime',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogIfAttributesChangedOnly(['dibaca_pada', 'updated_at'])
            ->setDescriptionForEvent(fn (string $eventName) => "Notifikasi {$eventName}");
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeByUser(Builder $query, $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeUnread(Builder $query): Builder
    {
        return $query->whereNull('dibaca_pada');
    }

    public function scopeByJenis(Builder $query, string $jenis): Builder
    {
        return $query->where('jenis', $jenis);
    }

    public function scopeByKategori(Builder $query, string $kategori): Builder
    {
        return $query->where('kategori', $kategori);
    }

    public function markAsRead(): bool
    {
        if ($this->dibaca_pada !== null) {
            return true;
        }

        return $this->update(['dibaca_pada' => now()]);
    }

    protected static function booted(): void
    {
        static::saving(function (self $notifikasi) {
            if ($notifikasi->kategori && ! $notifikasi->jenis) {
                $notifikasi->jenis = NotifikasiService::mapKategoriToJenis($notifikasi->kategori);
            }
        });
    }
}
