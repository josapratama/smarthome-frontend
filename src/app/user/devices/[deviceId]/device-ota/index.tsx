"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, RefreshCw } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useOta } from "./hooks/use-ota";
import { FirmwareReleases } from "./components/firmware-releases";
import { OtaJobCard } from "./components/ota-job-card";
import { UpdateConfirmDialog } from "./components/update-confirm-dialog";

interface DeviceOTAProps {
  deviceId: number;
}

export default function DeviceOTA({ deviceId }: DeviceOTAProps) {
  const { t } = useTranslation();
  const {
    releases,
    jobs,
    isLoading,
    selectedRelease,
    updateDialogOpen,
    setUpdateDialogOpen,
    loadData,
    handleSelectRelease,
    handleTriggerUpdate,
    handleRetry,
    handleCancel,
  } = useOta(deviceId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FirmwareReleases releases={releases} onSelect={handleSelectRelease} />

      {/* OTA Jobs History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("updateHistory")}</CardTitle>
            <Button size="icon" variant="outline" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Download className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t("noUpdateHistory")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <OtaJobCard
                  key={job.id}
                  job={job}
                  onRetry={handleRetry}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <UpdateConfirmDialog
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        release={selectedRelease}
        onConfirm={handleTriggerUpdate}
      />
    </div>
  );
}
