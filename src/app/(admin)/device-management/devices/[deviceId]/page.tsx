import { DeviceDetailView } from "./components/device-detail-view";

export default function DeviceDetailPage({
  params,
}: {
  params: { deviceId: string };
}) {
  const deviceId = parseInt(params.deviceId, 10);

  if (isNaN(deviceId)) {
    return (
      <div className="p-6 text-center text-red-600">
        ID perangkat tidak valid
      </div>
    );
  }

  return <DeviceDetailView deviceId={deviceId} />;
}
