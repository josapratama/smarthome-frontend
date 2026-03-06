import type { TelemetryDTO } from "@/lib/api/dto/telemetry.dto";

export type SensorType =
  | "ENERGY_MONITOR" // PZEM-004T
  | "GAS_SENSOR" // MQ-2, MQ-135, etc
  | "FLAME_SENSOR" // Flame detector
  | "ULTRASONIC" // HC-SR04, JSN-SR04T
  | "CURRENT_SENSOR" // ACS712, etc
  | "UNKNOWN";

/**
 * Detect sensor type based on telemetry data
 * Returns the primary sensor type based on which fields have data
 */
export function detectSensorType(data: TelemetryDTO | null): SensorType {
  if (!data) return "UNKNOWN";

  // Check for PZEM-004T (Energy Monitor) FIRST
  const hasPZEMData =
    (data.voltageV !== null && data.voltageV > 0) ||
    (data.currentA !== null && data.currentA > 0) ||
    (data.powerW !== null && data.powerW > 0) ||
    (data.energyKwh !== null && data.energyKwh > 0) ||
    (data.frequencyHz !== null && data.frequencyHz > 0) ||
    (data.powerFactor !== null && data.powerFactor > 0);

  if (hasPZEMData) return "ENERGY_MONITOR";

  // Check for Ultrasonic Sensor BEFORE Flame/Gas
  const hasUltrasonicData =
    (data.distanceCm !== null &&
      data.distanceCm !== undefined &&
      data.distanceCm > 0) ||
    (data.binLevel !== null &&
      data.binLevel !== undefined &&
      data.binLevel >= 0);
  if (hasUltrasonicData) return "ULTRASONIC";

  // Check for Flame Sensor
  const hasFlameData = data.flame === true;
  if (hasFlameData) return "FLAME_SENSOR";

  // Check for Gas Sensor (MQ-2, MQ-135, etc)
  const hasGasData =
    data.gasPpm !== null && data.gasPpm !== undefined && data.gasPpm >= 0;
  if (hasGasData) return "GAS_SENSOR";

  // Check for Current Sensor
  const hasCurrentData =
    data.current !== null && data.current !== undefined && data.current > 0;
  if (hasCurrentData) return "CURRENT_SENSOR";

  return "UNKNOWN";
}

/**
 * Check if sensor has any valid data
 */
export function hasSensorData(data: TelemetryDTO | null): boolean {
  if (!data) return false;

  return (
    // PZEM fields
    (data.voltageV !== null && data.voltageV > 0) ||
    (data.currentA !== null && data.currentA > 0) ||
    (data.powerW !== null && data.powerW > 0) ||
    (data.energyKwh !== null && data.energyKwh > 0) ||
    (data.frequencyHz !== null && data.frequencyHz > 0) ||
    (data.powerFactor !== null && data.powerFactor > 0) ||
    // Flame sensor fields
    (data.flame !== null && data.flame !== undefined) ||
    // Gas sensor fields
    (data.gasPpm !== null && data.gasPpm !== undefined) ||
    // Other sensor fields
    data.distanceCm !== null ||
    data.binLevel !== null ||
    data.current !== null
  );
}

/**
 * Get sensor type display name
 * @param type - Sensor type
 * @param t - Translation function
 */
export function getSensorTypeName(
  type: SensorType,
  t: (key: string) => string,
): string {
  switch (type) {
    case "ENERGY_MONITOR":
      return t("energyMonitorPzem");
    case "GAS_SENSOR":
      return t("gasSensorMq");
    case "FLAME_SENSOR":
      return t("flameDetector");
    case "ULTRASONIC":
      return t("ultrasonicDistanceSensor");
    case "CURRENT_SENSOR":
      return t("currentSensor");
    default:
      return t("unknownSensor");
  }
}

/**
 * Get sensor info description
 * @param type - Sensor type
 * @param t - Translation function
 */
export function getSensorInfo(
  type: SensorType,
  t: (key: string) => string,
): {
  title: string;
  description: string;
  metrics: string[];
} {
  switch (type) {
    case "ENERGY_MONITOR":
      return {
        title: t("whatIsEnergyMonitor"),
        description: t("energyMonitorDesc"),
        metrics: [
          t("voltageMetric"),
          t("currentMetric"),
          t("powerMetric"),
          t("energyMetric"),
          t("frequencyMetric"),
          t("powerFactorMetric"),
        ],
      };
    case "GAS_SENSOR":
      return {
        title: t("whatIsGasSensor"),
        description: t("gasSensorDesc"),
        metrics: [t("gasPpmMetric"), t("alarmMetric"), t("analogMetric")],
      };
    case "FLAME_SENSOR":
      return {
        title: t("whatIsFlameSensor"),
        description: t("flameSensorDesc"),
        metrics: [t("flameMetric"), t("alarmMetric")],
      };
    case "ULTRASONIC":
      return {
        title: t("whatIsUltrasonicSensor"),
        description: t("ultrasonicSensorDesc"),
        metrics: [t("distanceMetric"), t("fillLevelMetric"), t("statusMetric")],
      };
    case "CURRENT_SENSOR":
      return {
        title: t("whatIsCurrentSensor"),
        description: t("currentSensorDesc"),
        metrics: [t("currentMetric")],
      };
    default:
      return {
        title: t("sensorTelemetry"),
        description: t("sensorTelemetryDesc"),
        metrics: [],
      };
  }
}
