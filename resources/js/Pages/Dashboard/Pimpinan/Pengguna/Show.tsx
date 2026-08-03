import UserShow from '@/Components/UserShow';

export default function Show() {
    return <UserShow base="/dashboard/pimpinan/pengguna" canEdit={false} canReset={false} canSuspend={false} />;
}
