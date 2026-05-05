export interface SensorConfig {
  pzem_en: boolean;
  mq2_en: boolean;
  flame_en: boolean;
  ultrasonic_en: boolean;
  bin_height: number;
}

export const DEFAULT_SENSOR_CONFIG: SensorConfig = {
  pzem_en: true,
  mq2_en: true,
  flame_en: true,
  ultrasonic_en: true,
  bin_height: 100,
};

/** Device types that use the sensor toggle UI */
export const SENSOR_DEVICE_TYPES = ["SENSOR_NODE", "ENERGY_MONITOR"] as const;

export function isSensorDeviceType(type: string): boolean {
  return (SENSOR_DEVICE_TYPES as readonly string[]).includes(type);
}
