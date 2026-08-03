<?php

namespace App\Policies;

use App\Models\Laboratorium;
use App\Models\User;

class LaboratoriumPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('laboratorium.view') || $user->can('laboratorium.manage');
    }

    public function view(User $user, Laboratorium $laboratorium): bool
    {
        return $this->hasLabAccess($user, $laboratorium, 'laboratorium.view')
            || $this->hasLabAccess($user, $laboratorium, 'laboratorium.manage');
    }

    public function create(User $user): bool
    {
        return $user->can('laboratorium.manage') && $user->hasRole('admin');
    }

    public function update(User $user, Laboratorium $laboratorium): bool
    {
        return $this->hasLabAccess($user, $laboratorium, 'laboratorium.manage');
    }

    public function delete(User $user, Laboratorium $laboratorium): bool
    {
        return $user->can('laboratorium.manage') && $user->hasRole('admin');
    }

    public function managePengelola(User $user, Laboratorium $laboratorium): bool
    {
        return $this->hasLabAccess($user, $laboratorium, 'laboratorium.manage');
    }

    protected function hasLabAccess(User $user, Laboratorium $laboratorium, string $permission): bool
    {
        if ($user->can($permission) && ($user->hasRole('admin') || $user->hasRole('pimpinan'))) {
            return true;
        }

        if ($user->can($permission)) {
            return $user->laboratoriumPengelolas()
                ->where('laboratorium_id', $laboratorium->id)
                ->exists();
        }

        return false;
    }
}
