import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { AlarmDTO } from "../types";

interface AlarmCriticalBannerProps {
  alarms: AlarmDTO[];
}

export function AlarmCriticalBanner({ alarms }: AlarmCriticalBannerProps) {
  const { t } = useTranslation();
  if (alarms.length === 0) return null;

  return (
    <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 rounded-xl">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100">
              {t("criticalAlertsActive")}
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {alarms.length} {t("criticalAlertsCount")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
