<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Pengaturan extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'pengaturan';

    protected $fillable = [
        'grup',
        'key',
        'tipe',
        'value',
    ];

    protected function casts(): array
    {
        return [
            'tipe' => 'string',
            'value' => 'string',
        ];
    }

    public function getCastedValueAttribute(): mixed
    {
        return match ($this->tipe) {
            'json' => json_decode($this->value ?? '{}', true),
            'boolean' => filter_var($this->value, FILTER_VALIDATE_BOOLEAN),
            'number' => is_numeric($this->value) ? (str_contains($this->value, '.') ? (float) $this->value : (int) $this->value) : 0,
            'file', 'string' => $this->value,
            default => $this->value,
        };
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->setDescriptionForEvent(fn (string $eventName) => "Pengaturan {$eventName}");
    }

    public function scopeGrup(Builder $query, string $grup): Builder
    {
        return $query->where('grup', $grup);
    }

    public function scopeKey(Builder $query, string $key): Builder
    {
        return $query->where('key', $key);
    }

    public static function getValue(string $grup, string $key, $default = null): ?string
    {
        return static::where('grup', $grup)->where('key', $key)->value('value') ?? $default;
    }

    public static function get(string $dotKey, $default = null): ?string
    {
        [$grup, $key] = array_pad(explode('.', $dotKey, 2), 2, '');
        if (! $key) {
            return $default;
        }

        return static::where('grup', $grup)->where('key', $key)->value('value') ?? $default;
    }

    public static function getBool(string $dotKey, $default = false): bool
    {
        $value = static::get($dotKey);

        if ($value === null) {
            return (bool) $default;
        }

        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    public static function setValue(string $grup, string $key, $value, ?string $tipe = null): self
    {
        if ($tipe === null) {
            $tipe = self::inferTipe($key, $value);
        }

        return static::updateOrCreate(
            ['grup' => $grup, 'key' => $key],
            [
                'tipe' => $tipe,
                'value' => is_array($value) || is_object($value) ? json_encode($value) : (string) $value,
            ]
        );
    }

    protected static function inferTipe(string $key, mixed $value): string
    {
        if (is_bool($value) || (is_string($value) && in_array(strtolower($value), ['true', 'false'], true))) {
            return 'boolean';
        }

        $boolKeys = ['_enabled', '_wajib', 'blokir_', 'wajib_', 'reminder_', 'notifikasi_'];
        if (is_string($value) && in_array($value, ['0', '1'], true)) {
            foreach ($boolKeys as $suffix) {
                if (str_contains($key, $suffix)) {
                    return 'boolean';
                }
            }
        }

        if (is_array($value) || is_object($value)) {
            return 'json';
        }

        if (is_string($value) && is_numeric($value) && ! str_starts_with($value, '0')) {
            return 'number';
        }

        if (str_ends_with($key, '_logo') || str_ends_with($key, '_favicon') || str_ends_with($key, '_file')) {
            return 'file';
        }

        return 'string';
    }

    public function scopeByTipe(Builder $query, string $tipe): Builder
    {
        return $query->where('tipe', $tipe);
    }
}
