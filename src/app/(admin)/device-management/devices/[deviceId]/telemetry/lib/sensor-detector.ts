import type { TelemetryDTO } from "@/lib/api/dto/telemetry.dto";

export type SensorType =
  | "ENERGY_MONITOR"
  | "GAS_SENSOR"
  | "FLAME_SENSOR"
  | "ULTRASONIC"
  | "CURRENT_SENSOR"
  | "TEMPERATURE_HUMIDITY"
  | "PRESSURE"
  | "SOIL_MOISTURE"
  | "LIGHT_SENSOR"
  | "UNKNOWN";

/** Detect primary sensor type from telemetry data fields */
export function detectSensorType(data: TelemetryDTO | null): SensorType {
  if (!data) return "UNKNOWN";

  if (
    (data.voltageV ?? 0) > 0 ||
    (data.currentA ?? 0) > 0 ||
    (data.powerW ?? 0) > 0 ||
    (data.energyKwh ?? 0) > 0 ||
    (data.frequencyHz ?? 0) > 0 ||
    (data.powerFactor ?? 0) > 0
  )
    return "ENERGY_MONITOR";

  if (data.distanceCm != null || data.binLevel != null) return "ULTRASONIC";
  if (data.flame != null) return "FLAME_SENSOR";
  if (data.gasPpm != null) return "GAS_SENSOR";
  if ((data.current ?? 0) > 0) return "CURRENT_SENSOR";
  if (data.temperatureC != null || data.humidityPercent != null)
    return "TEMPERATURE_HUMIDITY";
  if (data.pressureHpa != null || data.altitudeM != null) return "PRESSURE";
  if (data.soilMoisturePercent != null) return "SOIL_MOISTURE";
  if (data.lightLux != null) return "LIGHT_SENSOR";

  return "UNKNOWN";
}

/** Returns true if telemetry has at least one non-null sensor value */
export function hasSensorData(data: TelemetryDTO | null): boolean {
  if (!data) return false;
  return (
    (data.voltageV ?? 0) > 0 ||
    (data.currentA ?? 0) > 0 ||
    (data.powerW ?? 0) > 0 ||
    (data.energyKwh ?? 0) > 0 ||
    (data.frequencyHz ?? 0) > 0 ||
    (data.powerFactor ?? 0) > 0 ||
    data.flame != null ||
    data.gasPpm != null ||
    data.distanceCm != null ||
    data.binLevel != null ||
    (data.current ?? 0) > 0 ||
    data.temperatureC != null ||
    data.humidityPercent != null ||
    data.pressureHpa != null ||
    data.altitudeM != null ||
    data.soilMoisturePercent != null ||
    data.lightLux != null
  );
}

/** Table column definitions per sensor type for the history table */
export interface TableColumn {
  key: keyof TelemetryDTO;
  label: string;
  unit: string;
  decimals: number;
}

export function getTableColumns(type: SensorType): TableColumn[] {
  switch (type) {
    case "ENERGY_MONITOR":
      return [
        { key: "voltageV", label: "Tegangan", unit: "V", decimals: 2 },
        { key: "currentA", label: "Arus", unit: "A", decimals: 3 },
        { key: "powerW", label: "Daya", unit: "W", decimals: 2 },
        { key: "energyKwh", label: "Energi", unit: "kWh", decimals: 3 },
        { key: "frequencyHz", label: "Frekuensi", unit: "Hz", decimals: 1 },
        { key: "powerFactor", label: "PF", unit: "", decimals: 2 },
      ];
    case "GAS_SENSOR":
      return [{ key: "gasPpm", label: "Gas PPM", unit: "ppm", decimals: 0 }];
    case "FLAME_SENSOR":
      return [{ key: "flame", label: "Api", unit: "", decimals: 0 }];
    case "ULTRASONIC":
      return [
        { key: "distanceCm", label: "Jarak", unit: "cm", decimals: 1 },
        { key: "binLevel", label: "Level", unit: "%", decimals: 0 },
      ];
    case "CURRENT_SENSOR":
      return [{ key: "current", label: "Arus", unit: "A", decimals: 3 }];
    case "TEMPERATURE_HUMIDITY":
      return [
        { key: "temperatureC", label: "Suhu", unit: "°C", decimals: 1 },
        { key: "humidityPercent", label: "Kelembaban", unit: "%", decimals: 1 },
      ];
    case "PRESSURE":
      return [
        { key: "pressureHpa", label: "Tekanan", unit: "hPa", decimals: 1 },
        { key: "altitudeM", label: "Ketinggian", unit: "m", decimals: 0 },
      ];
    case "SOIL_MOISTURE":
      return [
        {
          key: "soilMoisturePercent",
          label: "Kelembaban Tanah",
          unit: "%",
          decimals: 1,
        },
      ];
    case "LIGHT_SENSOR":
      return [{ key: "lightLux", label: "Cahaya", unit: "lux", decimals: 0 }];
    default:
      return [];
  }
}
