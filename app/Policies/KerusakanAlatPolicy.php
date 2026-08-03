<?php

namespace App\Policies;

use App\Models\KerusakanAlat;
use App\Models\User;

class KerusakanAlatPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('kerusakan-alat.view') || $user->can('kerusakan-alat.manage');
    }

    public function view(User $user, KerusakanAlat $kerusakan): bool
    {
        if ($user->hasRole('admin') || $user->hasRole('pimpinan')) {
            return $this->viewAny($user);
        }

        if ($kerusakan->pelapor_id === $user->id) {
            return $user->can('kerusakan-alat.view');
        }

        if ($user->hasRole('dosen') && $kerusakan->peminjaman?->dosen_pembimbing_id === $user->id) {
            return $user->can('kerusakan-alat.view');
        }

        if ($user->hasRole('mahasiswa') && $kerusakan->peminjaman?->user_id === $user->id) {
            return $user->can('kerusakan-alat.view');
        }

        return $this->managesLab($user, $kerusakan->alat?->laboratorium_id)
            && $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->can('kerusakan-alat.manage');
    }

    public function update(User $user, KerusakanAlat $kerusakan): bool
    {
        return $this->managesLab($user, $kerusakan->alat?->laboratorium_id)
            && $user->can('kerusakan-alat.manage');
    }

    public function delete(User $user, KerusakanAlat $kerusakan): bool
    {
        return $user->hasRole('admin')
            || ($this->managesLab($user, $kerusakan->alat?->laboratorium_id) && $user->can('kerusakan-alat.manage'));
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
