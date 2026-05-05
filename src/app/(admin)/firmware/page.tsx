import { PageHeader } from "@/components/ui/page-header";
import { FirmwareTabs } from "./components/firmware-tabs";

export default function FirmwareManagementPage({
  searchParams,
}: {
  searchParams: { deviceId?: string };
}) {
  const initialDeviceId = searchParams.deviceId
    ? parseInt(searchParams.deviceId, 10)
    : undefined;

  return (
    <div className="space-y-4">
      <PageHeader />
      <FirmwareTabs initialDeviceId={initialDeviceId} />
    </div>
  );
}
