<?php

namespace App\Policies;

use App\Models\Peminjaman;
use App\Models\User;

class PeminjamanPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('peminjaman.view');
    }

    public function view(User $user, Peminjaman $peminjaman): bool
    {
        if ($user->hasRole('admin') || $user->hasRole('pimpinan')) {
            return $user->can('peminjaman.view');
        }

        if ($peminjaman->user_id === $user->id || $peminjaman->dosen_pembimbing_id === $user->id) {
            return $user->can('peminjaman.view');
        }

        return $this->managesLab($user, $peminjaman->laboratorium_id)
            && $user->can('peminjaman.view');
    }

    public function create(User $user): bool
    {
        return $user->can('peminjaman.create');
    }

    public function update(User $user, Peminjaman $peminjaman): bool
    {
        if ($peminjaman->user_id === $user->id) {
            return $user->can('peminjaman.create');
        }

        return $this->managesLab($user, $peminjaman->laboratorium_id)
            && $user->can('peminjaman.approve');
    }

    public function approve(User $user, Peminjaman $peminjaman): bool
    {
        if ($peminjaman->dosen_pembimbing_id === $user->id) {
            return $user->can('peminjaman.approve');
        }

        return $this->managesLab($user, $peminjaman->laboratorium_id)
            && ($user->can('peminjaman.approve') || $user->can('peminjaman.process'));
    }

    public function reject(User $user, Peminjaman $peminjaman): bool
    {
        return $this->approve($user, $peminjaman);
    }

    public function process(User $user, Peminjaman $peminjaman): bool
    {
        return $this->managesLab($user, $peminjaman->laboratorium_id)
            && $user->can('peminjaman.process');
    }

    public function serahTerima(User $user, Peminjaman $peminjaman): bool
    {
        return $this->managesLab($user, $peminjaman->laboratorium_id)
            && $user->can('serah-terima.manage');
    }

    public function pengembalian(User $user, Peminjaman $peminjaman): bool
    {
        return $this->managesLab($user, $peminjaman->laboratorium_id)
            && $user->can('pengembalian.manage');
    }

    protected function managesLab(User $user, int $laboratoriumId): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->laboratoriumPengelolas()
            ->where('laboratorium_id', $laboratoriumId)
            ->exists();
    }
}
