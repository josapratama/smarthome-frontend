"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/use-translation";
import { useDeviceOverview } from "./hooks/use-device-overview";
import { DeviceInfoCard } from "./components/device-info-card";
import { SensorReadingsCard } from "./components/sensor-readings-card";
import { DeleteDeviceDialog } from "./components/delete-device-dialog";

interface DeviceOverviewProps {
  deviceId: number;
}

export default function DeviceOverview({ deviceId }: DeviceOverviewProps) {
  const { t } = useTranslation();
  const {
    device,
    latestReadings,
    isLoading,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleDelete,
    handleTogglePower,
  } = useDeviceOverview(deviceId);

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
      <DeviceInfoCard
        device={device}
        deviceId={deviceId}
        onTogglePower={handleTogglePower}
        onDeleteClick={() => setDeleteDialogOpen(true)}
      />

      <SensorReadingsCard readings={latestReadings} />

      <DeleteDeviceDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        deviceName={device.name}
        onConfirm={handleDelete}
      />
    </div>
  );
}
