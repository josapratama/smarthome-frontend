import { Suspense } from "react";
import { ChannelsUI } from "./ui";

export default function ChannelsPage({
  params,
}: {
  params: { deviceId: string };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChannelsUI deviceId={parseInt(params.deviceId)} />
    </Suspense>
  );
}
