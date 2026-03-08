"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Upload,
  Package,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { otaApi, FirmwareRelease, OtaJob, OtaJobStatus } from "@/lib/api/ota";
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

interface DeviceOTAProps {
  deviceId: number;
}

export default function DeviceOTA({ deviceId }: DeviceOTAProps) {
  const { t } = useTranslation();
  const [releases, setReleases] = useState<FirmwareRelease[]>([]);
  const [jobs, setJobs] = useState<OtaJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRelease, setSelectedRelease] =
    useState<FirmwareRelease | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadJobs, 5000); // Refresh jobs every 5s
    return () => clearInterval(interval);
  }, [deviceId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [releasesData, jobsData] = await Promise.all([
        otaApi.listReleases(),
        otaApi.listJobs(deviceId),
      ]);
      setReleases(releasesData);
      setJobs(jobsData);
    } catch (error: any) {
      toast.error(error.message || t("failedToLoadOTAData"));
    } finally {
      setIsLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const jobsData = await otaApi.listJobs(deviceId);
      setJobs(jobsData);
    } catch (error) {
      console.error("Failed to refresh jobs:", error);
    }
  };

  const handleTriggerUpdate = async () => {
    if (!selectedRelease) return;

    try {
      await otaApi.triggerUpdate(deviceId, selectedRelease.id);
      toast.success(t("otaUpdateTriggered"));
      setUpdateDialogOpen(false);
      setSelectedRelease(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || t("failedToTriggerUpdate"));
    }
  };

  const handleRetry = async (jobId: number) => {
    try {
      await otaApi.retryJob(deviceId, jobId);
      toast.success(t("otaJobRetried"));
      loadData();
    } catch (error: any) {
      toast.error(error.message || t("failedToRetryJob"));
    }
  };

  const handleCancel = async (jobId: number) => {
    try {
      await otaApi.cancelJob(deviceId, jobId);
      toast.success(t("otaJobCancelled"));
      loadData();
    } catch (error: any) {
      toast.error(error.message || t("failedToCancelJob"));
    }
  };

  const getStatusIcon = (status: OtaJobStatus) => {
    switch (status) {
      case "APPLIED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "FAILED":
      case "TIMEOUT":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "DOWNLOADING":
        return <Download className="h-4 w-4 text-blue-500 animate-pulse" />;
      case "SENT":
        return <Upload className="h-4 w-4 text-blue-500" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: OtaJobStatus) => {
    const variants: Record<OtaJobStatus, any> = {
      APPLIED: "default",
      FAILED: "destructive",
      TIMEOUT: "destructive",
      DOWNLOADING: "secondary",
      SENT: "secondary",
      PENDING: "outline",
    };

    return (
      <Badge variant={variants[status] || "outline"} className="gap-1">
        {getStatusIcon(status)}
        {t(status.toLowerCase())}
      </Badge>
    );
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

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
      {/* Available Firmware Releases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t("availableFirmware")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {releases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t("noFirmwareAvailable")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {releases.map((release) => (
                <div
                  key={release.id}
                  className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{release.version}</span>
                      <Badge variant="outline">{release.platform}</Badge>
                    </div>
                    {release.notes && (
                      <p className="text-sm text-muted-foreground">
                        {release.notes}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{formatBytes(release.sizeBytes)}</span>
                      <span>
                        {new Date(release.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedRelease(release);
                      setUpdateDialogOpen(true);
                    }}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {t("update")}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
                <div key={job.id} className="p-4 rounded-lg border space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {job.release?.version || `Release #${job.releaseId}`}
                        </span>
                        {getStatusBadge(job.status)}
                      </div>
                      {job.release && (
                        <p className="text-sm text-muted-foreground">
                          {job.release.platform} •{" "}
                          {formatBytes(job.release.sizeBytes)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {(job.status === "FAILED" ||
                        job.status === "TIMEOUT") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetry(job.id)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          {t("retry")}
                        </Button>
                      )}
                      {(job.status === "PENDING" || job.status === "SENT") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancel(job.id)}
                        >
                          {t("cancel")}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {job.status === "DOWNLOADING" &&
                    job.progress !== undefined && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {t("downloading")}
                          </span>
                          <span className="font-medium">{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} />
                      </div>
                    )}

                  {/* Timestamps */}
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>
                      {t("created")}: {new Date(job.createdAt).toLocaleString()}
                    </span>
                    {job.sentAt && (
                      <span>
                        {t("sent")}: {new Date(job.sentAt).toLocaleString()}
                      </span>
                    )}
                    {job.appliedAt && (
                      <span>
                        {t("applied")}:{" "}
                        {new Date(job.appliedAt).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Error Message */}
                  {job.lastError && (
                    <p className="text-sm text-red-500">
                      {t("error")}: {job.lastError}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Confirmation Dialog */}
      <AlertDialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmFirmwareUpdate")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("firmwareUpdateWarning")}
              {selectedRelease && (
                <div className="mt-4 p-3 bg-muted rounded space-y-1">
                  <div>
                    <strong>{t("version")}:</strong> {selectedRelease.version}
                  </div>
                  <div>
                    <strong>{t("platform")}:</strong> {selectedRelease.platform}
                  </div>
                  <div>
                    <strong>{t("size")}:</strong>{" "}
                    {formatBytes(selectedRelease.sizeBytes)}
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleTriggerUpdate}>
              {t("update")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
