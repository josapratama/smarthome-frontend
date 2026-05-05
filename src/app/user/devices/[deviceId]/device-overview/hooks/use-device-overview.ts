"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";
import { devicesApi, type DeviceWithDetails } from "@/lib/api/services/devices";
import { telemetryApi, type SensorReading } from "@/lib/api/services/telemetry";
import { apiFetchBrowser } from "@/lib/api/client/fetch";

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

      // Enrich device with home and room names if not already present
      let enriched = { ...deviceData };
      if (!enriched.home && enriched.homeId) {
        try {
          const homeRes = await apiFetchBrowser<{
            data: { id: number; name: string };
          }>(`/api/v1/homes/${enriched.homeId}`);
          if (homeRes.data) {
            enriched.home = { id: homeRes.data.id, name: homeRes.data.name };
          }
        } catch {
          // silently fail — home name is optional
        }
      }
      if (!enriched.room && enriched.roomId) {
        try {
          const roomRes = await apiFetchBrowser<{
            data: { id: number; name: string };
          }>(`/api/v1/rooms/${enriched.roomId}`);
          if (roomRes.data) {
            enriched.room = { id: roomRes.data.id, name: roomRes.data.name };
          }
        } catch {
          // silently fail — room name is optional
        }
      }

      setDevice(enriched);
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
