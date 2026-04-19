import { Card, CardContent } from "@/components/ui/card";
import { Bell, CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface NotificationStatsProps {
  total: number;
  active: number;
  inactive: number;
}

export function NotificationStats({
  total,
  active,
  inactive,
}: NotificationStatsProps) {
  const { t } = useTranslation();

  const stats = [
    {
      label: t("totalTemplates"),
      value: total,
      icon: Bell,
      bg: "bg-blue-500/10",
      color: "text-blue-500",
    },
    {
      label: t("active"),
      value: active,
      icon: CheckCircle,
      bg: "bg-green-500/10",
      color: "text-green-500",
    },
    {
      label: t("inactive"),
      value: inactive,
      icon: XCircle,
      bg: "bg-orange-500/10",
      color: "text-orange-500",
    },
  ];

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-3">
      {stats.map(({ label, value, icon: Icon, bg, color }) => (
        <Card key={label} className="overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full ${bg} flex items-center justify-center shrink-0`}
              >
                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {label}
                </p>
                <p className="text-xl sm:text-2xl font-bold">{value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
