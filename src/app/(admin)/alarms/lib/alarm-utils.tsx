import {
  Wind,
  Flame,
  Trash2,
  Zap,
  Activity,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "CRITICAL":
      return "bg-red-100 text-red-800 border-red-200";
    case "HIGH":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "LOW":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "OPEN":
      return "bg-red-100 text-red-700";
    case "ACKED":
      return "bg-yellow-100 text-yellow-700";
    case "RESOLVED":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function getAlarmIcon(type: string) {
  switch (type) {
    case "gas_leak":
      return <Wind className="h-5 w-5" />;
    case "flame_detected":
      return <Flame className="h-5 w-5" />;
    case "bin_full":
      return <Trash2 className="h-5 w-5" />;
    case "voltage_abnormal":
    case "overcurrent":
      return <Zap className="h-5 w-5" />;
    case "sensor_malfunction":
      return <Activity className="h-5 w-5" />;
    case "energy_anomaly":
      return <AlertCircle className="h-5 w-5" />;
    default:
      return <AlertTriangle className="h-5 w-5" />;
  }
}

/** Convert snake_case type to PascalCase for translation key lookup */
export function alarmTypeKey(type: string): string {
  return `alarmType${type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("")}`;
}

/** Convert status/severity to PascalCase for translation key lookup */
export function toPascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
