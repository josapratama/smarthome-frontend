"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetchBrowser } from "@/lib/api/client.browser";
import type { OtaJobDTO } from "@/lib/api/dto/ota.dto";
import { useLanguage } from "@/contexts/language-context";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

function fmtDateTime(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
}

function getStatusColor(status: string) {
  switch (status) {
    case "APPLIED":
      return "bg-green-100 text-green-800";
    case "FAILED":
    case "TIMEOUT":
      return "bg-red-100 text-red-800";
    case "DOWNLOADING":
    case "SENT":
      return "bg-blue-100 text-blue-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function OtaJobDetailClient({ jobId }: { jobId: number }) {
  const { t } = useLanguage();

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
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/ota">
            <ArrowLeft className="h-4 w-4" />
            {t("backToOta")}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {t("otaJobDetails")} #{jobId}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("otaJobDescription")}
          </p>
        </div>
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
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {t("status")}
                  </div>
                  <Badge className={getStatusColor(q.data.status)}>
                    {q.data.status}
                  </Badge>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {t("progress")}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${q.data.progress ?? 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {q.data.progress ?? 0}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {t("deviceId")}
                  </div>
                  <div className="text-sm">{q.data.deviceId}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {t("firmwareReleaseId")}
                  </div>
                  <div className="text-sm">{q.data.firmwareReleaseId}</div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {t("startedAt")}
                  </div>
                  <div className="text-sm">{fmtDateTime(q.data.sentAt)}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {t("completedAt")}
                  </div>
                  <div className="text-sm">
                    {fmtDateTime(q.data.appliedAt || q.data.failedAt)}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t("createdAt")}
                </div>
                <div className="text-sm">{fmtDateTime(q.data.createdAt)}</div>
              </div>

              {q.data.lastError && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {t("errorMessage")}
                  </div>
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded border">
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
