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
      <CardHeader>
        <CardTitle>{t("latestReadings")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {readings.map((reading, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border bg-card space-y-1"
            >
              <div className="text-sm text-muted-foreground capitalize">
                {reading.metric.replace(/_/g, " ")}
              </div>
              <div className="text-2xl font-bold">
                {reading.valueBool !== undefined
                  ? reading.valueBool
                    ? t("yes")
                    : t("no")
                  : (reading.valueNum?.toFixed(2) ?? "N/A")}
                {reading.unit && ` ${reading.unit}`}
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
