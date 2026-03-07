"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetchBrowser } from "@/lib/api/client.browser";
import type { OtaJobDTO } from "@/lib/api/dto/ota.dto";
import { useTranslation } from "@/hooks/use-translation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, Zap, Clock, CheckCircle, XCircle } from "lucide-react";

function fmtDateTime(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
}

function getStatusColor(status: string) {
  switch (status) {
    case "COMPLETED":
    case "APPLIED":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "FAILED":
    case "TIMEOUT":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "IN_PROGRESS":
    case "DOWNLOADING":
    case "SENT":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "COMPLETED":
    case "APPLIED":
      return <CheckCircle className="h-4 w-4" />;
    case "FAILED":
    case "TIMEOUT":
      return <XCircle className="h-4 w-4" />;
    case "IN_PROGRESS":
    case "DOWNLOADING":
    case "SENT":
      return <Zap className="h-4 w-4" />;
    case "PENDING":
      return <Clock className="h-4 w-4" />;
    default:
      return null;
  }
}

export function OtaJobDetailClient({ jobId }: { jobId: number }) {
  const { t } = useTranslation();
  const router = useRouter();

  const q = useQuery({
    queryKey: ["ota", "job", jobId],
    queryFn: async () => {
      const payload = await apiFetchBrowser<{ data: OtaJobDTO }>(
        `/api/v1/ota/jobs/${jobId}`,
      );
      return payload.data;
    },
    refetchInterval: 3_000, // Refresh every 3 seconds for progress updates
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => router.push("/firmware")}
          className="hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Home className="h-4 w-4" />
          {t("firmware")}
        </button>
        <span>/</span>
        <span className="text-foreground font-medium">
          {t("job")} #{jobId}
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          {t("otaJobDetails")} #{jobId}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("otaJobDescription")}
        </p>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("jobDetails")}</CardTitle>
        </CardHeader>

        <CardContent>
          {q.isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          ) : q.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {(q.error as Error).message}
            </div>
          ) : !q.data ? (
            <div className="text-sm text-muted-foreground">
              {t("jobNotFound")}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status and Progress */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="rounded-xl">
                  <CardContent className="pt-6">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      {t("status")}
                    </div>
                    <Badge
                      className={`${getStatusColor(q.data.status)} flex items-center gap-1 w-fit`}
                    >
                      {getStatusIcon(q.data.status)}
                      {q.data.status}
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="rounded-xl">
                  <CardContent className="pt-6">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      {t("progress")}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${q.data.progress ?? 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold min-w-[3rem] text-right">
                        {q.data.progress ?? 0}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Device and Firmware Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    {t("deviceId")}
                  </div>
                  <div className="text-base font-mono">#{q.data.deviceId}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    {t("firmwareReleaseId")}
                  </div>
                  <div className="text-base font-mono">
                    #{q.data.firmwareReleaseId}
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    {t("startedAt")}
                  </div>
                  <div className="text-sm">{fmtDateTime(q.data.sentAt)}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    {t("completedAt")}
                  </div>
                  <div className="text-sm">
                    {fmtDateTime(q.data.appliedAt || q.data.failedAt)}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  {t("createdAt")}
                </div>
                <div className="text-sm">{fmtDateTime(q.data.createdAt)}</div>
              </div>

              {/* Error Message */}
              {q.data.lastError && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    {t("errorMessage")}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                    {q.data.lastError}
                  </div>
                </div>
              )}
            </div>
          )}

          {q.isFetching && !q.isLoading ? (
            <div className="mt-3 text-xs text-muted-foreground">
              {t("updating")}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
