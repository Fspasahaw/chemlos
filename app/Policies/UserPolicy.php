<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('users.view');
    }

    public function viewLimited(User $user): bool
    {
        return $user->hasRole('laboran');
    }

    public function verifyAny(User $user): bool
    {
        return $user->can('users.approve');
    }

    public function view(User $user, User $model): bool
    {
        return $user->can('users.view') || $user->id === $model->id;
    }

    public function create(User $user): bool
    {
        return $user->can('users.create') || $user->hasRole('laboran');
    }

    public function update(User $user, User $model): bool
    {
        if ($user->can('users.edit')) {
            return true;
        }

        if ($user->id === $model->id) {
            return true;
        }

        return $user->hasRole('laboran')
            && $model->created_by === $user->id
            && $model->hasAnyRole(['mahasiswa', 'dosen']);
    }

    public function delete(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return false;
        }

        if ($user->can('users.delete')) {
            return true;
        }

        return $user->hasRole('laboran')
            && $model->created_by === $user->id
            && $model->hasAnyRole(['mahasiswa', 'dosen']);
    }

    public function approve(User $user, User $model): bool
    {
        return $user->can('users.approve') && in_array($model->status, ['pending_email', 'pending_approval']);
    }

    public function reject(User $user, User $model): bool
    {
        return $user->can('users.approve') && in_array($model->status, ['pending_email', 'pending_approval']);
    }

    public function resetPassword(User $user, User $model): bool
    {
        return $user->can('users.edit') || $user->id === $model->id;
    }

    public function setRole(User $user, User $model): bool
    {
        return $user->can('users.edit') && $user->id !== $model->id;
    }
}
