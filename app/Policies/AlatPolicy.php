<?php

namespace App\Policies;

use App\Models\Alat;
use App\Models\User;

class AlatPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('alat.view') || $user->can('alat.manage');
    }

    public function view(User $user, Alat $alat): bool
    {
        return $this->hasLabAccess($user, $alat->laboratorium_id, 'alat.view')
            || $this->hasLabAccess($user, $alat->laboratorium_id, 'alat.manage');
    }

    public function create(User $user): bool
    {
        return $user->can('alat.manage');
    }

    public function update(User $user, Alat $alat): bool
    {
        return $this->hasLabAccess($user, $alat->laboratorium_id, 'alat.manage');
    }

    public function delete(User $user, Alat $alat): bool
    {
        return $this->hasLabAccess($user, $alat->laboratorium_id, 'alat.manage');
    }

    public function manageGaleri(User $user, Alat $alat): bool
    {
        return $this->hasLabAccess($user, $alat->laboratorium_id, 'alat.manage');
    }

    public function manageDokumen(User $user, Alat $alat): bool
    {
        return $this->hasLabAccess($user, $alat->laboratorium_id, 'alat.manage');
    }

    public function manageVideo(User $user, Alat $alat): bool
    {
        return $this->hasLabAccess($user, $alat->laboratorium_id, 'alat.manage');
    }

    protected function hasLabAccess(User $user, int $laboratoriumId, string $permission): bool
    {
        if ($user->can($permission) && ($user->hasRole('admin') || $user->hasRole('pimpinan'))) {
            return true;
        }

        if ($user->can($permission)) {
            return $user->laboratoriumPengelolas()
                ->where('laboratorium_id', $laboratoriumId)
                ->exists();
        }

        return false;
    }
}
