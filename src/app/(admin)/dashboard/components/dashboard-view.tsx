"use client";

import Link from "next/link";
import { Bell, HomeIcon, Wifi, WifiOff, Zap } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { useTranslation } from "@/hooks/use-translation";

import { DashboardErrorView } from "./dashboard-error-view";
import { HealthAlertBanner } from "./health-alert-banner";
import { SystemHealthCard } from "./system-health-card";
import { QuickActionsCard } from "./quick-actions-card";
import { HomesListCard } from "./homes-list-card";

interface OverviewData {
  users: number;
  homes: number;
  devices: number;
  onlineDevices: number;
  offlineDevices: number;
  pendingInvitesCount: number;
  homesList: Array<{
    id: number;
    name: string;
    city?: string | null;
    roleInHome: string;
    devicesOnline: number;
    devicesOffline: number;
    openAlarms: number;
  }>;
}

interface DashboardViewProps {
  data?: OverviewData;
  error?: { status?: number; payload?: unknown };
}

export function DashboardView({ data, error }: DashboardViewProps) {
  const { t } = useTranslation();

  if (error)
    return <DashboardErrorView status={error.status} payload={error.payload} />;
  if (!data) return <DashboardErrorView />;

  const criticalAlarms = data.homesList.reduce(
    (sum, h) => sum + h.openAlarms,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <PageHeader
        stats={[
          {
            label: t("totalHomes"),
            value: data.homes,
            icon: HomeIcon,
            color: "text-blue-500",
          },
          {
            label: t("totalDevices"),
            value: data.devices,
            icon: Zap,
            color: "text-purple-500",
          },
          {
            label: t("onlineDevices"),
            value: data.onlineDevices,
            icon: Wifi,
            color: "text-green-500",
          },
          {
            label: t("offlineDevices"),
            value: data.offlineDevices,
            icon: WifiOff,
            color: "text-gray-500",
          },
        ]}
        actions={
          data.pendingInvitesCount > 0 ? (
            <Link href="/invites">
              <div className="inline-flex items-center gap-2 rounded-full border bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 px-3 py-1.5 text-sm cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors">
                <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-muted-foreground">
                  {t("pendingInvites")}
                </span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {data.pendingInvitesCount}
                </span>
              </div>
            </Link>
          ) : undefined
        }
      />

      {/* Alert banners */}
      <HealthAlertBanner
        offlineDevices={data.offlineDevices}
        totalDevices={data.devices}
        criticalAlarms={criticalAlarms}
      />

      {/* System health */}
      <SystemHealthCard
        onlineDevices={data.onlineDevices}
        offlineDevices={data.offlineDevices}
        criticalAlarms={criticalAlarms}
      />

      {/* Quick actions */}
      <QuickActionsCard />

      {/* Homes list */}
      <HomesListCard homes={data.homesList} />
    </div>
  );
}
