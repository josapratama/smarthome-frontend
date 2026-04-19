import { PageHeader } from "@/components/ui/page-header";
import { SystemToolsTabs } from "./components/system-tools-tabs";

export default function SystemToolsPage() {
  return (
    <div className="space-y-4">
      <PageHeader />
      <SystemToolsTabs />
    </div>
  );
}
