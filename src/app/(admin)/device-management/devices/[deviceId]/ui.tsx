"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import type { DeviceDTO } from "@/lib/api/dto/devices.dto";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Activity,
  Pencil,
  Trash2,
  Wifi,
  WifiOff,
  Home as HomeIcon,
  DoorOpen,
  Clock,
  Settings,
  Key,
  Zap,
} from "lucide-react";

function statusBadge(status: boolean, t: any) {
  return status ? (
    <Badge className="bg-green-500 hover:bg-green-600">
      <Wifi className="mr-1 h-3 w-3" />
      {t("online")}
    </Badge>
  ) : (
    <Badge variant="secondary">
      <WifiOff className="mr-1 h-3 w-3" />
      {t("offline")}
    </Badge>
  );
}

function deviceTypeBadge(type: string) {
  const colors: Record<string, string> = {
    LIGHT:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    FAN: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    SENSOR_NODE:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    POWER_METER:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    DOOR: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  return (
    <Badge variant="outline" className={colors[type] || colors.OTHER}>
      {type.replace("_", " ")}
    </Badge>
  );
}

export function DeviceDetailClient({ deviceId }: { deviceId: number }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Send credentials mutation
  const sendCredentialsMutation = useMutation({
    mutationFn: async () => {
      if (!device) throw new Error("Device not found");

      // Extract MAC from capabilities
      const mac = (device.capabilities as any)?.mac;
      if (!mac) {
        throw new Error("Device MAC address not found in capabilities");
      }

      await apiFetchBrowser("/api/v1/devices/register/send-credentials", {
        method: "POST",
        body: JSON.stringify({
          mac,
          deviceId: device.id,
          deviceKey: device.deviceKey,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: t("success"),
        description: t("credentialsSent"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("error"),
        description: error.message || t("failedSendCredentials"),
        variant: "destructive",
      });
    },
  });

  // Fetch device details
  const deviceQuery = useQuery({
    queryKey: qk.devices.detail(deviceId),
    queryFn: async () => {
      const response = await apiFetchBrowser<{ data: DeviceDTO }>(
        `/api/v1/devices/${deviceId}`,
      );
      return response.data;
    },
    refetchInterval: 5_000,
  });

  const device = deviceQuery.data;

  // Edit mutation
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
      toast({
        title: t("success"),
        description: t("deviceUpdated"),
      });
      setEditOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: t("error"),
        description: error.message || "Failed to update device",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiFetchBrowser(`/api/v1/devices/${deviceId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.devices.all });
      toast({
        title: t("success"),
        description: t("deviceDeleted"),
      });
      router.push("/device-management");
    },
    onError: (error: any) => {
      toast({
        title: t("error"),
        description: error.message || "Failed to delete device",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    if (!device) return;
    setEditName(device.deviceName);
    setEditType(device.deviceType);
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    editMutation.mutate({
      deviceName: editName,
      deviceType: editType,
    });
  };

  const handleDelete = () => {
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
  };

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
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            {deviceQuery.error
              ? (deviceQuery.error as Error).message
              : t("deviceNotFound")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="space-y-4">
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

        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{device.deviceName}</h1>
              {statusBadge(device.status, t)}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {t("device")} #{device.id}
              </span>
              <span>•</span>
              {deviceTypeBadge(device.deviceType)}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              {t("edit")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("delete")}
            </Button>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${device.status ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-800"}`}
              >
                {device.status ? (
                  <Wifi className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <WifiOff className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("status")}</p>
                <p className="text-sm font-semibold">
                  {device.status ? t("online") : t("offline")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("lastSeen")}</p>
                <p className="text-sm font-semibold">
                  {device.lastSeenAt
                    ? new Date(device.lastSeenAt).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : t("never")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                <HomeIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("home")}</p>
                <p className="text-sm font-semibold">#{device.homeId}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                <DoorOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("room")}</p>
                <p className="text-sm font-semibold">
                  {device.roomId ? `#${device.roomId}` : t("notAssigned")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Information */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t("deviceInformation")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {t("deviceName")}
              </Label>
              <p className="text-sm font-medium">{device.deviceName}</p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {t("deviceType")}
              </Label>
              <div>{deviceTypeBadge(device.deviceType)}</div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                MQTT Client ID
              </Label>
              <p className="text-sm font-mono">{device.mqttClientId || "-"}</p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {t("pairedAt")}
              </Label>
              <p className="text-sm">
                {device.pairedAt
                  ? new Date(device.pairedAt).toLocaleString()
                  : "-"}
              </p>
            </div>

            {device.capabilities && (
              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs text-muted-foreground">
                  {t("capabilities")}
                </Label>
                <pre className="rounded-lg bg-muted p-3 text-xs overflow-x-auto">
                  {JSON.stringify(device.capabilities, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t("quickActions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={() =>
                router.push(`/device-management/devices/${deviceId}/config`)
              }
            >
              <Settings className="mr-2 h-4 w-4" />
              {t("configuration")}
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={() =>
                router.push(`/device-management/devices/${deviceId}/channels`)
              }
            >
              <Zap className="mr-2 h-4 w-4" />
              {t("manageChannels")}
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={() =>
                router.push(`/device-management/devices/${deviceId}/telemetry`)
              }
            >
              <Activity className="mr-2 h-4 w-4" />
              {t("telemetry")}
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={() => sendCredentialsMutation.mutate()}
              disabled={sendCredentialsMutation.isPending}
            >
              <Key className="mr-2 h-4 w-4" />
              {sendCredentialsMutation.isPending
                ? t("sending")
                : t("sendCredentials")}
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={() => router.push(`/firmware?deviceId=${deviceId}`)}
            >
              <Zap className="mr-2 h-4 w-4" />
              {t("otaUpdate")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("edit")} {t("device")}
            </DialogTitle>
            <DialogDescription>
              {t("updateDeviceInfo")} #{deviceId}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t("deviceName")}</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder={t("enterDeviceName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">{t("deviceType")}</Label>
              <Select value={editType} onValueChange={setEditType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SENSOR_NODE">{t("sensorNode")}</SelectItem>
                  <SelectItem value="LIGHT">{t("light")}</SelectItem>
                  <SelectItem value="FAN">{t("fan")}</SelectItem>
                  <SelectItem value="DOOR">{t("door")}</SelectItem>
                  <SelectItem value="POWER_METER">{t("powerMeter")}</SelectItem>
                  <SelectItem value="OTHER">{t("other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={editMutation.isPending}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={editMutation.isPending || !editName.trim()}
            >
              {editMutation.isPending ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("areYouSure")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDeviceConfirm")}{" "}
              <span className="font-semibold">{device.deviceName}</span> (#
              {deviceId}). {t("cannotUndo")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? t("deleting") : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
