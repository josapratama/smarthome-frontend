import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Droplets, Wind, Gauge } from "lucide-react";
import type { TelemetryDTO } from "@/lib/api/dto/telemetry.dto";
import { useTranslation } from "@/hooks/use-translation";

function formatValue(
  value: number | null | undefined,
  unit: string,
  decimals: number = 2,
) {
  if (value === null || value === undefined) return "-";
  return `${value.toFixed(decimals)} ${unit}`;
}

// DHT11/DHT22 Temperature & Humidity Sensor Cards
export function TemperatureHumidityCards({ data }: { data: TelemetryDTO }) {
  const { t } = useTranslation();
  const temperature = data.temperatureC;
  const humidity = data.humidityPercent;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Temperature */}
      {temperature !== null && (
        <Card className="rounded-2xl shadow-sm border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-red-600" />
              {t("temperature")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {formatValue(temperature, "°C", 1)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {temperature > 30
                ? t("hot")
                : temperature > 20
                  ? t("warm")
                  : temperature > 10
                    ? t("cool")
                    : t("cold")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Humidity */}
      {humidity !== null && (
        <Card className="rounded-2xl shadow-sm border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-600" />
              {t("humidity")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {formatValue(humidity, "%", 1)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {humidity > 70
                ? t("humid")
                : humidity > 40
                  ? t("comfortable")
                  : t("dry")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Heat Index (if available) */}
      {temperature !== null && humidity !== null && (
        <Card className="rounded-2xl shadow-sm border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gauge className="h-4 w-4 text-orange-600" />
              {t("heatIndex")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              {formatValue(temperature + humidity * 0.1, "°C", 1)}
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

// BMP180/BMP280 Pressure Sensor Cards
export function PressureCards({ data }: { data: TelemetryDTO }) {
  const { t } = useTranslation();
  const pressure = data.pressureHpa;
  const altitude = data.altitudeM;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Pressure */}
      {pressure !== null && (
        <Card className="rounded-2xl shadow-sm border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gauge className="h-4 w-4 text-purple-600" />
              {t("pressure")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {formatValue(pressure, "hPa", 1)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {pressure > 1013
                ? t("highPressure")
                : pressure > 1000
                  ? t("normalPressure")
                  : t("lowPressure")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Altitude */}
      {altitude !== null && (
        <Card className="rounded-2xl shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wind className="h-4 w-4 text-green-600" />
              {t("altitude")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {formatValue(altitude, "m", 0)}
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

// Soil Moisture Sensor Cards
export function SoilMoistureCards({ data }: { data: TelemetryDTO }) {
  const { t } = useTranslation();
  const moisture = data.soilMoisturePercent;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Soil Moisture */}
      {moisture !== null && (
        <Card className="rounded-2xl shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Droplets className="h-4 w-4 text-green-600" />
              {t("soilMoisture")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {formatValue(moisture, "%", 1)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {moisture > 70
                ? t("wet")
                : moisture > 40
                  ? t("moist")
                  : moisture > 20
                    ? t("dry")
                    : t("veryDry")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Light Sensor (LDR) Cards
export function LightSensorCards({ data }: { data: TelemetryDTO }) {
  const { t } = useTranslation();
  const lightLevel = data.lightLux;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Light Level */}
      {lightLevel !== null && (
        <Card className="rounded-2xl shadow-sm border-l-4 border-l-yellow-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-yellow-600" />
              {t("lightLevel")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">
              {formatValue(lightLevel, "lux", 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {lightLevel > 1000
                ? t("bright")
                : lightLevel > 100
                  ? t("moderate")
                  : t("dark")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
