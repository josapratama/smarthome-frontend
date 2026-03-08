"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  RefreshCw,
  TrendingDown,
  Clock,
  Home as HomeIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { energyApi } from "@/lib/api/energy";
import { devicesApi, DeviceWithDetails } from "@/lib/api/client/devices";
import { homesApi } from "@/lib/api/client/homes";
import { getEnergyCost } from "@/lib/api/energy-cost";
import { PageHeader } from "@/components/ui/page-header";
import { EnergyStatsCards } from "./energy-stats-cards";
import { DeviceEnergyList } from "./device-energy-list";
import type { EnergyStats } from "@/lib/types";

interface DeviceEnergyData {
  deviceId: number;
  deviceName: string;
  deviceType: string;
  energyKwh: number;
  avgPowerW: number;
  peakPowerW: number;
  cost: number;
  status: string;
}

export default function UserEnergyPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<EnergyStats | null>(null);
  const [devices, setDevices] = useState<DeviceWithDetails[]>([]);
  const [deviceEnergyData, setDeviceEnergyData] = useState<DeviceEnergyData[]>(
    [],
  );
  const [homes, setHomes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHome, setSelectedHome] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">(
    "today",
  );
  const [costPerKwh, setCostPerKwh] = useState(1500);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHome, timeRange]);

  // Listen to topbar events
  useEffect(() => {
    const handleRefresh = () => {
      loadData();
    };

    const handleFilter = () => {
      const filterSection = document.querySelector("[data-filter-section]");
      if (filterSection) {
        filterSection.scrollIntoView({ behavior: "smooth", block: "center" });
        // Add highlight effect
        filterSection.classList.add("ring-2", "ring-primary", "ring-offset-2");
        setTimeout(() => {
          filterSection.classList.remove(
            "ring-2",
            "ring-primary",
            "ring-offset-2",
          );
        }, 2000);
      }
    };

    window.addEventListener("topbar-refresh", handleRefresh);
    window.addEventListener("topbar-filter", handleFilter);

    return () => {
      window.removeEventListener("topbar-refresh", handleRefresh);
      window.removeEventListener("topbar-filter", handleFilter);
    };
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const homeId =
        selectedHome !== "all" ? parseInt(selectedHome) : undefined;

      // Load energy cost settings
      try {
        const costSettings = await getEnergyCost(homeId);
        setCostPerKwh(costSettings.costPerKwh);
      } catch (error) {
        console.log("Using default energy cost");
        setCostPerKwh(1500);
      }

      // Load devices and homes
      const [devicesData, homesData] = await Promise.all([
        devicesApi.list(homeId),
        homesApi.list(),
      ]);

      setHomes(homesData);

      // Filter only power meter devices
      const powerMeters = devicesData.filter(
        (d) =>
          d.type &&
          (d.type.toLowerCase().includes("power") ||
            d.type.toLowerCase().includes("meter") ||
            d.type.toLowerCase().includes("pzem")),
      );
      setDevices(powerMeters);

      // Load energy data for each power meter
      const energyData = await loadDeviceEnergyData(powerMeters, homeId);

      // Try to load stats from API (silent fail if not available)
      try {
        const statsData = await energyApi.getEnergyStats(homeId);
        setStats(statsData);
      } catch (error) {
        console.log("Energy stats API not available, using device data");
        calculateStatsFromDevices(energyData);
      }
    } catch (error: any) {
      console.error("Failed to load energy data:", error);
      toast.error(error.message || t("errorLoadingData"));
    } finally {
      setIsLoading(false);
    }
  };

  const loadDeviceEnergyData = async (
    powerMeters: DeviceWithDetails[],
    homeId?: number,
  ) => {
    try {
      const energyDataPromises = powerMeters.map(async (device) => {
        try {
          const response = await fetch(
            `/api/v1/devices/${device.id}/telemetry?limit=1`,
          );
          if (!response.ok) throw new Error("Failed to fetch telemetry");

          const telemetryData = await response.json();
          const latestData = telemetryData.data?.[0];

          return {
            deviceId: device.id,
            deviceName: device.name,
            deviceType: device.type,
            energyKwh: latestData?.energyKwh || 0,
            avgPowerW: latestData?.powerW || 0,
            peakPowerW: latestData?.powerW || 0,
            cost: (latestData?.energyKwh || 0) * costPerKwh,
            status: device.status,
          };
        } catch (error) {
          console.error(
            `Failed to load energy data for device ${device.id}:`,
            error,
          );
          return {
            deviceId: device.id,
            deviceName: device.name,
            deviceType: device.type,
            energyKwh: 0,
            avgPowerW: 0,
            peakPowerW: 0,
            cost: 0,
            status: device.status,
          };
        }
      });

      const energyData = await Promise.all(energyDataPromises);
      setDeviceEnergyData(energyData);
      return energyData;
    } catch (error) {
      console.error("Failed to load device energy data:", error);
      return [];
    }
  };

  const calculateStatsFromDevices = (energyData: DeviceEnergyData[]) => {
    const totalEnergy = energyData.reduce((sum, d) => sum + d.energyKwh, 0);
    const avgEnergy =
      energyData.length > 0 ? totalEnergy / energyData.length : 0;

    const mockStats: EnergyStats = {
      today: totalEnergy,
      yesterday: totalEnergy * 0.95,
      thisWeek: totalEnergy * 7,
      thisMonth: totalEnergy * 30,
      trend: "stable",
      percentageChange: 0,
      dailyAverage: avgEnergy,
      peakHour: 14,
      estimatedMonthlyCost: totalEnergy * 30 * costPerKwh,
    };

    setStats(mockStats);
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
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
            value: devices.filter((d) => d.status === "ONLINE").length,
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

      {/* Filters */}
      <Card data-filter-section className="transition-all duration-300">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <HomeIcon className="h-4 w-4 text-muted-foreground" />
                {t("filterByHome")}
              </label>
              <Select value={selectedHome} onValueChange={setSelectedHome}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allHomes")}</SelectItem>
                  {homes.map((home) => (
                    <SelectItem key={home.id} value={home.id.toString()}>
                      <div className="flex items-center gap-2">
                        <HomeIcon className="h-4 w-4" />
                        {home.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {t("timeRange")}
              </label>
              <Select
                value={timeRange}
                onValueChange={(v: any) => setTimeRange(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">{t("today")}</SelectItem>
                  <SelectItem value="week">{t("thisWeek")}</SelectItem>
                  <SelectItem value="month">{t("thisMonth")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <EnergyStatsCards
        stats={stats}
        isLoading={isLoading}
        timeRange={timeRange}
        costPerKwh={costPerKwh}
        devicesCount={devices.length}
        onlineDevicesCount={devices.filter((d) => d.status === "ONLINE").length}
      />

      {/* Energy Consumption by Device */}
      <DeviceEnergyList
        deviceEnergyData={deviceEnergyData}
        isLoading={isLoading}
      />

      {/* Energy Saving Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-green-500" />
            {t("energySavingTips")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-green-600">
                    {num}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t(`tip${num}`)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
