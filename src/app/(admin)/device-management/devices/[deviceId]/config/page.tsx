import { DeviceConfigClient } from "./ui";

export default function DeviceConfigPage({
  params,
}: {
  params: { deviceId: string };
}) {
  const deviceId = parseInt(params.deviceId, 10);
  return <DeviceConfigClient deviceId={deviceId} />;
}
