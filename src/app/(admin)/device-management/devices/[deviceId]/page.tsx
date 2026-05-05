import { DeviceDetailView } from "./components/device-detail-view";

export default function DeviceDetailPage({
  params,
}: {
  params: { deviceId: string };
}) {
  // Pass raw string — DeviceDetailView handles invalid ID with t()
  return <DeviceDetailView deviceId={parseInt(params.deviceId, 10)} />;
}
