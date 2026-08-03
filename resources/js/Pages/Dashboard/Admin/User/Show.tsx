import UserShow from '@/Components/UserShow';

export default function Show() {
    return <UserShow base="/dashboard/admin/users" canReset canSuspend />;
}
