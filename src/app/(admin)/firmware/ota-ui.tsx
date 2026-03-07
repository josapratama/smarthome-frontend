"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client.browser";
import type { DeviceDTO } from "@/lib/api/dto/devices.dto";
import type { OtaJobDTO } from "@/lib/api/dto/ota.dto";
import { useTranslation } from "@/hooks/use-translation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, Clock, Activity, CheckCircle } from "lucide-react";

function statusBadge(online?: boolean | null, t?: any) {
  if (online === true) return <Badge>{t?.("online") || "Online"}</Badge>;
  if (online === false)
    return <Badge variant="secondary">{t?.("offline") || "Offline"}</Badge>;
  return <Badge variant="outline">{t?.("unknown") || "Unknown"}</Badge>;
}

function fmtLastSeen(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString();
}

export default function OtaClientPage({
  initialDeviceId,
}: {
  initialDeviceId?: number;
}) {
  const router = useRouter();
  const qc = useQueryClient();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [deviceId, setDeviceId] = React.useState<number | undefined>(
    initialDeviceId,
  );
  const [releaseId, setReleaseId] = React.useState<number | undefined>(
    undefined,
  );

  const devicesQ = useQuery({
    queryKey: qk.devices.list(),
    queryFn: async () => {
      const payload = await apiFetchBrowser<{ data: DeviceDTO[] }>(
        "/api/v1/devices",
      );
      return payload.data ?? [];
    },
    refetchInterval: 5_000, // device status polling
  });

  const releasesQ = useQuery({
    queryKey: qk.firmware.releases(),
    queryFn: async () => {
      const payload = await apiFetchBrowser<{ data: any[] }>(
        "/api/v1/firmware/releases",
      );
      return payload.data ?? [];
    },
  });

  const jobsQ = useQuery({
    queryKey: deviceId
      ? qk.ota.deviceJobs(deviceId)
      : ["ota", "device-jobs", "none"],
    queryFn: async () => {
      if (!deviceId) return [];
      const payload = await apiFetchBrowser<{ data: OtaJobDTO[] }>(
        `/api/v1/ota/devices/${deviceId}/jobs`,
      );
      return payload.data ?? [];
    },
    enabled: !!deviceId,
    refetchInterval: 3_000,
  });

  const triggerM = useMutation({
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
        await qc.invalidateQueries({ queryKey: qk.ota.deviceJobs(deviceId) });
      }
      toast({ title: t("otaTriggered") });
    },
    onError: (error: any) => {
      toast({
        title: t("failedTriggerOta"),
        description: error.message || t("unknownError"),
        variant: "destructive",
      });
    },
  });

  // keep URL in sync
  React.useEffect(() => {
    if (!deviceId) return;
    router.replace(`/firmware?deviceId=${deviceId}`);
  }, [deviceId, router]);

  React.useEffect(() => {
    const handleRefresh = () => {
      if (deviceId) {
        qc.invalidateQueries({ queryKey: qk.ota.deviceJobs(deviceId) });
      }
      devicesQ.refetch();
      releasesQ.refetch();
    };

    window.addEventListener("topbar-refresh", handleRefresh);

    return () => {
      window.removeEventListener("topbar-refresh", handleRefresh);
    };
  }, [deviceId, qc, devicesQ, releasesQ]);

  const selectedDevice = devicesQ.data?.find((d) => d.id === deviceId);

  const stats = {
    totalJobs: jobsQ.data?.length || 0,
    pending: jobsQ.data?.filter((j) => j.status === "PENDING").length || 0,
    inProgress:
      jobsQ.data?.filter((j) => j.status === "IN_PROGRESS").length || 0,
    completed: jobsQ.data?.filter((j) => j.status === "COMPLETED").length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("totalJobs")}
                </p>
                <p className="text-2xl font-bold">{stats.totalJobs}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("pending")}</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("inProgress")}
                </p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("completed")}
                </p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>{t("triggerOta")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm font-medium">{t("device")}</div>
              {devicesQ.isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={deviceId ? String(deviceId) : ""}
                  onValueChange={(v) => setDeviceId(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectDevice")} />
                  </SelectTrigger>
                  <SelectContent>
                    {(devicesQ.data ?? []).map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        #{d.id} {d.deviceName ? `- ${d.deviceName}` : ""} (
                        {d.mqttClientId ?? "no-mqtt"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {selectedDevice ? (
                <div className="flex items-center gap-2 text-xs">
                  {statusBadge(selectedDevice.status, t)}
                  <span className="text-muted-foreground">
                    {t("lastSeen")}: {fmtLastSeen(selectedDevice.lastSeenAt)}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">{t("release")}</div>
              {releasesQ.isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={releaseId ? String(releaseId) : ""}
                  onValueChange={(v) => setReleaseId(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectFirmware")} />
                  </SelectTrigger>
                  <SelectContent>
                    {(releasesQ.data ?? []).map((r: any) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.version} ({r.platform})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex items-end">
              <Button
                className="w-full"
                disabled={triggerM.isPending || !deviceId || !releaseId}
                onClick={() => triggerM.mutate()}
              >
                {triggerM.isPending ? t("triggering") : t("triggerOta")}
              </Button>
            </div>
          </div>

          {triggerM.error ? (
            <div className="text-sm text-destructive rounded-lg bg-destructive/10 p-3">
              {(triggerM.error as Error).message}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>{t("jobs")}</CardTitle>
          <Badge variant={jobsQ.isFetching ? "default" : "outline"}>
            {jobsQ.isFetching ? t("updating") : t("idle")}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {!deviceId ? (
            <div className="text-center py-8">
              <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("selectDeviceToViewJobs")}
              </p>
            </div>
          ) : jobsQ.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : jobsQ.error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              {(jobsQ.error as Error).message}
            </div>
          ) : (jobsQ.data ?? []).length === 0 ? (
            <div className="text-center py-8">
              <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{t("noJobsYet")}</p>
            </div>
          ) : (
            <div className="divide-y rounded-xl border">
              {(jobsQ.data ?? []).map((j) => (
                <div
                  key={j.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium">
                        {t("job")} #{j.id}
                      </span>
                      <Badge variant="secondary">{j.status}</Badge>
                      {typeof j.progress === "number" && (
                        <Badge variant="outline" className="text-xs">
                          {j.progress}%
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("device")} #{j.deviceId} • {t("release")} #
                      {j.firmwareReleaseId}
                    </div>
                  </div>

                  <Link href={`/firmware/jobs/${j.id}`}>
                    <Button variant="outline" size="sm">
                      {t("view")}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
