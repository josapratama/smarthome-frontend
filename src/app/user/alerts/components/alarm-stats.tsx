"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";

interface AlarmStatsProps {
  total: number;
  open: number;
  acked: number;
  critical: number;
}

export function AlarmStats({ total, open, acked, critical }: AlarmStatsProps) {
  const { t } = useTranslation();

  if (total === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-3xl font-bold">{total}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {t("totalAlarms")}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{open}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {t("open")}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{acked}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {t("acknowledged")}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{critical}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {t("critical")}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
