"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";
import { devicesApi, type DeviceWithDetails } from "@/lib/api/services/devices";
import { telemetryApi, type SensorReading } from "@/lib/api/services/telemetry";

export function useDeviceOverview(deviceId: number) {
  const { t } = useTranslation();
  const router = useRouter();
  const [device, setDevice] = useState<DeviceWithDetails | null>(null);
  const [latestReadings, setLatestReadings] = useState<SensorReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [deviceData, readings] = await Promise.all([
        devicesApi.getById(deviceId),
        telemetryApi.getLatest(deviceId).catch(() => [] as SensorReading[]),
      ]);
      setDevice(deviceData);
      setLatestReadings(readings);
    } catch (error: any) {
      toast.error(error.message || t("failedToLoadDevice"));
    } finally {
      setIsLoading(false);
    }
  }, [deviceId, t]);

  const handleDelete = async () => {
    try {
      await devicesApi.delete(deviceId);
      toast.success(t("deviceDeleted"));
      router.push("/user/devices");
    } catch (error: any) {
      toast.error(error.message || t("failedToDeleteDevice"));
    }
  };

  // handleTogglePower is a placeholder — actual implementation
  // requires a command API call (e.g. commandsApi.turnOn/turnOff)
  const handleTogglePower = async () => {
    toast.info(t("commandSent"));
    loadData();
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    device,
    latestReadings,
    isLoading,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleDelete,
    handleTogglePower,
  };
}
