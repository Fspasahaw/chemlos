<?php

namespace App\Policies;

use App\Models\Pengembalian;
use App\Models\User;

class PengembalianPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('pengembalian.manage') || $user->hasRole('admin');
    }

    public function view(User $user, Pengembalian $pengembalian): bool
    {
        return $this->managesLab($user, $pengembalian->peminjaman?->laboratorium_id)
            || $pengembalian->peminjaman?->user_id === $user->id
            || $user->hasRole('admin');
    }

    public function create(User $user): bool
    {
        return $user->can('pengembalian.manage');
    }

    public function update(User $user, Pengembalian $pengembalian): bool
    {
        return $this->managesLab($user, $pengembalian->peminjaman?->laboratorium_id)
            && $user->can('pengembalian.manage');
    }

    public function delete(User $user, Pengembalian $pengembalian): bool
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
