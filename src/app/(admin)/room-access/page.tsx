import { PageHeader } from "@/components/ui/page-header";
import { RoomAccessTabs } from "./components/room-access-tabs";

export default function RoomAccessPage() {
  return (
    <div className="space-y-4">
      <PageHeader />
      <RoomAccessTabs />
    </div>
  );
}
