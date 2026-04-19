"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export interface SensorReading {
  id: number;
  metric: string;
  valueNum: number | null;
  unit: string | null;
  timestamp: string;
}

interface EnergySensorCardProps {
  readings: SensorReading[];
}

export function EnergySensorCard({ readings }: EnergySensorCardProps) {
  const { t } = useTranslation();

  const PZEM_METRICS = [
    { metric: "voltage", label: t("pzemVoltage"), unit: "V", decimals: 1 },
    { metric: "current_a", label: t("pzemCurrent"), unit: "A", decimals: 3 },
    { metric: "power", label: t("pzemPower"), unit: "W", decimals: 1 },
    { metric: "energy", label: t("pzemEnergy"), unit: "kWh", decimals: 3 },
    { metric: "frequency", label: t("pzemFrequency"), unit: "Hz", decimals: 1 },
    {
      metric: "power_factor",
      label: t("pzemPowerFactor"),
      unit: "",
      decimals: 2,
    },
  ];

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Gauge className="h-4 w-4 text-orange-500" />
          {t("energySensorReadings")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {readings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("noSensorReadings")}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PZEM_METRICS.map(({ metric, label, unit, decimals }) => {
              const r = readings.find((s) => s.metric === metric);
              return (
                <div
                  key={metric}
                  className="rounded-xl border bg-muted/30 p-4 space-y-1"
                >
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold">
                    {r?.valueNum != null
                      ? `${r.valueNum.toFixed(decimals)} ${unit}`.trim()
                      : "—"}
                  </p>
                  {r?.timestamp && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.timestamp).toLocaleTimeString("id-ID")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
