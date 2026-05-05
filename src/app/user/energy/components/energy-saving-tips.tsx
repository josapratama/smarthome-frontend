"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

const TIP_KEYS = ["tip1", "tip2", "tip3"] as const;

export function EnergySavingTips() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-green-500" />
          {t("energySavingTips")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {TIP_KEYS.map((key, i) => (
            <div key={key} className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-green-600">
                  {i + 1}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{t(key)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
