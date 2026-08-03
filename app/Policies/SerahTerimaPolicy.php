<?php

namespace App\Policies;

use App\Models\SerahTerima;
use App\Models\User;

class SerahTerimaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('serah-terima.manage') || $user->hasRole('admin');
    }

    public function view(User $user, SerahTerima $serahTerima): bool
    {
        return $this->managesLab($user, $serahTerima->peminjaman?->laboratorium_id)
            || $serahTerima->peminjaman?->user_id === $user->id
            || $user->hasRole('admin');
    }

    public function create(User $user): bool
    {
        return $user->can('serah-terima.manage');
    }

    public function update(User $user, SerahTerima $serahTerima): bool
    {
        return $this->managesLab($user, $serahTerima->peminjaman?->laboratorium_id)
            && $user->can('serah-terima.manage');
    }

    public function delete(User $user, SerahTerima $serahTerima): bool
    {
        return $user->hasRole('admin');
    }

    protected function managesLab(User $user, ?int $laboratoriumId): bool
    {
        if (! $laboratoriumId) {
            return false;
        }

        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->laboratoriumPengelolas()
            ->where('laboratorium_id', $laboratoriumId)
            ->exists();
    }
}
