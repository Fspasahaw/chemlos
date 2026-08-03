<?php

namespace App\Policies;

use App\Models\ProgramStudi;
use App\Models\User;

class ProgramStudiPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('program-studi.manage') || $user->can('program-studi.view');
    }

    public function view(User $user, ProgramStudi $programStudi): bool
    {
        return $user->can('program-studi.manage') || $user->can('program-studi.view');
    }

    public function create(User $user): bool
    {
        return $user->can('program-studi.manage');
    }

    public function update(User $user, ProgramStudi $programStudi): bool
    {
        if ($user->can('program-studi.manage')) {
            return true;
        }

        return $user->hasRole('pimpinan')
            && $user->jabatan_pimpinan === 'ketua_program_studi'
            && $user->program_studi_id === $programStudi->id;
    }

    public function delete(User $user, ProgramStudi $programStudi): bool
    {
        return $user->can('program-studi.manage');
    }
}
