"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import type { DeviceDTO } from "@/lib/api/dto/devices.dto";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, Home as HomeIcon } from "lucide-react";

import { StatusBadge, DeviceTypeBadge } from "../lib/device-badges";
import { DeviceStatusCards } from "./device-status-cards";
import { DeviceInfoCard } from "./device-info-card";
import { DeviceQuickActions } from "./device-quick-actions";
import { EnergySensorCard, type SensorReading } from "./energy-sensor-card";
import { DeviceEditDialog } from "./device-edit-dialog";
import { DeviceDeleteDialog } from "./device-delete-dialog";

interface DeviceDetailViewProps {
  deviceId: number;
}

export function DeviceDetailView({ deviceId }: DeviceDetailViewProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  // ── Dialog state ──────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  // ── Queries ───────────────────────────────────────────────
  const deviceQuery = useQuery({
    queryKey: qk.devices.detail(deviceId),
    queryFn: async () => {
      const res = await apiFetchBrowser<{ data: DeviceDTO }>(
        `/api/v1/devices/${deviceId}`,
      );
      return res.data;
    },
    refetchInterval: 5_000,
  });

  const device = deviceQuery.data;

  // ── Mutations ─────────────────────────────────────────────
  const sendCredentialsMutation = useMutation({
    mutationFn: async () => {
      if (!device) throw new Error("Device not found");
      const mac = (device.capabilities as any)?.mac;
      if (!mac) throw new Error("Device MAC address not found in capabilities");
      await apiFetchBrowser("/api/v1/devices/register/send-credentials", {
        method: "POST",
        body: JSON.stringify({
          mac,
          deviceId: device.id,
          deviceKey: device.deviceKey,
        }),
      });
    },
    onSuccess: () =>
      toast({ title: t("success"), description: t("credentialsSent") }),
    onError: (err: any) =>
      toast({
        title: t("error"),
        description: err.message || t("failedSendCredentials"),
        variant: "destructive",
      }),
  });

  const editMutation = useMutation({
    mutationFn: async (data: { deviceName: string; deviceType: string }) => {
      await apiFetchBrowser(`/api/v1/devices/${deviceId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.devices.all });
      queryClient.invalidateQueries({ queryKey: qk.devices.detail(deviceId) });
      toast({ title: t("success"), description: t("deviceUpdated") });
      setEditOpen(false);
    },
    onError: (err: any) =>
      toast({
        title: t("error"),
        description: err.message || "Failed to update device",
        variant: "destructive",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiFetchBrowser(`/api/v1/devices/${deviceId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.devices.all });
      toast({ title: t("success"), description: t("deviceDeleted") });
      router.push("/device-management");
    },
    onError: (err: any) =>
      toast({
        title: t("error"),
        description: err.message || "Failed to delete device",
        variant: "destructive",
      }),
  });

  // ── Handlers ──────────────────────────────────────────────
  function handleOpenEdit() {
    if (!device) return;
    setEditName(device.deviceName);
    setEditType(device.deviceType);
    setEditOpen(true);
  }

  // ── Loading / error states ────────────────────────────────
  if (deviceQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (deviceQuery.error || !device) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-6 text-center text-red-600">
          {deviceQuery.error
            ? (deviceQuery.error as Error).message
            : t("deviceNotFound")}
        </CardContent>
      </Card>
    );
  }

  const isEnergyMonitor = device.deviceType === "ENERGY_MONITOR";
  const sensorReadings: SensorReading[] = (device as any).sensorReadings ?? [];

  return (
    <>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => router.push("/device-management")}
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <HomeIcon className="h-4 w-4" />
            {t("deviceManagement")}
          </button>
          <span>/</span>
          <span className="text-foreground font-medium">
            {device.deviceName}
          </span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{device.deviceName}</h1>
              <StatusBadge
                status={device.status}
                onlineLabel={t("online")}
                offlineLabel={t("offline")}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {t("device")} #{device.id}
              </span>
              <span>•</span>
              <DeviceTypeBadge type={device.deviceType} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleOpenEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              {t("edit")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("delete")}
            </Button>
          </div>
        </div>

        {/* Status mini cards */}
        <DeviceStatusCards device={device} t={t} />

        {/* Device info */}
        <DeviceInfoCard device={device} t={t} />

        {/* Quick actions */}
        <DeviceQuickActions
          deviceId={deviceId}
          isEnergyMonitor={isEnergyMonitor}
          isSendingCredentials={sendCredentialsMutation.isPending}
          onSendCredentials={() => sendCredentialsMutation.mutate()}
          t={t}
        />

        {/* Energy sensor readings */}
        {isEnergyMonitor && <EnergySensorCard readings={sensorReadings} />}
      </div>

      {/* Dialogs */}
      <DeviceEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        deviceId={deviceId}
        name={editName}
        type={editType}
        onNameChange={setEditName}
        onTypeChange={setEditType}
        onSave={() =>
          editMutation.mutate({ deviceName: editName, deviceType: editType })
        }
        isSaving={editMutation.isPending}
        t={t}
      />

      <DeviceDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        deviceId={deviceId}
        deviceName={device.deviceName}
        onConfirm={() => deleteMutation.mutate()}
        isDeleting={deleteMutation.isPending}
        t={t}
      />
    </>
  );
}
