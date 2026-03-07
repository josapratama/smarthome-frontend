import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Activity, TrendingUp, Flame, Wind, Droplet } from "lucide-react";
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

// PZEM-004T Energy Monitor Cards
export function PZEMCards({ data }: { data: TelemetryDTO }) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Voltage */}
      <Card className="rounded-2xl shadow-sm border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-600" />
            {t("voltage")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">
            {formatValue(data.voltageV, "V")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("normalVoltage")}
          </p>
        </CardContent>
      </Card>

      {/* Current */}
      <Card className="rounded-2xl shadow-sm border-l-4 border-l-orange-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-600" />
            {t("current")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-orange-600">
            {formatValue(data.currentA, "A", 3)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{t("ampere")}</p>
        </CardContent>
      </Card>

      {/* Power */}
      <Card className="rounded-2xl shadow-sm border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            {t("power")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600">
            {formatValue(data.powerW, "W")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{t("watt")}</p>
        </CardContent>
      </Card>

      {/* Energy */}
      <Card className="rounded-2xl shadow-sm border-l-4 border-l-purple-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-600" />
            {t("energy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-purple-600">
            {formatValue(data.energyKwh, "kWh", 3)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("kilowattHour")}
          </p>
        </CardContent>
      </Card>

      {/* Frequency */}
      <Card className="rounded-2xl shadow-sm border-l-4 border-l-cyan-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-600" />
            {t("frequency")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-cyan-600">
            {formatValue(data.frequencyHz, "Hz", 1)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("normalFrequency")}
          </p>
        </CardContent>
      </Card>

      {/* Power Factor */}
      <Card className="rounded-2xl shadow-sm border-l-4 border-l-indigo-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
            {t("powerFactor")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-indigo-600">
            {data.powerFactor?.toFixed(2) || "-"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("efficiency")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// MQ-2 Gas Sensor Cards
export function MQ2Cards({ data }: { data: TelemetryDTO }) {
  const { t } = useTranslation();
  const hasGasData = data.gasPpm !== null && data.gasPpm !== undefined;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Gas PPM */}
      <Card className="rounded-2xl shadow-sm border-l-4 border-l-red-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wind className="h-4 w-4 text-red-600" />
            {t("gasConcentration")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-600">
            {formatValue(data.gasPpm, "PPM")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("partsPerMillion")}
          </p>
        </CardContent>
      </Card>

      {/* Gas Alarm Status */}
      <Card className="rounded-2xl shadow-sm border-l-4 border-l-orange-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-600" />
            {t("alarmStatus")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`text-3xl font-bold ${hasGasData && data.gasPpm! > 300 ? "text-red-600" : "text-green-600"}`}
          >
            {hasGasData && data.gasPpm! > 300 ? t("alarm") : t("safe")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("threshold")}: 300 PPM
          </p>
        </CardContent>
      </Card>

      {/* Analog Value */}
      <Card className="rounded-2xl shadow-sm border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            {t("analogReading")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">
            {data.gasPpm !== null ? Math.round(data.gasPpm * 10) : "-"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("rawAdcValue")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Flame Sensor Cards
export function FlameCards({ data }: { data: TelemetryDTO }) {
  const { t } = useTranslation();
  const flameDetected = data.flame || false;
  const analogValue = (data as any).analogValue || 0;
  const digitalValue = (data as any).digitalValue || false;
  const flameIntensity = (data as any).flameIntensity || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Flame Detection */}
      <Card className="rounded-2xl shadow-sm border-l-4 border-l-red-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Flame className="h-4 w-4 text-red-600" />
            {t("flameDetection")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`text-3xl font-bold ${flameDetected ? "text-red-600 animate-pulse" : "text-green-600"}`}
          >
            {flameDetected ? `🔥 ${t("detected")}` : `✓ ${t("clear")}`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("irFlameSensor")}
          </p>
        </CardContent>
      </Card>

      {/* Alarm Status */}
      <Card className="rounded-2xl shadow-sm border-l-4 border-l-orange-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-600" />
            {t("alarmStatus")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`text-3xl font-bold ${flameDetected ? "text-red-600" : "text-green-600"}`}
          >
            {flameDetected ? `🚨 ${t("alarm")}` : `✓ ${t("safe")}`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("fireDetectionSystem")}
          </p>
        </CardContent>
      </Card>

      {/* Flame Intensity */}
      <Card className="rounded-2xl shadow-sm border-l-4 border-l-yellow-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-yellow-600" />
            {t("flameIntensity")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-yellow-600">
            {flameIntensity.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("analog")}: {analogValue} / {t("digital")}:{" "}
            {digitalValue ? t("flame") : t("clear")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Ultrasonic Distance Sensor Cards
export function UltrasonicCards({ data }: { data: TelemetryDTO }) {
  const { t } = useTranslation();
  const hasDistance = data.distanceCm !== null && data.distanceCm !== undefined;
  const binLevel = data.binLevel || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Distance */}
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

      {/* Bin Level */}
      <Card className="rounded-2xl shadow-sm border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Droplet className="h-4 w-4 text-green-600" />
            {t("fillLevel")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600">{binLevel}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("containerLevel")}
          </p>
        </CardContent>
      </Card>

      {/* Status */}
      <Card className="rounded-2xl shadow-sm border-l-4 border-l-orange-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-600" />
            {t("status")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`text-3xl font-bold ${binLevel > 80 ? "text-red-600" : binLevel > 50 ? "text-orange-600" : "text-green-600"}`}
          >
            {binLevel > 80 ? t("full") : binLevel > 50 ? t("half") : t("empty")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {binLevel > 80 ? t("needsEmptying") : t("normal")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Generic Current Sensor Cards
export function CurrentCards({ data }: { data: TelemetryDTO }) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Current */}
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
