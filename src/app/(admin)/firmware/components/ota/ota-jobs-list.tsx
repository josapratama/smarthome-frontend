import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Zap } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import type { OtaJobDTO } from "@/lib/api/dto/ota.dto";

interface OtaJobsListProps {
  jobs: OtaJobDTO[];
  deviceId: number | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
}

export function OtaJobsList({
  jobs,
  deviceId,
  isLoading,
  isFetching,
  error,
}: OtaJobsListProps) {
  const { t } = useTranslation();

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>{t("jobs")}</CardTitle>
        <Badge variant={isFetching ? "default" : "outline"}>
          {isFetching ? t("updating") : t("idle")}
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
        ) : isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            {error.message}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{t("noJobsYet")}</p>
          </div>
        ) : (
          <div className="divide-y rounded-xl border">
            {jobs.map((j) => (
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
                  <p className="text-xs text-muted-foreground">
                    {t("device")} #{j.deviceId} • {t("release")} #
                    {j.firmwareReleaseId}
                  </p>
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
  );
}
