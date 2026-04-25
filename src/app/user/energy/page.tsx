"use client";

import { Button } from "@/components/ui/button";
import { Zap, TrendingDown, RefreshCw } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { PageHeader } from "@/components/ui/page-header";
import { useEnergy } from "./hooks/use-energy";
import { EnergyFilters } from "./components/energy-filters";
import { EnergyStatsCards } from "./components/energy-stats-cards";
import { DeviceEnergyList } from "./components/device-energy-list";
import { EnergySavingTips } from "./components/energy-saving-tips";

export default function UserEnergyPage() {
  const { t } = useTranslation();
  const {
    stats,
    devices,
    deviceEnergyData,
    homes,
    isLoading,
    selectedHome,
    setSelectedHome,
    timeRange,
    setTimeRange,
    costPerKwh,
    loadData,
  } = useEnergy();

  const onlineCount = devices.filter((d) => d.status === "ONLINE").length;

  return (
    <div className="space-y-6">
      <PageHeader
        stats={[
          {
            label: t("totalDevices"),
            value: devices.length,
            icon: Zap,
            color: "text-yellow-500",
          },
          {
            label: t("onlineDevices"),
            value: onlineCount,
            icon: TrendingDown,
            color: "text-green-500",
          },
          {
            label: t("today"),
            value: `${stats?.today?.toFixed(1) ?? "0"} kWh`,
            icon: Zap,
            color: "text-orange-500",
          },
        ]}
        actions={
          <Button
            variant="outline"
            size="icon"
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        }
      />

      <EnergyFilters
        homes={homes}
        selectedHome={selectedHome}
        onHomeChange={setSelectedHome}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />

      <EnergyStatsCards
        stats={stats}
        isLoading={isLoading}
        timeRange={timeRange}
        costPerKwh={costPerKwh}
        devicesCount={devices.length}
        onlineDevicesCount={onlineCount}
      />

      <DeviceEnergyList
        deviceEnergyData={deviceEnergyData}
        isLoading={isLoading}
      />

      <EnergySavingTips />
    </div>
  );
}
