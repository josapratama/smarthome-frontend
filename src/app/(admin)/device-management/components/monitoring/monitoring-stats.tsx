import { Card, CardContent } from "@/components/ui/card";
import {
  Server,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface MonitoringStatsProps {
  total: number;
  online: number;
  offline: number;
  critical: number;
}

export function MonitoringStats({
  total,
  online,
  offline,
  critical,
}: MonitoringStatsProps) {
  const { t } = useTranslation();

  const stats: {
    label: string;
    value: number;
    icon: LucideIcon;
    color: string;
  }[] = [
    {
      label: t("totalDevices"),
      value: total,
      icon: Server,
      color: "text-blue-500",
    },
    {
      label: t("onlineDevices"),
      value: online,
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      label: t("offlineDevices"),
      value: offline,
      icon: XCircle,
      color: "text-red-500",
    },
    {
      label: t("criticalDevices"),
      value: critical,
      icon: AlertTriangle,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <Card
          key={label}
          className="rounded-xl hover:shadow-md transition-shadow"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
