"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client.browser";
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
  ArrowLeft,
  Activity,
  Zap,
  Pencil,
  Trash2,
  Wifi,
  Home,
  DoorOpen,
  Clock,
  Power,
  Key,
  Settings,
} from "lucide-react";

function statusBadge(status: boolean, t: any) {
  return status ? (
    <Badge className="bg-green-500">{t("onlineDevices")}</Badge>
  ) : (
    <Badge variant="secondary">{t("offlineDevices")}</Badge>
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
        description: "Credentials sent to device successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: t("error"),
        description: error.message || "Failed to send credentials",
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
        description: "Device updated successfully",
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
        description: "Device deleted successfully",
      });
      router.push("/devices");
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
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/devices">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Devices
          </Link>
        </Button>
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              {deviceQuery.error
                ? (deviceQuery.error as Error).message
                : "Device not found"}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/devices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{device.deviceName}</h1>
            <p className="text-sm text-muted-foreground">
              Device #{device.id} • {device.deviceType}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/devices/${deviceId}/config`}>
              <Settings className="mr-2 h-4 w-4" />
              {t("configuration")}
            </Link>
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            {t("edit")}
          </Button>
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("delete")}
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Power className="h-5 w-5" />
            Device Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Wifi className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">{statusBadge(device.status, t)}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Seen</p>
                <p className="font-medium">
                  {device.lastSeenAt
                    ? new Date(device.lastSeenAt).toLocaleString()
                    : "Never"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Home className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Home</p>
                <p className="font-medium">#{device.homeId}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <DoorOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Room</p>
                <p className="font-medium">
                  {device.roomId ? `#${device.roomId}` : "Not assigned"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Info Card */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Device Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-muted-foreground">Device Name</Label>
              <p className="font-medium">{device.deviceName}</p>
            </div>

            <div className="grid gap-2">
              <Label className="text-muted-foreground">Device Type</Label>
              <div>{deviceTypeBadge(device.deviceType)}</div>
            </div>

            <div className="grid gap-2">
              <Label className="text-muted-foreground">MQTT Client ID</Label>
              <p className="font-mono text-sm">
                {device.mqttClientId || "Not set"}
              </p>
            </div>

            <div className="grid gap-2">
              <Label className="text-muted-foreground">Device Key</Label>
              <p className="font-mono text-sm">
                {device.deviceKey
                  ? `${device.deviceKey.substring(0, 20)}...`
                  : "Not set"}
              </p>
            </div>

            {device.capabilities && (
              <div className="grid gap-2">
                <Label className="text-muted-foreground">Capabilities</Label>
                <pre className="rounded-lg bg-muted p-3 text-xs overflow-x-auto">
                  {JSON.stringify(device.capabilities, null, 2)}
                </pre>
              </div>
            )}

            <div className="grid gap-2">
              <Label className="text-muted-foreground">Paired At</Label>
              <p className="text-sm">
                {device.pairedAt
                  ? new Date(device.pairedAt).toLocaleString()
                  : "Not paired"}
              </p>
            </div>

            <div className="grid gap-2">
              <Label className="text-muted-foreground">Updated At</Label>
              <p className="text-sm">
                {new Date(device.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => router.push(`/devices/${deviceId}/channels`)}
            >
              <Zap className="mr-2 h-4 w-4" />
              Manage Channels
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => router.push(`/devices/${deviceId}/telemetry`)}
            >
              <Activity className="mr-2 h-4 w-4" />
              View Telemetry Data
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => sendCredentialsMutation.mutate()}
              disabled={sendCredentialsMutation.isPending}
            >
              <Key className="mr-2 h-4 w-4" />
              {sendCredentialsMutation.isPending
                ? "Sending..."
                : "Send Credentials"}
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => router.push(`/ota?deviceId=${deviceId}`)}
            >
              <Zap className="mr-2 h-4 w-4" />
              OTA Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("edit")} Device</DialogTitle>
            <DialogDescription>
              Update device information for #{deviceId}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Device Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter device name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">Device Type</Label>
              <Select value={editType} onValueChange={setEditType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SENSOR_NODE">Sensor Node</SelectItem>
                  <SelectItem value="LIGHT">Light</SelectItem>
                  <SelectItem value="FAN">Fan</SelectItem>
                  <SelectItem value="DOOR">Door</SelectItem>
                  <SelectItem value="POWER_METER">Power Meter</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete device{" "}
              <span className="font-semibold">{device.deviceName}</span> (#
              {deviceId}). This action cannot be undone.
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
              {deleteMutation.isPending ? "Deleting..." : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
