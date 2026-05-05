import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export interface EnergyPrediction {
  id: number;
  deviceId: number;
  deviceName: string;
  predictedUsage: number;
  confidence: number;
  predictionDate: string;
  createdAt: string;
}

interface EnergyPredictionsCardProps {
  predictions: EnergyPrediction[];
}

export function EnergyPredictionsCard({
  predictions,
}: EnergyPredictionsCardProps) {
  const { t } = useTranslation();
  if (predictions.length === 0) return null;

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          {t("aiEnergyPredictions")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {predictions.slice(0, 5).map((pred) => (
            <div
              key={pred.id}
              className="flex items-center justify-between p-4 rounded-xl border"
            >
              <div className="flex-1">
                <p className="font-medium">{pred.deviceName}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("predictedUsage")}: {pred.predictedUsage.toFixed(2)} kWh
                </p>
              </div>
              <Badge
                variant={
                  pred.confidence >= 0.9
                    ? "default"
                    : pred.confidence >= 0.8
                      ? "secondary"
                      : "outline"
                }
              >
                {(pred.confidence * 100).toFixed(0)}% {t("confidence")}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
