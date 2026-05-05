import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface NotificationStatsProps {
  total: number;
  unread: number;
}

export function NotificationStats({ total, unread }: NotificationStatsProps) {
  const { t } = useTranslation();

  const stats = [
    { label: t("allNotifications"), value: total, color: "text-blue-500" },
    { label: t("unread"), value: unread, color: "text-orange-500" },
  ];

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2">
      {stats.map(({ label, value, color }) => (
        <Card key={label} className="rounded-xl sm:rounded-2xl shadow-sm">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {label}
                </p>
                <p className="text-xl sm:text-2xl font-bold">{value}</p>
              </div>
              <Bell className={`h-6 w-6 sm:h-8 sm:w-8 ${color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
