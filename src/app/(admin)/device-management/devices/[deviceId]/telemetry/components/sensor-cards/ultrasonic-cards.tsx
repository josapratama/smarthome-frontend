"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Droplet, TrendingUp } from "lucide-react";
import type { TelemetryDTO } from "@/lib/api/dto/telemetry.dto";
import { useTranslation } from "@/hooks/use-translation";
import { formatValue } from "../../lib/format";

export function UltrasonicCards({ data }: { data: TelemetryDTO }) {
  const { t } = useTranslation();
  const level = data.binLevel ?? 0;
  const statusColor =
    level > 80
      ? "text-red-600"
      : level > 50
        ? "text-orange-600"
        : "text-green-600";
  const statusLabel =
    level > 80 ? t("full") : level > 50 ? t("half") : t("empty");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="rounded-2xl shadow-sm border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            {t("distance")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">
            {formatValue(data.distanceCm, "cm")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("ultrasonicSensor")}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Droplet className="h-4 w-4 text-green-600" />
            {t("fillLevel")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600">{level}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("containerLevel")}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm border-l-4 border-l-orange-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-600" />
            {t("status")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-3xl font-bold ${statusColor}`}>{statusLabel}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {level > 80 ? t("needsEmptying") : t("normal")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
