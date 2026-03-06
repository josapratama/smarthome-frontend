import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Zap, Brain } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import type { AIStats } from "@/lib/api/ai";

interface AIStatsCardsProps {
  stats: AIStats | undefined;
  isLoading: boolean;
}

export function AIStatsCards({ stats, isLoading }: AIStatsCardsProps) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="rounded-2xl shadow-sm border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            {t("aiModels")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-10 w-16" />
          ) : (
            <div className="text-3xl font-semibold dark:text-white">
              {stats?.totalModels || 0}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            {t("predictions")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-10 w-16" />
          ) : (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div className="text-3xl font-semibold dark:text-white">
                {stats?.activePredictions || 0}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            {t("automations")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-10 w-16" />
          ) : (
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div className="text-3xl font-semibold dark:text-white">
                {stats?.activeAutomations || 0}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            {t("anomalies")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-10 w-16" />
          ) : (
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <div className="text-3xl font-semibold dark:text-white">
                {stats?.detectedAnomalies || 0}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
