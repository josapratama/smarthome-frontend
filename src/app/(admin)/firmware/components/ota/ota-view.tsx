"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import type { DeviceDTO } from "@/lib/api/dto/devices.dto";
import type { OtaJobDTO } from "@/lib/api/dto/ota.dto";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";

import { OtaStats } from "./ota-stats";
import { OtaTriggerCard } from "./ota-trigger-card";
import { OtaJobsList } from "./ota-jobs-list";

interface OtaViewProps {
  initialDeviceId?: number;
}

export function OtaView({ initialDeviceId }: OtaViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [deviceId, setDeviceId] = useState<number | undefined>(initialDeviceId);
  const [releaseId, setReleaseId] = useState<number | undefined>(undefined);

  // ── Queries ───────────────────────────────────────────────
  const devicesQuery = useQuery({
    queryKey: qk.devices.list(),
    queryFn: async () => {
      const res = await apiFetchBrowser<{ data: DeviceDTO[] }>(
        "/api/v1/devices",
      );
      return res.data ?? [];
    },
    refetchInterval: 5_000,
  });

  const releasesQuery = useQuery({
    queryKey: qk.firmware.releases(),
    queryFn: async () => {
      const res = await apiFetchBrowser<{ data: any[] }>(
        "/api/v1/firmware/releases",
      );
      return res.data ?? [];
    },
  });

  const jobsQuery = useQuery({
    queryKey: deviceId ? qk.ota.deviceJobs(deviceId) : ["ota", "none"],
    queryFn: async () => {
      if (!deviceId) return [];
      const res = await apiFetchBrowser<{ data: OtaJobDTO[] }>(
        `/api/v1/ota/devices/${deviceId}/jobs`,
      );
      return res.data ?? [];
    },
    enabled: !!deviceId,
    refetchInterval: 3_000,
  });

  // ── Trigger mutation ──────────────────────────────────────
  const triggerMutation = useMutation({
    mutationFn: async () => {
      if (!deviceId || !releaseId)
        throw new Error(t("deviceAndReleaseRequired"));
      return apiFetchBrowser(`/api/v1/ota/devices/${deviceId}`, {
        method: "POST",
        body: JSON.stringify({ releaseId }),
      });
    },
    onSuccess: async () => {
      if (deviceId) {
        await queryClient.invalidateQueries({
          queryKey: qk.ota.deviceJobs(deviceId),
        });
      }
      toast({ title: t("otaTriggered") });
    },
    onError: (err: any) =>
      toast({
        title: t("failedTriggerOta"),
        description: err.message || t("unknownError"),
        variant: "destructive",
      }),
  });

  // ── Sync URL with deviceId ────────────────────────────────
  useEffect(() => {
    if (!deviceId) return;
    router.replace(`/firmware?deviceId=${deviceId}`);
  }, [deviceId, router]);

  // ── Topbar refresh ────────────────────────────────────────
  useEffect(() => {
    const onRefresh = () => {
      if (deviceId)
        queryClient.invalidateQueries({
          queryKey: qk.ota.deviceJobs(deviceId),
        });
      devicesQuery.refetch();
      releasesQuery.refetch();
    };
    window.addEventListener("topbar-refresh", onRefresh);
    return () => window.removeEventListener("topbar-refresh", onRefresh);
  }, [deviceId, queryClient, devicesQuery, releasesQuery]);

  const jobs = jobsQuery.data ?? [];
  const stats = {
    total: jobs.length,
    pending: jobs.filter((j) => j.status === "PENDING").length,
    inProgress: jobs.filter((j) => j.status === "IN_PROGRESS").length,
    completed: jobs.filter((j) => j.status === "COMPLETED").length,
  };

  return (
    <div className="space-y-6">
      <OtaStats {...stats} />

      <OtaTriggerCard
        devices={devicesQuery.data ?? []}
        releases={releasesQuery.data ?? []}
        deviceId={deviceId}
        releaseId={releaseId}
        selectedDevice={devicesQuery.data?.find((d) => d.id === deviceId)}
        isDevicesLoading={devicesQuery.isLoading}
        isReleasesLoading={releasesQuery.isLoading}
        isTriggering={triggerMutation.isPending}
        triggerError={triggerMutation.error as Error | null}
        onDeviceChange={setDeviceId}
        onReleaseChange={setReleaseId}
        onTrigger={() => triggerMutation.mutate()}
      />

      <OtaJobsList
        jobs={jobs}
        deviceId={deviceId}
        isLoading={jobsQuery.isLoading}
        isFetching={jobsQuery.isFetching}
        error={jobsQuery.error as Error | null}
      />
    </div>
  );
}
