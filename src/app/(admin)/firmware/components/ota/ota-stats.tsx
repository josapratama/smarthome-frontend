import { Card, CardContent } from "@/components/ui/card";
import { Zap, Clock, Activity, CheckCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface OtaStatsProps {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export function OtaStats({
  total,
  pending,
  inProgress,
  completed,
}: OtaStatsProps) {
  const { t } = useTranslation();

  const stats = [
    {
      label: t("totalJobs"),
      value: total,
      icon: Zap,
      bg: "bg-blue-100 dark:bg-blue-900",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      label: t("pending"),
      value: pending,
      icon: Clock,
      bg: "bg-yellow-100 dark:bg-yellow-900",
      color: "text-yellow-600 dark:text-yellow-400",
    },
    {
      label: t("inProgress"),
      value: inProgress,
      icon: Activity,
      bg: "bg-orange-100 dark:bg-orange-900",
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      label: t("completed"),
      value: completed,
      icon: CheckCircle,
      bg: "bg-green-100 dark:bg-green-900",
      color: "text-green-600 dark:text-green-400",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, bg, color }) => (
        <Card
          key={label}
          className="rounded-2xl shadow-sm hover:shadow-md transition-shadow"
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center ${bg}`}
              >
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
