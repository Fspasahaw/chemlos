<?php

namespace App\Policies;

use App\Models\MaintenanceAlat;
use App\Models\User;

class MaintenanceAlatPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('maintenance-alat.view') || $user->can('maintenance-alat.manage');
    }

    public function view(User $user, MaintenanceAlat $maintenance): bool
    {
        if ($user->hasRole('admin') || $user->hasRole('pimpinan')) {
            return $this->viewAny($user);
        }

        return $this->managesLab($user, $maintenance->laboratorium_id)
            && $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->can('maintenance-alat.manage');
    }

    public function update(User $user, MaintenanceAlat $maintenance): bool
    {
        return $this->managesLab($user, $maintenance->laboratorium_id)
            && $user->can('maintenance-alat.manage');
    }

    public function delete(User $user, MaintenanceAlat $maintenance): bool
    {
        return $user->hasRole('admin')
            || ($this->managesLab($user, $maintenance->laboratorium_id) && $user->can('maintenance-alat.manage'));
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
