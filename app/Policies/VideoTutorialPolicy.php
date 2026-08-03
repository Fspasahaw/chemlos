<?php

namespace App\Policies;

use App\Models\User;
use App\Models\VideoTutorial;

class VideoTutorialPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, VideoTutorial $videoTutorial): bool
    {
        return $videoTutorial->status === 'publik' || $this->manage($user);
    }

    public function create(User $user): bool
    {
        return $this->manage($user);
    }

    public function update(User $user, VideoTutorial $videoTutorial): bool
    {
        return $this->manage($user);
    }

    public function delete(User $user, VideoTutorial $videoTutorial): bool
    {
        return $this->manage($user);
    }

    protected function manage(User $user): bool
    {
        return $user->hasRole('admin') || $user->can('alat.manage');
    }
}
