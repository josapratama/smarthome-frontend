"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wind, Activity, TrendingUp } from "lucide-react";
import type { TelemetryDTO } from "@/lib/api/dto/telemetry.dto";
import { useTranslation } from "@/hooks/use-translation";
import { formatValue } from "../../lib/format";

export function Mq2Cards({ data }: { data: TelemetryDTO }) {
  const { t } = useTranslation();
  const ppm = data.gasPpm ?? 0;
  const isAlarm = ppm > 300;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="rounded-2xl shadow-sm border-l-4 border-l-red-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wind className="h-4 w-4 text-red-600" />
            {t("gasConcentration")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-600">
            {formatValue(data.gasPpm, "PPM", 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("partsPerMillion")}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm border-l-4 border-l-orange-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-600" />
            {t("alarmStatus")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`text-3xl font-bold ${isAlarm ? "text-red-600" : "text-green-600"}`}
          >
            {isAlarm ? t("alarm") : t("safe")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("threshold")}: 300 PPM
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            {t("analogReading")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">
            {data.gasPpm != null ? Math.round(data.gasPpm * 10) : "-"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("rawAdcValue")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
