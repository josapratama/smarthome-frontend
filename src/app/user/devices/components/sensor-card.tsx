"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Zap,
  Thermometer,
  Droplets,
  Wind,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

interface SensorCardProps {
  type?: "power" | "temperature" | "humidity" | "motion" | "other";
  title?: string;
  deviceName?: string;
  value: number;
  unit: string;
  status: "safe" | "warning" | "danger";
  statusLabel?: string;
  trend?: "up" | "down" | "stable";
  lastUpdate?: Date;
  onClick?: () => void;
  compact?: boolean;
}

export function SensorCard({
  type = "other",
  title,
  deviceName,
  value,
  unit,
  status,
  statusLabel,
  trend,
  lastUpdate,
  onClick,
  compact = false,
}: SensorCardProps) {
  const getIcon = () => {
    switch (type) {
      case "power":
        return Zap;
      case "temperature":
        return Thermometer;
      case "humidity":
        return Droplets;
      case "motion":
        return Activity;
      default:
        return Wind;
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case "safe":
        return {
          color: "bg-green-500",
          bgColor: "bg-green-50 dark:bg-green-950/30",
          borderColor: "border-green-200 dark:border-green-800",
          textColor: "text-green-700 dark:text-green-300",
          label: statusLabel || "Safe",
          icon: "🟢",
        };
      case "warning":
        return {
          color: "bg-yellow-500",
          bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
          borderColor: "border-yellow-200 dark:border-yellow-800",
          textColor: "text-yellow-700 dark:text-yellow-300",
          label: statusLabel || "Warning",
          icon: "🟡",
        };
      case "danger":
        return {
          color: "bg-red-500",
          bgColor: "bg-red-50 dark:bg-red-950/30",
          borderColor: "border-red-200 dark:border-red-800",
          textColor: "text-red-700 dark:text-red-300",
          label: statusLabel || "Danger",
          icon: "🔴",
        };
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return TrendingUp;
      case "down":
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const Icon = getIcon();
  const TrendIcon = getTrendIcon();
  const statusConfig = getStatusConfig();

  const formatLastUpdate = (date?: Date) => {
    if (!date) return "Just now";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString();
  };

  // Compact mode for detail page
  if (compact) {
    return (
      <div
        className={cn(
          "p-3 rounded-lg border-l-4 transition-all",
          statusConfig.borderColor,
          statusConfig.bgColor,
          onClick && "cursor-pointer hover:shadow-md",
        )}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={cn("h-5 w-5", statusConfig.textColor)} />
            <div>
              <p className="text-sm font-medium">{title || deviceName}</p>
              <div className="flex items-baseline gap-1">
                <span
                  className={cn("text-2xl font-bold", statusConfig.textColor)}
                >
                  {value.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">{unit}</span>
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "gap-1 border-0",
              statusConfig.bgColor,
              statusConfig.textColor,
            )}
          >
            <span>{statusConfig.icon}</span>
            <span className="text-xs font-semibold">{statusConfig.label}</span>
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2",
        statusConfig.borderColor,
        statusConfig.bgColor,
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "p-2 rounded-lg",
                status === "safe"
                  ? "bg-green-100 dark:bg-green-900/50"
                  : status === "warning"
                    ? "bg-yellow-100 dark:bg-yellow-900/50"
                    : "bg-red-100 dark:bg-red-900/50",
              )}
            >
              <Icon className={cn("h-5 w-5", statusConfig.textColor)} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {title || deviceName}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {type} Sensor
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "gap-1 border-0",
              statusConfig.bgColor,
              statusConfig.textColor,
            )}
          >
            <span>{statusConfig.icon}</span>
            <span className="text-xs font-semibold">{statusConfig.label}</span>
          </Badge>
        </div>

        {/* Value Display */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className={cn("text-4xl font-bold", statusConfig.textColor)}>
              {value.toFixed(1)}
            </span>
            <span className="text-lg font-medium text-muted-foreground">
              {unit}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {trend && (
              <>
                <TrendIcon
                  className={cn(
                    "h-3 w-3",
                    trend === "up"
                      ? "text-red-500"
                      : trend === "down"
                        ? "text-green-500"
                        : "text-gray-500",
                  )}
                />
                <span className="capitalize">{trend}</span>
              </>
            )}
          </div>
          <span>{formatLastUpdate(lastUpdate)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
