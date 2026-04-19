import { Smartphone, Wifi, WifiOff } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface DeviceStatsProps {
  total: number;
  online: number;
  offline: number;
}

export function DeviceStats({ total, online, offline }: DeviceStatsProps) {
  const { t } = useTranslation();

  const stats = [
    {
      label: t("totalDevices"),
      value: total,
      icon: Smartphone,
      color: "text-purple-500",
    },
    {
      label: t("onlineDevices"),
      value: online,
      icon: Wifi,
      color: "text-green-500",
    },
    {
      label: t("offlineDevices"),
      value: offline,
      icon: WifiOff,
      color: "text-gray-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="relative overflow-hidden rounded-xl border bg-card p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{label}</span>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      ))}
    </div>
  );
}
