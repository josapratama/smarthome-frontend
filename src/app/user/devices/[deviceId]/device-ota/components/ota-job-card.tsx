"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { OtaJobStatusBadge } from "./ota-job-status-badge";
import { formatBytes } from "./firmware-releases";
import type { OtaJob } from "@/lib/api/services/ota";

interface OtaJobCardProps {
  job: OtaJob;
  onRetry: (jobId: number) => void;
  onCancel: (jobId: number) => void;
}

export function OtaJobCard({ job, onRetry, onCancel }: OtaJobCardProps) {
  const { t } = useTranslation();
  const canRetry = job.status === "FAILED" || job.status === "TIMEOUT";
  const canCancel = job.status === "PENDING" || job.status === "SENT";

  return (
    <div className="p-4 rounded-lg border space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {job.release?.version ?? `Release #${job.releaseId}`}
            </span>
            <OtaJobStatusBadge status={job.status} />
          </div>
          {job.release && (
            <p className="text-sm text-muted-foreground">
              {job.release.platform} • {formatBytes(job.release.sizeBytes)}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {canRetry && (
            <Button size="sm" variant="outline" onClick={() => onRetry(job.id)}>
              <RefreshCw className="h-3 w-3 mr-1" />
              {t("retry")}
            </Button>
          )}
          {canCancel && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCancel(job.id)}
            >
              {t("cancel")}
            </Button>
          )}
        </div>
      </div>

      {/* Download progress */}
      {job.status === "DOWNLOADING" && job.progress !== undefined && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("downloading")}</span>
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
            {t("applied")}: {new Date(job.appliedAt).toLocaleString()}
          </span>
        )}
      </div>

      {/* Error */}
      {job.lastError && (
        <p className="text-sm text-red-500">
          {t("error")}: {job.lastError}
        </p>
      )}
    </div>
  );
}
