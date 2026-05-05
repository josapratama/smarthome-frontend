"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";
import { homesApi, type Home } from "@/lib/api/services/homes";
import { devicesApi, type DeviceWithDetails } from "@/lib/api/services/devices";

export function useDashboard() {
  const { t } = useTranslation();
  const tRef = useRef(t);
  const [homes, setHomes] = useState<Home[]>([]);
  const [devices, setDevices] = useState<DeviceWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selalu update ref tanpa menyebabkan loadData berubah referensi
  useEffect(() => {
    tRef.current = t;
  });

  // loadData tidak bergantung pada t — gunakan tRef.current saat dibutuhkan
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
          tRef.current("failedToLoadDashboard") ||
          "Failed to load dashboard data",
      );
    } finally {
      setIsLoading(false);
    }
  }, []); // tidak ada dependency — referensi stabil

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30_000);
    return () => clearInterval(interval);
  }, [loadData]); // loadData stabil → effect hanya jalan sekali

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
