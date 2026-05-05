import { ChannelsView } from "./components/channels-view";

export default function ChannelsPage({
  params,
}: {
  params: { deviceId: string };
}) {
  const deviceId = parseInt(params.deviceId, 10);
  return <ChannelsView deviceId={deviceId} />;
}
