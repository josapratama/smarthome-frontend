import { PageHeader } from "@/components/ui/page-header";
import { EnergyTabs } from "./components/energy-tabs";

export default function EnergyManagementPage() {
  return (
    <div className="space-y-4">
      <PageHeader />
      <EnergyTabs />
    </div>
  );
}
