<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Laboratorium extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $table = 'laboratorium';

    protected $fillable = [
        'nama',
        'kode',
        'slug',
        'deskripsi',
        'lokasi',
        'gedung',
        'lantai',
        'ruangan',
        'kapasitas',
        'jam_buka',
        'jam_tutup',
        'hari_operasional',
        'email',
        'telepon',
        'status',
        'foto_utama',
    ];

    protected function casts(): array
    {
        return [
            'kapasitas' => 'integer',
            'hari_operasional' => 'array',
            'status' => 'string',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->setDescriptionForEvent(fn (string $eventName) => "Laboratorium {$eventName}");
    }

    public function laboratoriumPengelolas(): HasMany
    {
        return $this->hasMany(LaboratoriumPengelola::class, 'laboratorium_id');
    }

    public function pengelola(): HasMany
    {
        return $this->laboratoriumPengelolas();
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'laboratorium_pengelola', 'laboratorium_id', 'user_id')
            ->withPivot(['peran', 'is_primary'])
            ->withTimestamps();
    }

    public function laboratoriumGaleris(): HasMany
    {
        return $this->hasMany(LaboratoriumGaleri::class, 'laboratorium_id');
    }

    public function galeri(): HasMany
    {
        return $this->laboratoriumGaleris();
    }

    public function laboratoriumDokumens(): HasMany
    {
        return $this->hasMany(LaboratoriumDokumen::class, 'laboratorium_id');
    }

    public function laboratoriumTataTertibs(): HasMany
    {
        return $this->hasMany(LaboratoriumTataTertib::class, 'laboratorium_id');
    }

    public function dokumen(): HasMany
    {
        return $this->laboratoriumDokumens();
    }

    public function alats(): HasMany
    {
        return $this->hasMany(Alat::class, 'laboratorium_id');
    }

    public function peminjamans(): HasMany
    {
        return $this->hasMany(Peminjaman::class, 'laboratorium_id');
    }

    public function maintenanceAlats(): HasMany
    {
        return $this->hasMany(MaintenanceAlat::class, 'laboratorium_id');
    }

    public function scopeAktif(Builder $query): Builder
    {
        return $query->where('status', 'aktif');
    }

    public function scopeByLokasi(Builder $query, string $lokasi): Builder
    {
        return $query->where('lokasi', $lokasi);
    }

    public function scopeManagedBy(Builder $query, int|string $userId): Builder
    {
        return $query->whereHas('laboratoriumPengelolas', function (Builder $q) use ($userId) {
            $q->where('user_id', $userId);
        });
    }
}
