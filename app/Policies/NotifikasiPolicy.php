<?php

namespace App\Policies;

use App\Models\Notifikasi;
use App\Models\User;

class NotifikasiPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Notifikasi $notifikasi): bool
    {
        return $notifikasi->user_id === $user->id || $user->hasRole('admin');
    }

    public function update(User $user, Notifikasi $notifikasi): bool
    {
        return $this->view($user, $notifikasi);
    }

    public function delete(User $user, Notifikasi $notifikasi): bool
    {
        return $this->view($user, $notifikasi);
    }
}
