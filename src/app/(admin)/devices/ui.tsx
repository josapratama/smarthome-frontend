"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Activity, Zap, Plus } from "lucide-react";

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

function fmtDateTime(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
}

export default function DevicesClient() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [qText, setQText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [homeIdFilter, setHomeIdFilter] = useState<string>("");

  // Edit dialog state
  const [editDevice, setEditDevice] = useState<DeviceDTO | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");

  // Delete dialog state
  const [deleteDevice, setDeleteDevice] = useState<DeviceDTO | null>(null);

  const q = useQuery({
    queryKey: qk.devices.list(homeIdFilter ? Number(homeIdFilter) : undefined),
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (homeIdFilter) params.homeId = homeIdFilter;
      if (statusFilter !== "all") params.status = statusFilter;

      const response = await apiFetchBrowser<{ data: DeviceDTO[] }>(
        "/api/v1/devices",
        { params },
      );
      return response.data ?? [];
    },
    refetchInterval: 5_000,
  });

  const filtered = useMemo(() => {
    const t = qText.trim().toLowerCase();
    if (!t) return q.data ?? [];
    return (q.data ?? []).filter((d) => {
      return (
        String(d.id).includes(t) ||
        d.deviceName.toLowerCase().includes(t) ||
        (d.mqttClientId ?? "").toLowerCase().includes(t) ||
        (d.deviceType ?? "").toLowerCase().includes(t) ||
        String(d.homeId).includes(t)
      );
    });
  }, [q.data, qText]);

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: async (data: {
      id: number;
      deviceName: string;
      deviceType: string;
    }) => {
      await apiFetchBrowser(`/api/v1/devices/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          deviceName: data.deviceName,
          deviceType: data.deviceType,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.devices.all });
      toast({
        title: t("success"),
        description: t("deviceRegistered"),
      });
      setEditDevice(null);
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
    mutationFn: async (deviceId: number) => {
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
      setDeleteDevice(null);
    },
    onError: (error: any) => {
      toast({
        title: t("error"),
        description: error.message || "Failed to delete device",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (device: DeviceDTO) => {
    setEditDevice(device);
    setEditName(device.deviceName);
    setEditType(device.deviceType);
  };

  const handleSaveEdit = () => {
    if (!editDevice) return;
    editMutation.mutate({
      id: editDevice.id,
      deviceName: editName,
      deviceType: editType,
    });
  };

  const handleDelete = (device: DeviceDTO) => {
    setDeleteDevice(device);
  };

  const confirmDelete = () => {
    if (!deleteDevice) return;
    deleteMutation.mutate(deleteDevice.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("devices")}</h1>
          <p className="text-sm text-muted-foreground">{t("manageDevices")}</p>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <Input
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            placeholder={`${t("search")} ${t("devices").toLowerCase()}...`}
            className="sm:w-[300px]"
          />
          <Button
            variant="outline"
            onClick={() => q.refetch()}
            disabled={q.isFetching}
          >
            {t("refresh")}
          </Button>
          <Link href="/devices/register">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Register Device
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Status:</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allDevices")}</SelectItem>
              <SelectItem value="true">{t("onlineDevices")}</SelectItem>
              <SelectItem value="false">{t("offlineDevices")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Home ID:</label>
          <Input
            value={homeIdFilter}
            onChange={(e) => setHomeIdFilter(e.target.value)}
            placeholder="Filter by home"
            className="w-32"
          />
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {t("allDevices")} ({filtered.length})
          </CardTitle>
        </CardHeader>

        <CardContent>
          {q.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : q.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              {(q.error as Error).message}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              {qText || statusFilter !== "all" || homeIdFilter
                ? t("noDevicesFound")
                : t("noData")}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((d) => (
                <Card
                  key={d.id}
                  className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                  onClick={() => router.push(`/devices/${d.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-lg truncate">
                            {d.deviceName}
                          </span>
                          {statusBadge(d.status, t)}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {deviceTypeBadge(d.deviceType)}
                          <Badge variant="outline" className="text-xs">
                            #{d.id}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Last seen:</span>
                        <span className="font-mono">
                          {d.lastSeenAt
                            ? new Date(d.lastSeenAt).toLocaleString()
                            : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Home:</span>
                        <span>#{d.homeId}</span>
                      </div>
                      {d.roomId && (
                        <div className="flex justify-between">
                          <span>Room:</span>
                          <span>#{d.roomId}</span>
                        </div>
                      )}
                      {d.mqttClientId && (
                        <div className="flex justify-between">
                          <span>MQTT:</span>
                          <span className="font-mono text-xs truncate">
                            {d.mqttClientId}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/devices/${d.id}/telemetry`);
                        }}
                      >
                        <Activity className="mr-1 h-3 w-3" />
                        Telemetry
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/ota?deviceId=${d.id}`);
                        }}
                      >
                        <Zap className="mr-1 h-3 w-3" />
                        OTA
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(d);
                        }}
                      >
                        <Pencil className="mr-1 h-3 w-3" />
                        {t("edit")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(d);
                        }}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        {t("delete")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {q.isFetching && !q.isLoading ? (
            <div className="mt-3 text-xs text-muted-foreground">
              {t("loading")}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editDevice} onOpenChange={() => setEditDevice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("edit")} Device</DialogTitle>
            <DialogDescription>
              Update device information for #{editDevice?.id}
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
              onClick={() => setEditDevice(null)}
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
      <AlertDialog
        open={!!deleteDevice}
        onOpenChange={() => setDeleteDevice(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete device{" "}
              <span className="font-semibold">{deleteDevice?.deviceName}</span>{" "}
              (#{deleteDevice?.id}). This action cannot be undone.
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
