"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Activity,
  Sun,
} from "lucide-react";
import type { TelemetryDTO } from "@/lib/api/dto/telemetry.dto";
import { useTranslation } from "@/hooks/use-translation";
import { formatValue } from "../../lib/format";

export function CurrentCards({ data }: { data: TelemetryDTO }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="rounded-2xl shadow-sm border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            {t("current")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">
            {formatValue(data.current, "A", 3)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{t("ampere")}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function TemperatureHumidityCards({ data }: { data: TelemetryDTO }) {
  const { t } = useTranslation();
  const temp = data.temperatureC;
  const hum = data.humidityPercent;

  const tempLabel =
    (temp ?? 0) > 30
      ? t("hot")
      : (temp ?? 0) > 20
        ? t("warm")
        : (temp ?? 0) > 10
          ? t("cool")
          : t("cold");
  const humLabel =
    (hum ?? 0) > 70
      ? t("humid")
      : (hum ?? 0) > 40
        ? t("comfortable")
        : t("dry");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {temp != null && (
        <Card className="rounded-2xl shadow-sm border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-red-600" />
              {t("temperature")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {formatValue(temp, "°C", 1)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{tempLabel}</p>
          </CardContent>
        </Card>
      )}
      {hum != null && (
        <Card className="rounded-2xl shadow-sm border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-600" />
              {t("humidity")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {formatValue(hum, "%", 1)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{humLabel}</p>
          </CardContent>
        </Card>
      )}
      {temp != null && hum != null && (
        <Card className="rounded-2xl shadow-sm border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gauge className="h-4 w-4 text-orange-600" />
              {t("heatIndex")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              {formatValue(temp + hum * 0.1, "°C", 1)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("feelsLike")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function PressureCards({ data }: { data: TelemetryDTO }) {
  const { t } = useTranslation();
  const p = data.pressureHpa;
  const alt = data.altitudeM;
  const pressureLabel =
    (p ?? 0) > 1013
      ? t("highPressure")
      : (p ?? 0) > 1000
        ? t("normalPressure")
        : t("lowPressure");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {p != null && (
        <Card className="rounded-2xl shadow-sm border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gauge className="h-4 w-4 text-purple-600" />
              {t("pressure")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {formatValue(p, "hPa", 1)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {pressureLabel}
            </p>
          </CardContent>
        </Card>
      )}
      {alt != null && (
        <Card className="rounded-2xl shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wind className="h-4 w-4 text-green-600" />
              {t("altitude")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {formatValue(alt, "m", 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("aboveSeaLevel")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function SoilMoistureCards({ data }: { data: TelemetryDTO }) {
  const { t } = useTranslation();
  const m = data.soilMoisturePercent;
  const label =
    (m ?? 0) > 70
      ? t("wet")
      : (m ?? 0) > 40
        ? t("moist")
        : (m ?? 0) > 20
          ? t("dry")
          : t("veryDry");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {m != null && (
        <Card className="rounded-2xl shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Droplets className="h-4 w-4 text-green-600" />
              {t("soilMoisture")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {formatValue(m, "%", 1)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function LightSensorCards({ data }: { data: TelemetryDTO }) {
  const { t } = useTranslation();
  const lux = data.lightLux;
  const label =
    (lux ?? 0) > 1000
      ? t("bright")
      : (lux ?? 0) > 100
        ? t("moderate")
        : t("dark");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {lux != null && (
        <Card className="rounded-2xl shadow-sm border-l-4 border-l-yellow-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sun className="h-4 w-4 text-yellow-600" />
              {t("lightLevel")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">
              {formatValue(lux, "lux", 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
