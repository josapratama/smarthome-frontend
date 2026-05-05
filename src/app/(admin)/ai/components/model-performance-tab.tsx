"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import {
  aiModelsApi,
  type AIModelPerformance,
  type ModelComparison,
} from "@/lib/api/services/ai-models";
import { formatDistanceToNow } from "date-fns";

// ─── Accuracy badge ───────────────────────────────────────────────────────────
function AccuracyBadge({ value }: { value: number }) {
  const pct = (value * 100).toFixed(1);
  if (value >= 0.85)
    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-0">
        {pct}%
      </Badge>
    );
  if (value >= 0.7)
    return (
      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-0">
        {pct}%
      </Badge>
    );
  return (
    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-0">
      {pct}%
    </Badge>
  );
}

// ─── Comparison bar ───────────────────────────────────────────────────────────
function ComparisonBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium truncate max-w-[160px]">{label}</span>
        <span className="text-muted-foreground">
          {(value * 100).toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2.5">
        <div
          className={`${color} h-2.5 rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ModelPerformanceTab() {
  const { t } = useTranslation();
  const [days, setDays] = useState(30);
  const [modelFilter, setModelFilter] = useState<string>("all");

  // Fetch performance history
  const {
    data: performances,
    isLoading: perfLoading,
    refetch: refetchPerf,
  } = useQuery<AIModelPerformance[]>({
    queryKey: ["ai-model-performance", modelFilter, days],
    queryFn: () =>
      aiModelsApi.getPerformance({
        modelName: modelFilter !== "all" ? modelFilter : undefined,
        limit: 50,
      }),
  });

  // Fetch model comparison
  const {
    data: comparison,
    isLoading: compLoading,
    refetch: refetchComp,
  } = useQuery<ModelComparison[]>({
    queryKey: ["ai-model-comparison", days],
    queryFn: () => aiModelsApi.compareModels({ days }),
  });

  const isLoading = perfLoading || compLoading;

  const handleRefresh = () => {
    refetchPerf();
    refetchComp();
  };

  // Get unique model names for filter
  const modelNames = Array.from(
    new Set(performances?.map((p) => p.modelName) ?? []),
  );

  // Best accuracy in comparison for bar scaling
  const maxAccuracy = Math.max(
    ...(comparison?.map((c) => c.avgAccuracy) ?? [0]),
    0.01,
  );

  const barColors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-teal-500",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold dark:text-white">
            {t("modelPerformance")}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("modelPerformanceDescription")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={String(days)}
            onValueChange={(v) => setDays(Number(v))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{t("last7Days")}</SelectItem>
              <SelectItem value="14">{t("last14Days")}</SelectItem>
              <SelectItem value="30">{t("last30Days")}</SelectItem>
              <SelectItem value="90">{t("last90Days")}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            {t("refresh")}
          </Button>
        </div>
      </div>

      {/* Model Comparison Chart */}
      <Card className="rounded-2xl shadow-sm border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 dark:text-white">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            {t("modelComparison")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {compLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !comparison || comparison.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BarChart3 className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm font-semibold dark:text-white">
                {t("noComparisonData")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("noComparisonDataDescription")}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Accuracy bars */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("avgAccuracy")}
                </p>
                {comparison.map((model, idx) => (
                  <ComparisonBar
                    key={model.modelName}
                    label={model.modelName}
                    value={model.avgAccuracy}
                    max={maxAccuracy}
                    color={barColors[idx % barColors.length]}
                  />
                ))}
              </div>

              {/* Comparison table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("model")}</TableHead>
                      <TableHead className="text-right">
                        {t("avgAccuracy")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("minAccuracy")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("maxAccuracy")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("totalPredictions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparison
                      .sort((a, b) => b.avgAccuracy - a.avgAccuracy)
                      .map((model, idx) => (
                        <TableRow key={model.modelName}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2.5 h-2.5 rounded-full ${barColors[idx % barColors.length]}`}
                              />
                              <span className="font-medium text-sm">
                                {model.modelName}
                              </span>
                              {idx === 0 && (
                                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-0 text-xs">
                                  {t("best")}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <AccuracyBadge value={model.avgAccuracy} />
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {(model.minAccuracy * 100).toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {(model.maxAccuracy * 100).toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {model.totalPredictions.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance History */}
      <Card className="rounded-2xl shadow-sm border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 dark:text-white">
            <TrendingUp className="h-4 w-4 text-green-500" />
            {t("performanceHistory")}
          </CardTitle>
          <Select value={modelFilter} onValueChange={setModelFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allModels")}</SelectItem>
              {modelNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {perfLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !performances || performances.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <TrendingUp className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm font-semibold dark:text-white">
                {t("noPerformanceData")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("noPerformanceDataDescription")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("model")}</TableHead>
                    <TableHead>{t("device")}</TableHead>
                    <TableHead className="text-right">
                      {t("accuracy")}
                    </TableHead>
                    <TableHead>{t("trend")}</TableHead>
                    <TableHead>{t("predictionDate")}</TableHead>
                    <TableHead>{t("recordedAt")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performances.map((perf, idx) => {
                    // Simple trend: compare with previous entry for same model
                    const prev = performances
                      .slice(idx + 1)
                      .find((p) => p.modelName === perf.modelName);
                    const trend = prev
                      ? perf.accuracy > prev.accuracy
                        ? "up"
                        : perf.accuracy < prev.accuracy
                          ? "down"
                          : "flat"
                      : "flat";

                    return (
                      <TableRow key={perf.id}>
                        <TableCell className="font-medium text-sm">
                          {perf.modelName}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {perf.device?.deviceName || `Device ${perf.deviceId}`}
                        </TableCell>
                        <TableCell className="text-right">
                          <AccuracyBadge value={perf.accuracy} />
                        </TableCell>
                        <TableCell>
                          {trend === "up" && (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          )}
                          {trend === "down" && (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          {trend === "flat" && (
                            <Minus className="h-4 w-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(perf.predictionDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(perf.recordedAt), {
                            addSuffix: true,
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
