<?php

namespace App\Models;

use App\Mail\VerifikasiEmail;
use App\Models\Pengaturan;
use Illuminate\Auth\MustVerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail as MustVerifyEmailContract;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmailContract
{
    use HasApiTokens, HasFactory, HasRoles, LogsActivity, MustVerifyEmail, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'nama_lengkap',
        'email',
        'password',
        'npm_nip',
        'no_hp',
        'avatar',
        'program_studi_id',
        'jabatan_pimpinan',
        'status',
        'email_verified_at',
        'approved_by',
        'approved_at',
        'rejected_by',
        'created_by',
        'rejection_reason',
        'tanggal_lahir',
        'jenis_kelamin',
        'alamat',
        'angkatan',
        'semester',
        'foto_ktm',
        'tema_preferensi',
        'bahasa_preferensi',
        'reduce_motion',
        'notifikasi_email',
        'notifikasi_whatsapp',
        'notifikasi_in_app',
        'last_login_at',
        'last_login_ip',
        'legal_consent_at',
        'legal_consent_ip',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = ['status_label'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'approved_at' => 'datetime',
            'tanggal_lahir' => 'date',
            'angkatan' => 'integer',
            'semester' => 'integer',
            'reduce_motion' => 'boolean',
            'last_login_at' => 'datetime',
            'legal_consent_at' => 'datetime',
            'jabatan_pimpinan' => 'string',
            'status' => 'string',
            'jenis_kelamin' => 'string',
            'tema_preferensi' => 'string',
            'bahasa_preferensi' => 'string',
            'notifikasi_email' => 'boolean',
            'notifikasi_whatsapp' => 'boolean',
            'notifikasi_in_app' => 'boolean',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogIfAttributesChangedOnly(['last_login_at', 'last_login_ip', 'updated_at'])
            ->setDescriptionForEvent(fn (string $eventName) => "Pengguna {$eventName}");
    }

    public function sendEmailVerificationNotification(): void
    {
        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $this->id,
                'hash' => sha1($this->getEmailForVerification()),
            ]
        );

        $template = Pengaturan::get('notifikasi.template_email_verifikasi');
        $customBody = null;
        if ($template) {
            $replacements = [
                '{{nama}}' => $this->nama_lengkap,
                '{{nama_lengkap}}' => $this->nama_lengkap,
                '{{email}}' => $this->email,
                '{{link}}' => $url,
                '{{link_detail}}' => $url,
            ];
            $customBody = str_replace(array_keys($replacements), array_values($replacements), $template);
        }

        Mail::to($this->email)->queue(new VerifikasiEmail($this, $url, $customBody));
    }

    public function programStudi(): BelongsTo
    {
        return $this->belongsTo(ProgramStudi::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function peminjamans(): HasMany
    {
        return $this->hasMany(Peminjaman::class, 'user_id');
    }

    public function peminjamanDetails(): HasManyThrough
    {
        return $this->hasManyThrough(PeminjamanDetail::class, Peminjaman::class, 'user_id', 'peminjaman_id');
    }

    public function laboratoriumPengelolas(): HasMany
    {
        return $this->hasMany(LaboratoriumPengelola::class, 'user_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notifikasi::class, 'user_id');
    }

    public function laboratoriums(): BelongsToMany
    {
        return $this->belongsToMany(Laboratorium::class, 'laboratorium_pengelola', 'user_id', 'laboratorium_id')
            ->withPivot(['peran', 'is_primary'])
            ->withTimestamps();
    }

    public function peminjamanSebagaiDosenPembimbing(): HasMany
    {
        return $this->hasMany(Peminjaman::class, 'dosen_pembimbing_id');
    }

    public function getHighestPriorityRole(): ?string
    {
        $priority = ['admin', 'pimpinan', 'kepala_lab', 'laboran', 'dosen', 'mahasiswa'];

        foreach ($priority as $role) {
            if ($this->hasRole($role)) {
                return $role;
            }
        }

        return $this->roles->first()?->name;
    }

    public function getActiveRole(): ?string
    {
        $active = session('active_role');

        if ($active && $this->hasRole($active)) {
            return $active;
        }

        return $this->getHighestPriorityRole();
    }

    public function setActiveRole(string $role): void
    {
        if ($this->hasRole($role)) {
            session(['active_role' => $role]);
        }
    }

    public function getDashboardRoute(?string $role = null): string
    {
        $role ??= $this->getActiveRole();

        return match ($role) {
            'admin' => '/dashboard/admin',
            'pimpinan' => '/dashboard/pimpinan',
            'kepala_lab' => '/dashboard/kepala-lab',
            'laboran' => '/dashboard/laboran',
            'dosen' => '/dashboard/dosen',
            'mahasiswa' => '/dashboard/mahasiswa',
            default => '/dashboard',
        };
    }

    public function isProfileComplete(): bool
    {
        if (! $this->hasRole('mahasiswa')) {
            return true;
        }

        return filled($this->no_hp)
            && filled($this->tanggal_lahir)
            && filled($this->jenis_kelamin)
            && filled($this->alamat)
            && filled($this->angkatan)
            && filled($this->semester)
            && filled($this->foto_ktm);
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'pending_email' => 'Belum Verifikasi Email',
            'pending_approval' => 'Menunggu Persetujuan',
            'approved' => 'Aktif',
            'rejected' => 'Ditolak',
            'suspended' => 'Dinonaktifkan',
            default => $this->status ?? '-',
        };
    }

    public function scopeByRole(Builder $query, string $role): Builder
    {
        return $query->whereHas('roles', function (Builder $q) use ($role) {
            $q->where('name', $role);
        });
    }

    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', 'approved');
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->whereIn('status', ['pending_email', 'pending_approval']);
    }

    public function scopeByProgramStudi(Builder $query, int|string $id): Builder
    {
        return $query->where('program_studi_id', $id);
    }
}
