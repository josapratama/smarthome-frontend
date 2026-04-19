import { TelemetryView } from "./components/telemetry-view";

export default function DeviceTelemetryPage({
  params,
}: {
  params: { deviceId: string };
}) {
  const deviceId = parseInt(params.deviceId, 10);
  return <TelemetryView deviceId={deviceId} />;
}
