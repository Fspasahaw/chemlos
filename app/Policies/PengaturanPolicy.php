<?php

namespace App\Policies;

use App\Models\Pengaturan;
use App\Models\User;

class PengaturanPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('pengaturan.view') || $user->can('pengaturan.manage');
    }

    public function view(User $user, Pengaturan $pengaturan): bool
    {
        return $user->can('pengaturan.view') || $user->can('pengaturan.manage');
    }

    public function update(User $user, Pengaturan $pengaturan): bool
    {
        return $user->can('pengaturan.manage');
    }

    public function manage(User $user): bool
    {
        return $user->can('pengaturan.manage');
    }
}
