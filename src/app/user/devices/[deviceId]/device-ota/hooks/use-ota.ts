"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";
import {
  otaApi,
  type FirmwareRelease,
  type OtaJob,
} from "@/lib/api/services/ota";

export function useOta(deviceId: number) {
  const { t } = useTranslation();
  const [releases, setReleases] = useState<FirmwareRelease[]>([]);
  const [jobs, setJobs] = useState<OtaJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRelease, setSelectedRelease] =
    useState<FirmwareRelease | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  const loadJobs = useCallback(async () => {
    try {
      const jobsData = await otaApi.listJobs(deviceId);
      setJobs(jobsData);
    } catch {
      // silently fail on background refresh
    }
  }, [deviceId]);

  const loadData = useCallback(async () => {
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
  }, [deviceId, t]);

  const handleSelectRelease = (release: FirmwareRelease) => {
    setSelectedRelease(release);
    setUpdateDialogOpen(true);
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

  // Initial load + background job refresh every 5s
  useEffect(() => {
    loadData();
    const interval = setInterval(loadJobs, 5_000);
    return () => clearInterval(interval);
  }, [loadData, loadJobs]);

  return {
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
  };
}
