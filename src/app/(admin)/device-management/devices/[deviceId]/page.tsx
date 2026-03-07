import { DeviceDetailClient } from "./ui";

export default function DeviceDetailPage({
  params,
}: {
  params: { deviceId: string };
}) {
  const deviceId = parseInt(params.deviceId, 10);

  if (isNaN(deviceId)) {
    return <div>Invalid device ID</div>;
  }

  return <DeviceDetailClient deviceId={deviceId} />;
}
