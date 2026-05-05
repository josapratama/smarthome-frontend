"use client";

import { useTranslation } from "@/hooks/use-translation";
import type { SensorReading } from "@/lib/api/services/telemetry";

interface TelemetryTableProps {
  readings: SensorReading[];
}

export function TelemetryTable({ readings }: TelemetryTableProps) {
  const { t } = useTranslation();

  if (readings.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {t("showing")} {readings.length} {t("readings")}
      </p>
      <div className="max-h-96 overflow-y-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-muted sticky top-0">
            <tr>
              <th className="text-left p-2">{t("timestamp")}</th>
              <th className="text-left p-2">{t("metric")}</th>
              <th className="text-right p-2">{t("value")}</th>
              <th className="text-left p-2">{t("unit")}</th>
            </tr>
          </thead>
          <tbody>
            {readings.map((reading, index) => (
              <tr key={index} className="border-t hover:bg-muted/50">
                <td className="p-2">
                  {new Date(reading.timestamp).toLocaleString()}
                </td>
                <td className="p-2 capitalize">
                  {(reading.metric ?? "").replace(/_/g, " ")}
                </td>
                <td className="p-2 text-right font-mono">
                  {reading.valueBool !== undefined
                    ? reading.valueBool
                      ? t("true")
                      : t("false")
                    : (reading.valueNum?.toFixed(2) ?? "N/A")}
                </td>
                <td className="p-2">{reading.unit || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
