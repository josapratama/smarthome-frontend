import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import type { EnergyPrediction } from "@/lib/api/services/ai";

interface PredictionsTabProps {
  predictions: EnergyPrediction[] | undefined;
  isLoading: boolean;
}

export function PredictionsTab({
  predictions,
  isLoading,
}: PredictionsTabProps) {
  const { t } = useLanguage();

  return (
    <Card className="rounded-2xl shadow-sm border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <CardHeader>
        <CardTitle className="text-base dark:text-white">
          {t("energyPredictions")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !predictions || predictions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <TrendingUp className="h-10 w-10 text-muted-foreground/50" />
            <h3 className="mt-3 text-sm font-semibold dark:text-white">
              {t("noPredictionsAvailable")}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("aiEnergyPredictions")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {predictions.map((prediction) => (
              <div
                key={prediction.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-muted/50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium text-sm dark:text-white">
                      {t("predictedUsage")}: {prediction.predictedUsage} kWh
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("confidence")}: {prediction.confidence}% • {t("type")}:{" "}
                      {prediction.type}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(prediction.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
