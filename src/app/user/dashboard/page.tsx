"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Home as HomeIcon, Smartphone, Wifi, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { PageHeader } from "@/components/ui/page-header";
import { UserInvites } from "@/app/user/invites/user-invites";
import { useDashboard } from "./hooks/use-dashboard";
import { HomesOverview } from "./components/homes-overview";
import { GettingStartedCard } from "./components/getting-started-card";

export default function UserDashboardPage() {
  const { t } = useTranslation();
  const {
    homes,
    devices,
    isLoading,
    onlineDevices,
    offlineDevices,
    homesCount,
    devicesCount,
  } = useDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        stats={[
          {
            label: t("totalHomes"),
            value: homesCount,
            icon: HomeIcon,
            color: "text-blue-500",
          },
          {
            label: t("totalDevices"),
            value: devicesCount,
            icon: Smartphone,
            color: "text-purple-500",
          },
          {
            label: t("onlineDevices"),
            value: onlineDevices.length,
            icon: Wifi,
            color: "text-green-500",
          },
          {
            label: t("offlineDevices"),
            value: offlineDevices.length,
            icon: AlertCircle,
            color: offlineDevices.length > 0 ? "text-red-500" : "text-gray-400",
          },
        ]}
      />

      <UserInvites />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {homesCount === 0 && devicesCount === 0 && <GettingStartedCard />}
          {homesCount > 0 && <HomesOverview homes={homes} devices={devices} />}
        </>
      )}
    </div>
  );
}
