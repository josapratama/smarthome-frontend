"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Wifi,
  WifiOff,
  MapPin,
  Home,
  Calendar,
  Cpu,
  Edit,
  Trash2,
  Power,
  PowerOff,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { devicesApi } from "@/lib/api/client/devices";
import { telemetryApi } from "@/lib/api/telemetry";
import { toast } from "sonner";
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

interface DeviceOverviewProps {
  deviceId: number;
}

export default function DeviceOverview({ deviceId }: DeviceOverviewProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [device, setDevice] = useState<any>(null);
  const [latestReadings, setLatestReadings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [deviceId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [deviceData, readings] = await Promise.all([
        devicesApi.getById(deviceId),
        telemetryApi.getLatest(deviceId).catch(() => []),
      ]);
      setDevice(deviceData);
      setLatestReadings(readings);
    } catch (error: any) {
      toast.error(error.message || t("failedToLoadDevice"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await devicesApi.delete(deviceId);
      toast.success(t("deviceDeleted"));
      router.push("/user/devices");
    } catch (error: any) {
      toast.error(error.message || t("failedToDeleteDevice"));
    }
  };

  const handleTogglePower = async () => {
    try {
      // This would call a command API
      toast.success(t("commandSent"));
      loadData();
    } catch (error: any) {
      toast.error(error.message || t("failedToSendCommand"));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">{t("deviceNotFound")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Device Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{device.name}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Cpu className="h-4 w-4" />
                <span>{device.type}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {device.status ? (
                <Badge className="bg-green-600 gap-1">
                  <Wifi className="h-3 w-3" />
                  {t("online")}
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <WifiOff className="h-3 w-3" />
                  {t("offline")}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Device Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Home className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t("home")}:</span>
                <span className="font-medium">
                  {device.home?.name || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t("room")}:</span>
                <span className="font-medium">
                  {device.room?.name || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t("paired")}:</span>
                <span className="font-medium">
                  {device.pairedAt
                    ? new Date(device.pairedAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t("lastSeen")}:</span>
                <span className="font-medium">
                  {device.lastSeenAt
                    ? new Date(device.lastSeenAt).toLocaleString()
                    : "N/A"}
                </span>
              </div>
              {device.mqttClientId && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{t("mqttId")}:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {device.mqttClientId}
                  </code>
                </div>
              )}
              {device.deviceKey && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {t("deviceKey")}:
                  </span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {device.deviceKey.substring(0, 8)}...
                  </code>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTogglePower}
              className="gap-2"
            >
              {device.status ? (
                <>
                  <PowerOff className="h-4 w-4" />
                  {t("turnOff")}
                </>
              ) : (
                <>
                  <Power className="h-4 w-4" />
                  {t("turnOn")}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/user/devices/${deviceId}/edit`)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              {t("edit")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="gap-2 text-red-600 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              {t("delete")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Latest Sensor Readings */}
      {latestReadings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("latestReadings")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {latestReadings.map((reading, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-card space-y-1"
                >
                  <div className="text-sm text-muted-foreground capitalize">
                    {reading.metric.replace(/_/g, " ")}
                  </div>
                  <div className="text-2xl font-bold">
                    {reading.valueBool !== undefined
                      ? reading.valueBool
                        ? t("yes")
                        : t("no")
                      : reading.valueNum?.toFixed(2) || "N/A"}
                    {reading.unit && ` ${reading.unit}`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(reading.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Capabilities */}
      {device.capabilities && (
        <Card>
          <CardHeader>
            <CardTitle>{t("capabilities")}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
              {JSON.stringify(device.capabilities, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDevice")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDeviceConfirmation")} "{device.name}"?{" "}
              {t("deleteDeviceWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
