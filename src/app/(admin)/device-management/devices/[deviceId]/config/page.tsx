import { DeviceConfigView } from "./components/device-config-view";

export default function DeviceConfigPage({
  params,
}: {
  params: { deviceId: string };
}) {
  const deviceId = parseInt(params.deviceId, 10);
  return <DeviceConfigView deviceId={deviceId} />;
}
