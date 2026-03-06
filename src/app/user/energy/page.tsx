"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Calendar,
  RefreshCw,
  Activity,
  Home as HomeIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { energyApi } from "@/lib/api/energy";
import { devicesApi, DeviceWithDetails } from "@/lib/api/client/devices";
import { homesApi } from "@/lib/api/client/homes";
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
  const [costPerKwh] = useState(1500); // IDR per kWh

  useEffect(() => {
    loadData();
  }, [selectedHome, timeRange]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const homeId =
        selectedHome !== "all" ? parseInt(selectedHome) : undefined;

      // Load devices and homes
      const [devicesData, homesData] = await Promise.all([
        devicesApi.list(homeId),
        homesApi.list(),
      ]);

      setHomes(homesData);

      // Filter only power meter devices
      const powerMeters = devicesData.filter(
        (d) =>
          d.type.toLowerCase().includes("power") ||
          d.type.toLowerCase().includes("meter") ||
          d.type.toLowerCase().includes("pzem"),
      );
      setDevices(powerMeters);

      // Load energy data for each power meter
      const energyData = await loadDeviceEnergyData(powerMeters, homeId);

      // Try to load stats from API (silent fail if not available)
      try {
        const statsData = await energyApi.getEnergyStats(homeId);
        setStats(statsData);
      } catch (error) {
        // Silent fail - calculate stats from device data instead
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
          // Fetch latest telemetry for the device
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

      // Return energy data for stats calculation
      return energyData;
    } catch (error) {
      console.error("Failed to load device energy data:", error);
      return [];
    }
  };

  const calculateStatsFromDevices = (energyData: DeviceEnergyData[]) => {
    // Calculate stats from device energy data
    const totalEnergy = energyData.reduce((sum, d) => sum + d.energyKwh, 0);
    const avgEnergy =
      energyData.length > 0 ? totalEnergy / energyData.length : 0;

    // Create mock stats based on device data
    const mockStats: EnergyStats = {
      today: totalEnergy,
      yesterday: totalEnergy * 0.95, // Mock previous day data
      thisWeek: totalEnergy * 7,
      thisMonth: totalEnergy * 30,
      trend: "stable",
      percentageChange: 0,
      dailyAverage: avgEnergy,
      peakHour: 14, // Mock peak hour
      estimatedMonthlyCost: totalEnergy * 30 * costPerKwh,
    };

    setStats(mockStats);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-red-500";
      case "down":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const formatEnergy = (kwh: number) => {
    if (kwh >= 1000) {
      return `${(kwh / 1000).toFixed(2)} MWh`;
    }
    return `${kwh.toFixed(2)} kWh`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTimeRangeValue = () => {
    if (!stats) return 0;
    switch (timeRange) {
      case "today":
        return stats.today;
      case "week":
        return stats.thisWeek;
      case "month":
        return stats.thisMonth;
      default:
        return stats.today;
    }
  };

  const totalEnergy = deviceEnergyData.reduce((sum, d) => sum + d.energyKwh, 0);
  const totalCost = deviceEnergyData.reduce((sum, d) => sum + d.cost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Zap className="h-7 w-7 text-yellow-500" />
            {t("energy")}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            {t("monitorEnergyConsumption")}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Home Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("filterByHome")}</label>
              <Select value={selectedHome} onValueChange={setSelectedHome}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allHomes")}</SelectItem>
                  {homes.map((home) => (
                    <SelectItem key={home.id} value={home.id.toString()}>
                      {home.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("timeRange")}</label>
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
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[140px] rounded-lg" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Consumption */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("totalConsumption")}
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {formatEnergy(getTimeRangeValue())}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-sm">
                {getTrendIcon(stats.trend)}
                <span className={getTrendColor(stats.trend)}>
                  {Math.abs(stats.percentageChange).toFixed(1)}%
                </span>
                <span className="text-muted-foreground">
                  {t("fromYesterday")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Estimated Cost */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("estimatedCost")}
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(getTimeRangeValue() * costPerKwh)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-3">
                @ {formatCurrency(costPerKwh)}/kWh
              </div>
            </CardContent>
          </Card>

          {/* Daily Average */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("dailyAverage")}
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {formatEnergy(stats.dailyAverage)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-3">
                {t("perDay")}
              </div>
            </CardContent>
          </Card>

          {/* Active Power Meters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("powerMeters")}
                  </p>
                  <p className="text-2xl font-bold mt-1">{devices.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-3">
                {devices.filter((d) => d.status === "ONLINE").length}{" "}
                {t("online")}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Energy Consumption by Device */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {t("energyConsumptionByDevice")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : deviceEnergyData.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold mb-2">
                {t("noPowerMetersFound")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("addPowerMeterToTrack")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {deviceEnergyData.map((device) => (
                <div
                  key={device.deviceId}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{device.deviceName}</h4>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            device.status === "ONLINE"
                              ? "bg-green-500/10 text-green-600"
                              : "bg-gray-500/10 text-gray-600"
                          }`}
                        >
                          {device.status === "ONLINE"
                            ? t("online")
                            : t("offline")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {device.deviceType}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {formatEnergy(device.energyKwh)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(device.cost)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {device.avgPowerW.toFixed(0)}W {t("currentUsage")}
                    </div>
                  </div>
                </div>
              ))}

              {/* Total */}
              {deviceEnergyData.length > 1 && (
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border-2 border-primary/20">
                  <div className="font-semibold">{t("total")}</div>
                  <div className="text-right">
                    <div className="font-bold text-xl">
                      {formatEnergy(totalEnergy)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(totalCost)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
            <div className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-green-600">1</span>
              </div>
              <p className="text-sm text-muted-foreground">{t("tip1")}</p>
            </div>
            <div className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-green-600">2</span>
              </div>
              <p className="text-sm text-muted-foreground">{t("tip2")}</p>
            </div>
            <div className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-green-600">3</span>
              </div>
              <p className="text-sm text-muted-foreground">{t("tip3")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
