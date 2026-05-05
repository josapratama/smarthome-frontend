import { PageHeader } from "@/components/ui/page-header";
import { CommunicationsTabs } from "./components/communications-tabs";

export default function CommunicationsPage() {
  return (
    <div className="space-y-4">
      <PageHeader />
      <CommunicationsTabs />
    </div>
  );
}
