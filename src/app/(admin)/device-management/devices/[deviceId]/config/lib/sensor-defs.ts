import { Zap, Wind, Flame, Ruler, type LucideIcon } from "lucide-react";
import type { SensorConfig } from "./sensor-config.types";

export interface SensorDef {
  key: keyof Omit<SensorConfig, "bin_height">;
  labelKey: string;
  descKey: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export const SENSOR_DEFS: SensorDef[] = [
  {
    key: "pzem_en",
    labelKey: "sensorPzem",
    descKey: "sensorPzemDesc",
    icon: Zap,
    color: "text-orange-500",
    bg: "bg-orange-100 dark:bg-orange-900",
  },
  {
    key: "mq2_en",
    labelKey: "sensorMq2",
    descKey: "sensorMq2Desc",
    icon: Wind,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900",
  },
  {
    key: "flame_en",
    labelKey: "sensorFlame",
    descKey: "sensorFlameDesc",
    icon: Flame,
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-900",
  },
  {
    key: "ultrasonic_en",
    labelKey: "sensorUltrasonic",
    descKey: "sensorUltrasonicDesc",
    icon: Ruler,
    color: "text-purple-500",
    bg: "bg-purple-100 dark:bg-purple-900",
  },
];
