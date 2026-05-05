import { PageHeader } from "@/components/ui/page-header";
import { SecurityTabs } from "./components/security-tabs";

export default function SecurityPage() {
  return (
    <div className="space-y-4">
      <PageHeader />
      <SecurityTabs />
    </div>
  );
}
