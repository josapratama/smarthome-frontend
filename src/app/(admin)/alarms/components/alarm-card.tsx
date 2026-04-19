"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/contexts/language-context";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale, enUS, es, ja, ko, zhCN } from "date-fns/locale";
import type { AlarmDTO } from "../types";
import {
  getSeverityColor,
  getStatusColor,
  getAlarmIcon,
  alarmTypeKey,
  toPascalCase,
} from "../lib/alarm-utils";

const LOCALE_MAP = {
  id: idLocale,
  en: enUS,
  es,
  ja,
  ko,
  zh: zhCN,
};

interface AlarmCardProps {
  alarm: AlarmDTO;
  onAcknowledge: (alarmId: number) => void;
  onResolve: (alarmId: number) => void;
  isLoading?: boolean;
}

export function AlarmCard({
  alarm,
  onAcknowledge,
  onResolve,
  isLoading,
}: AlarmCardProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();

  function getRelativeTime(dateString: string): string {
    try {
      const locale = LOCALE_MAP[language as keyof typeof LOCALE_MAP] ?? enUS;
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale,
      });
    } catch {
      return dateString;
    }
  }

  return (
    <Card className="rounded-xl border-l-4 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Left: icon + info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`p-2 rounded-lg ${getSeverityColor(alarm.severity)}`}
            >
              {getAlarmIcon(alarm.type)}
            </div>

            <div className="flex-1 min-w-0">
              {/* Title + badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {t(alarmTypeKey(alarm.type) as any) || alarm.type}
                </h3>
                <Badge
                  variant="outline"
                  className={getSeverityColor(alarm.severity)}
                >
                  {t(`severity${toPascalCase(alarm.severity)}` as any)}
                </Badge>
                <Badge
                  variant="outline"
                  className={getStatusColor(alarm.status)}
                >
                  {t(`alarmStatus${toPascalCase(alarm.status)}` as any)}
                </Badge>
              </div>

              {/* Message */}
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {alarm.message}
              </p>

              {/* Meta */}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getRelativeTime(alarm.triggeredAt)}
                </span>
                <span>
                  {t("device")} #{alarm.deviceId}
                </span>
                <span className="capitalize">
                  {t(`alarmSource${toPascalCase(alarm.source)}` as any)}
                </span>
              </div>

              {alarm.acknowledgedAt && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {t("acknowledgedAt")}: {getRelativeTime(alarm.acknowledgedAt)}
                </p>
              )}
              {alarm.resolvedAt && (
                <p className="text-xs text-green-700 dark:text-green-400 font-medium mt-1">
                  {t("resolvedAt")}: {getRelativeTime(alarm.resolvedAt)}
                </p>
              )}
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex flex-col gap-2 shrink-0">
            {alarm.status === "OPEN" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAcknowledge(alarm.id)}
                disabled={isLoading}
                className="whitespace-nowrap border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
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
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {t("resolve")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
