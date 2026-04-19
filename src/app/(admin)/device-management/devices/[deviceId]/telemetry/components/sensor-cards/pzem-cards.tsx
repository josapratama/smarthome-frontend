"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Activity, TrendingUp } from "lucide-react";
import type { TelemetryDTO } from "@/lib/api/dto/telemetry.dto";
import { useTranslation } from "@/hooks/use-translation";
import { formatValue } from "../../lib/format";

export function PzemCards({ data }: { data: TelemetryDTO }) {
  const { t } = useTranslation();

  const items = [
    {
      label: t("voltage"),
      value: formatValue(data.voltageV, "V"),
      sub: t("normalVoltage"),
      color: "blue",
      icon: Zap,
    },
    {
      label: t("current"),
      value: formatValue(data.currentA, "A", 3),
      sub: t("ampere"),
      color: "orange",
      icon: Activity,
    },
    {
      label: t("power"),
      value: formatValue(data.powerW, "W"),
      sub: t("watt"),
      color: "green",
      icon: TrendingUp,
    },
    {
      label: t("energy"),
      value: formatValue(data.energyKwh, "kWh", 3),
      sub: t("kilowattHour"),
      color: "purple",
      icon: Zap,
    },
    {
      label: t("frequency"),
      value: formatValue(data.frequencyHz, "Hz", 1),
      sub: t("normalFrequency"),
      color: "cyan",
      icon: Activity,
    },
    {
      label: t("powerFactor"),
      value: data.powerFactor?.toFixed(2) ?? "-",
      sub: t("efficiency"),
      color: "indigo",
      icon: TrendingUp,
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(({ label, value, sub, color, icon: Icon }) => (
        <Card
          key={label}
          className={`rounded-2xl shadow-sm border-l-4 border-l-${color}-500`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Icon className={`h-4 w-4 text-${color}-600`} />
              {label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
