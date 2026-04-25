"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";
import { energyApi } from "@/lib/api/services/energy";
import { devicesApi, type DeviceWithDetails } from "@/lib/api/services/devices";
import { homesApi, type Home } from "@/lib/api/services/homes";
import { getEnergyCost } from "@/lib/api/services/energy-cost";
import type { EnergyStats } from "@/lib/types";

export interface DeviceEnergyData {
  deviceId: number;
  deviceName: string;
  deviceType: string;
  energyKwh: number;
  avgPowerW: number;
  peakPowerW: number;
  cost: number;
  status: string;
}

export type TimeRange = "today" | "week" | "month";

const DEFAULT_COST_PER_KWH = 1500;

function isPowerMeter(device: DeviceWithDetails): boolean {
  const t = device.type?.toLowerCase() ?? "";
  return t.includes("power") || t.includes("meter") || t.includes("pzem");
}

export function useEnergy() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<EnergyStats | null>(null);
  const [devices, setDevices] = useState<DeviceWithDetails[]>([]);
  const [deviceEnergyData, setDeviceEnergyData] = useState<DeviceEnergyData[]>(
    [],
  );
  const [homes, setHomes] = useState<Home[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHome, setSelectedHome] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<TimeRange>("today");
  const [costPerKwh, setCostPerKwh] = useState(DEFAULT_COST_PER_KWH);

  // Keep costPerKwh in a ref so loadDeviceEnergyData always uses latest value
  const costRef = useRef(costPerKwh);
  costRef.current = costPerKwh;

  const loadDeviceEnergyData = useCallback(
    async (powerMeters: DeviceWithDetails[]): Promise<DeviceEnergyData[]> => {
      const results = await Promise.all(
        powerMeters.map(async (device) => {
          try {
            const res = await fetch(
              `/api/v1/devices/${device.id}/telemetry?limit=1`,
            );
            if (!res.ok) throw new Error("Failed to fetch telemetry");
            const json = await res.json();
            const latest = json.data?.[0];
            return {
              deviceId: device.id,
              deviceName: device.name,
              deviceType: device.type,
              energyKwh: latest?.energyKwh ?? 0,
              avgPowerW: latest?.powerW ?? 0,
              peakPowerW: latest?.powerW ?? 0,
              cost: (latest?.energyKwh ?? 0) * costRef.current,
              status: device.status,
            };
          } catch {
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
        }),
      );
      setDeviceEnergyData(results);
      return results;
    },
    [],
  );

  const calculateStatsFromDevices = useCallback(
    (energyData: DeviceEnergyData[], cost: number) => {
      const total = energyData.reduce((s, d) => s + d.energyKwh, 0);
      const avg = energyData.length > 0 ? total / energyData.length : 0;
      setStats({
        today: total,
        yesterday: total * 0.95,
        thisWeek: total * 7,
        thisMonth: total * 30,
        trend: "stable",
        percentageChange: 0,
        dailyAverage: avg,
        peakHour: 14,
        estimatedMonthlyCost: total * 30 * cost,
      });
    },
    [],
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const homeId =
        selectedHome !== "all" ? parseInt(selectedHome) : undefined;

      // Load cost settings (silent fallback)
      let cost = DEFAULT_COST_PER_KWH;
      try {
        const costSettings = await getEnergyCost(homeId);
        cost = costSettings.costPerKwh;
      } catch {
        // use default
      }
      setCostPerKwh(cost);

      const [devicesData, homesData] = await Promise.all([
        devicesApi.list(homeId),
        homesApi.list(),
      ]);

      setHomes(homesData);
      const powerMeters = devicesData.filter(isPowerMeter);
      setDevices(powerMeters);

      const energyData = await loadDeviceEnergyData(powerMeters);

      try {
        const statsData = await energyApi.getEnergyStats(homeId);
        setStats(statsData);
      } catch {
        calculateStatsFromDevices(energyData, cost);
      }
    } catch (error: any) {
      toast.error(error.message || t("errorLoadingData"));
    } finally {
      setIsLoading(false);
    }
  }, [selectedHome, t, loadDeviceEnergyData, calculateStatsFromDevices]);

  // Topbar event listeners
  useEffect(() => {
    const handleRefresh = () => loadData();
    const handleFilter = () => {
      const el = document.querySelector("[data-filter-section]");
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-primary", "ring-offset-2");
      setTimeout(
        () => el.classList.remove("ring-2", "ring-primary", "ring-offset-2"),
        2000,
      );
    };
    window.addEventListener("topbar-refresh", handleRefresh);
    window.addEventListener("topbar-filter", handleFilter);
    return () => {
      window.removeEventListener("topbar-refresh", handleRefresh);
      window.removeEventListener("topbar-filter", handleFilter);
    };
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
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
  };
}
