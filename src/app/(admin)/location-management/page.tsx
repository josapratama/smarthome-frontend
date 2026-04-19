import { PageHeader } from "@/components/ui/page-header";
import { LocationTabs } from "./components/location-tabs";

export default function LocationManagementPage() {
  return (
    <div className="space-y-4">
      <PageHeader />
      <LocationTabs />
    </div>
  );
}
