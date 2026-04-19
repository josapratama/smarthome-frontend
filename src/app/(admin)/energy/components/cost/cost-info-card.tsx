import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export function CostInfoCard() {
  const { t } = useTranslation();

  const tips = [
    t("howItWorksTip1"),
    t("howItWorksTip2"),
    t("howItWorksTip3"),
    t("howItWorksTip4"),
  ];

  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
      <CardContent className="pt-6">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium mb-1">{t("howItWorks")}</p>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
              {tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
