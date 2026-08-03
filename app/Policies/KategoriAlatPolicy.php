<?php

namespace App\Policies;

use App\Models\KategoriAlat;
use App\Models\User;

class KategoriAlatPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('kategori-alat.manage') || $user->can('alat.view');
    }

    public function view(User $user, KategoriAlat $kategoriAlat): bool
    {
        return $user->can('kategori-alat.manage');
    }

    public function create(User $user): bool
    {
        return $user->can('kategori-alat.manage');
    }

    public function update(User $user, KategoriAlat $kategoriAlat): bool
    {
        return $user->can('kategori-alat.manage');
    }

    public function delete(User $user, KategoriAlat $kategoriAlat): bool
    {
        return $user->can('kategori-alat.manage');
    }
}
