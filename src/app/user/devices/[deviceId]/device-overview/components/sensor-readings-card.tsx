"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import type { SensorReading } from "@/lib/api/services/telemetry";

interface SensorReadingsCardProps {
  readings: SensorReading[];
}

export function SensorReadingsCard({ readings }: SensorReadingsCardProps) {
  const { t } = useTranslation();

  if (readings.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {t("recentTelemetry") || "Pembacaan Terkini"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {readings.map((reading, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border bg-card space-y-0.5"
            >
              <div className="text-xs text-muted-foreground capitalize truncate">
                {(reading.metric ?? "").replace(/_/g, " ")}
              </div>
              <div className="text-lg font-bold leading-tight">
                {reading.valueBool !== undefined && reading.valueBool !== null
                  ? reading.valueBool
                    ? t("yes") || "Ya"
                    : t("no") || "Tidak"
                  : (reading.valueNum?.toFixed(2) ?? "N/A")}
                {reading.unit && (
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    {reading.unit}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(reading.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
