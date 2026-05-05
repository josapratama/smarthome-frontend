import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export function EnergyTipsCard() {
  const { t } = useTranslation();

  const tips = [t("tip1"), t("tip2"), t("tip3")];

  return (
    <Card className="rounded-2xl shadow-sm border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 text-green-900 dark:text-green-100">
          <Lightbulb className="h-4 w-4" />
          {t("energySavingTips")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
