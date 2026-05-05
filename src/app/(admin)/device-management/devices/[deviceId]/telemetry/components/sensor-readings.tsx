"use client";

import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { TelemetryDTO } from "@/lib/api/dto/telemetry.dto";
import { useTranslation } from "@/hooks/use-translation";
import type { SensorType } from "../lib/sensor-detector";
import {
  PzemCards,
  Mq2Cards,
  FlameCards,
  UltrasonicCards,
  CurrentCards,
  TemperatureHumidityCards,
  PressureCards,
  SoilMoistureCards,
  LightSensorCards,
} from "./sensor-cards";

interface SensorReadingsProps {
  data: TelemetryDTO;
  /** All active sensor types — supports multi-sensor devices */
  sensorTypes: SensorType[];
}

function SingleSensorCard({
  data,
  type,
}: {
  data: TelemetryDTO;
  type: SensorType;
}) {
  const { t } = useTranslation();
  switch (type) {
    case "ENERGY_MONITOR":
      return <PzemCards data={data} />;
    case "GAS_SENSOR":
      return <Mq2Cards data={data} />;
    case "FLAME_SENSOR":
      return <FlameCards data={data} />;
    case "ULTRASONIC":
      return <UltrasonicCards data={data} />;
    case "CURRENT_SENSOR":
      return <CurrentCards data={data} />;
    case "TEMPERATURE_HUMIDITY":
      return <TemperatureHumidityCards data={data} />;
    case "PRESSURE":
      return <PressureCards data={data} />;
    case "SOIL_MOISTURE":
      return <SoilMoistureCards data={data} />;
    case "LIGHT_SENSOR":
      return <LightSensorCards data={data} />;
    default:
      return (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="py-8 text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{t("unknownSensorType")}</p>
          </CardContent>
        </Card>
      );
  }
}

export function SensorReadings({ data, sensorTypes }: SensorReadingsProps) {
  const activeTypes = sensorTypes.filter((t) => t !== "UNKNOWN");

  if (activeTypes.length === 0) {
    return null;
  }

  // Single sensor — render as before
  if (activeTypes.length === 1) {
    return <SingleSensorCard data={data} type={activeTypes[0]} />;
  }

  // Multi-sensor — render all cards stacked
  return (
    <div className="space-y-4">
      {activeTypes.map((type) => (
        <SingleSensorCard key={type} data={data} type={type} />
      ))}
    </div>
  );
}
