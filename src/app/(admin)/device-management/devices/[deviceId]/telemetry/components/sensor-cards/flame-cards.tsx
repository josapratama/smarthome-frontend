"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Activity, TrendingUp } from "lucide-react";
import type { TelemetryDTO } from "@/lib/api/dto/telemetry.dto";
import { useTranslation } from "@/hooks/use-translation";

export function FlameCards({ data }: { data: TelemetryDTO }) {
  const { t } = useTranslation();
  const detected = data.flame === true;
  const intensity = (data as any).flameIntensity ?? 0;
  const analog = (data as any).analogValue ?? 0;
  const digital = (data as any).digitalValue ?? false;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="rounded-2xl shadow-sm border-l-4 border-l-red-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Flame className="h-4 w-4 text-red-600" />
            {t("flameDetection")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`text-3xl font-bold ${detected ? "text-red-600 animate-pulse" : "text-green-600"}`}
          >
            {detected ? `🔥 ${t("detected")}` : `✓ ${t("clear")}`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("irFlameSensor")}
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
            className={`text-3xl font-bold ${detected ? "text-red-600" : "text-green-600"}`}
          >
            {detected ? `🚨 ${t("alarm")}` : `✓ ${t("safe")}`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("fireDetectionSystem")}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm border-l-4 border-l-yellow-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-yellow-600" />
            {t("flameIntensity")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-yellow-600">
            {intensity.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("analog")}: {analog} / {t("digital")}:{" "}
            {digital ? t("flame") : t("clear")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
