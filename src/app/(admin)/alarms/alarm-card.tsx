"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  Wind,
  Trash2,
  Zap,
  Activity,
  AlertCircle,
} from "lucide-react";
import type { AlarmDTO } from "./types";
import { useLanguage } from "@/contexts/language-context";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale, enUS, es, ja, ko, zhCN } from "date-fns/locale";

interface AlarmCardProps {
  alarm: AlarmDTO;
  onAcknowledge: (alarmId: number) => void;
  onResolve: (alarmId: number) => void;
  isLoading?: boolean;
}

const localeMap = {
  id: idLocale,
  en: enUS,
  es: es,
  ja: ja,
  ko: ko,
  zh: zhCN,
};

export function AlarmCard({
  alarm,
  onAcknowledge,
  onResolve,
  isLoading,
}: AlarmCardProps) {
  const { t, language } = useLanguage();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-red-100 text-red-700";
      case "ACKED":
        return "bg-yellow-100 text-yellow-700";
      case "RESOLVED":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getAlarmIcon = (type: string) => {
    switch (type) {
      case "gas_leak":
        return <Wind className="h-5 w-5" />;
      case "flame_detected":
        return <Flame className="h-5 w-5" />;
      case "bin_full":
        return <Trash2 className="h-5 w-5" />;
      case "voltage_abnormal":
      case "overcurrent":
        return <Zap className="h-5 w-5" />;
      case "sensor_malfunction":
        return <Activity className="h-5 w-5" />;
      case "energy_anomaly":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getRelativeTime = (dateString: string) => {
    try {
      const locale = localeMap[language as keyof typeof localeMap] || enUS;
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale,
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="rounded-xl border-l-4 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`p-2 rounded-lg ${getSeverityColor(alarm.severity)}`}
            >
              {getAlarmIcon(alarm.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {t(
                    `alarmType${alarm.type
                      .split("_")
                      .map(
                        (word: string) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase(),
                      )
                      .join("")}`,
                  ) || alarm.type}
                </h3>
                <Badge
                  variant="outline"
                  className={getSeverityColor(alarm.severity)}
                >
                  {t(
                    `severity${alarm.severity.charAt(0).toUpperCase() + alarm.severity.slice(1).toLowerCase()}`,
                  )}
                </Badge>
                <Badge
                  variant="outline"
                  className={getStatusColor(alarm.status)}
                >
                  {t(
                    `alarmStatus${alarm.status.charAt(0).toUpperCase() + alarm.status.slice(1).toLowerCase()}`,
                  )}
                </Badge>
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {alarm.message}
              </p>

              <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getRelativeTime(alarm.triggeredAt)}
                </div>
                <div>
                  {t("device")} #{alarm.deviceId}
                </div>
                <div className="capitalize">
                  {t(
                    `alarmSource${alarm.source.charAt(0).toUpperCase() + alarm.source.slice(1).toLowerCase()}`,
                  )}
                </div>
              </div>

              {alarm.acknowledgedAt && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {t("acknowledgedAt")}: {getRelativeTime(alarm.acknowledgedAt)}
                </div>
              )}

              {alarm.resolvedAt && (
                <div className="text-xs text-green-700 dark:text-green-400 font-medium mt-1">
                  {t("resolvedAt")}: {getRelativeTime(alarm.resolvedAt)}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {alarm.status === "OPEN" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAcknowledge(alarm.id)}
                disabled={isLoading}
                className="whitespace-nowrap border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <CheckCircle2 className="h-3 w-3" />
                {t("acknowledge")}
              </Button>
            )}

            {(alarm.status === "OPEN" || alarm.status === "ACKED") && (
              <Button
                size="sm"
                onClick={() => onResolve(alarm.id)}
                disabled={isLoading}
                className="whitespace-nowrap"
              >
                <CheckCircle2 className="h-3 w-3" />
                {t("resolve")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
