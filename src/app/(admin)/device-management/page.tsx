import { PageHeader } from "@/components/ui/page-header";
import { DeviceManagementTabs } from "./components/device-management-tabs";

export default function DeviceManagementPage() {
  return (
    <div className="space-y-4">
      <PageHeader />
      <DeviceManagementTabs />
    </div>
  );
}
