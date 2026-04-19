import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain,
  AlertTriangle,
  Clock,
  CheckCircle,
  Activity,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { Anomaly } from "@/lib/api/services/ai";
import { getSeverityColor } from "../utils";

interface AnomaliesTabProps {
  anomalies: Anomaly[] | undefined;
  isLoading: boolean;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "OPEN":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "INVESTIGATING":
      return <Clock className="h-4 w-4 text-blue-500" />;
    case "RESOLVED":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    default:
      return <Activity className="h-4 w-4 text-gray-500" />;
  }
};

export function AnomaliesTab({ anomalies, isLoading }: AnomaliesTabProps) {
  const { t } = useTranslation();

  return (
    <Card className="rounded-2xl shadow-sm border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <CardHeader>
        <CardTitle className="text-base dark:text-white">
          {t("anomalyDetection")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : !anomalies || anomalies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Brain className="h-10 w-10 text-muted-foreground/50" />
            <h3 className="mt-3 text-sm font-semibold dark:text-white">
              {t("noAnomaliesDetected")}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("systemOperatingNormally")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {anomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-muted/50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(anomaly.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm dark:text-white">
                        {anomaly.deviceName ||
                          `${t("device")} ${anomaly.deviceId}`}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getSeverityColor(anomaly.severity)}`}
                      >
                        {anomaly.severity}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {anomaly.description}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {t("detected")}:{" "}
                      {new Date(anomaly.detectedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {anomaly.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
