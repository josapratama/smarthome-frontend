"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Calendar,
  Activity,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { EnergyStats } from "@/lib/types";

interface EnergyStatsCardsProps {
  stats: EnergyStats | null;
  isLoading: boolean;
  timeRange: "today" | "week" | "month";
  costPerKwh: number;
  devicesCount: number;
  onlineDevicesCount: number;
}

export function EnergyStatsCards({
  stats,
  isLoading,
  timeRange,
  costPerKwh,
  devicesCount,
  onlineDevicesCount,
}: EnergyStatsCardsProps) {
  const { t } = useTranslation();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-red-500";
      case "down":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const formatEnergy = (kwh: number) => {
    if (kwh >= 1000) {
      return `${(kwh / 1000).toFixed(2)} MWh`;
    }
    return `${kwh.toFixed(2)} kWh`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTimeRangeValue = () => {
    if (!stats) return 0;
    switch (timeRange) {
      case "today":
        return stats.today;
      case "week":
        return stats.thisWeek;
      case "month":
        return stats.thisMonth;
      default:
        return stats.today;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[140px] rounded-lg" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Consumption */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("totalConsumption")}
              </p>
              <p className="text-2xl font-bold mt-1">
                {formatEnergy(getTimeRangeValue())}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Zap className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-sm">
            {getTrendIcon(stats.trend)}
            <span className={getTrendColor(stats.trend)}>
              {Math.abs(stats.percentageChange).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">{t("fromYesterday")}</span>
          </div>
        </CardContent>
      </Card>

      {/* Estimated Cost */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("estimatedCost")}
              </p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(getTimeRangeValue() * costPerKwh)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-3">
            @ {formatCurrency(costPerKwh)}/kWh
          </div>
        </CardContent>
      </Card>

      {/* Daily Average */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("dailyAverage")}
              </p>
              <p className="text-2xl font-bold mt-1">
                {formatEnergy(stats.dailyAverage)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-3">
            {t("perDay")}
          </div>
        </CardContent>
      </Card>

      {/* Active Power Meters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("powerMeters")}
              </p>
              <p className="text-2xl font-bold mt-1">{devicesCount}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Activity className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-3">
            {onlineDevicesCount} {t("online")}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
