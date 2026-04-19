import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

export function StatusBadge({
  status,
  onlineLabel,
  offlineLabel,
}: {
  status: boolean;
  onlineLabel: string;
  offlineLabel: string;
}) {
  return status ? (
    <Badge className="bg-green-500 hover:bg-green-600">
      <Wifi className="mr-1 h-3 w-3" />
      {onlineLabel}
    </Badge>
  ) : (
    <Badge variant="secondary">
      <WifiOff className="mr-1 h-3 w-3" />
      {offlineLabel}
    </Badge>
  );
}

const TYPE_COLORS: Record<string, string> = {
  LIGHT:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  FAN: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  SENSOR_NODE:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  POWER_METER:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  ENERGY_MONITOR:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  DOOR: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export function DeviceTypeBadge({ type }: { type: string }) {
  return (
    <Badge variant="outline" className={TYPE_COLORS[type] ?? TYPE_COLORS.OTHER}>
      {type.replace(/_/g, " ")}
    </Badge>
  );
}
