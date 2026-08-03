import KerusakanManager from '../../../../Components/Dashboard/KerusakanManager';

export default function Index() {
    return <KerusakanManager base="/dashboard/kepala-lab" canCreate={false} canEdit={false} canDelete={false} />;
}
