"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import type { TelemetryStats } from "@/lib/api/services/telemetry";

interface TelemetryStatsProps {
  stats: TelemetryStats[];
}

export function TelemetryStatsGrid({ stats }: TelemetryStatsProps) {
  const { t } = useTranslation();

  if (stats.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground capitalize">
              {(stat.metric ?? "").replace(/_/g, " ")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">
                {t("average")}
              </span>
              <span className="text-lg font-bold">
                {stat.avg.toFixed(2)}
                {stat.unit && ` ${stat.unit}`}
              </span>
            </div>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-xs text-muted-foreground">{t("min")}</span>
              <span>
                {stat.min.toFixed(2)}
                {stat.unit && ` ${stat.unit}`}
              </span>
            </div>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-xs text-muted-foreground">{t("max")}</span>
              <span>
                {stat.max.toFixed(2)}
                {stat.unit && ` ${stat.unit}`}
              </span>
            </div>
            <div className="text-xs text-muted-foreground pt-2 border-t">
              {stat.count} {t("readings")}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
