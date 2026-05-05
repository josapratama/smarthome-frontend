import { PageHeader } from "@/components/ui/page-header";
import { SettingsHelpTabs } from "./components/settings-help-tabs";

export default function SettingsHelpPage() {
  return (
    <div className="space-y-4">
      <PageHeader />
      <SettingsHelpTabs />
    </div>
  );
}
