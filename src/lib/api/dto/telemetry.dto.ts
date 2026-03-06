/**
 * Telemetry DTOs - matches backend SensorDataDTO
 * All sensor fields are nullable to support different sensor types
 */

export interface TelemetryDTO {
  id: number;
  deviceId: number;
  timestamp: string;

  // Basic sensor fields (nullable for multi-sensor support)
  current: number | null;
  gasPpm: number | null;
  flame: boolean | null;
  binLevel: number | null;

  // Power meter fields (PZEM-004T)
  powerW: number | null;
  energyKwh: number | null;
  voltageV: number | null;
  currentA: number | null;
  frequencyHz: number | null;
  powerFactor: number | null;

  // Ultrasonic sensor
  distanceCm: number | null;
}
