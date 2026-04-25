"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";
import { homesApi, type Home } from "@/lib/api/services/homes";
import { devicesApi, type DeviceWithDetails } from "@/lib/api/services/devices";

export function useDashboard() {
  const { t } = useTranslation();
  const [homes, setHomes] = useState<Home[]>([]);
  const [devices, setDevices] = useState<DeviceWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [homesData, devicesData] = await Promise.all([
        homesApi.list(),
        devicesApi.list(),
      ]);
      setHomes(homesData);
      setDevices(devicesData);
    } catch (error: any) {
      toast.error(
        error.message ||
          t("failedToLoadDashboard") ||
          "Failed to load dashboard data",
      );
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30_000);
    return () => clearInterval(interval);
  }, [loadData]);

  const onlineDevices = devices.filter((d) => d.status === "ONLINE");
  const offlineDevices = devices.filter((d) => d.status === "OFFLINE");

  return {
    homes,
    devices,
    isLoading,
    onlineDevices,
    offlineDevices,
    homesCount: homes.length,
    devicesCount: devices.length,
  };
}
