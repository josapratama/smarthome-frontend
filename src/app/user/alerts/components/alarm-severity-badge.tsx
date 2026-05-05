"use client";

import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  AlertCircle,
  Bell,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { AlarmSeverity, AlarmStatus } from "@/lib/api/dto/alarm.dto";

interface AlarmSeverityBadgeProps {
  severity: AlarmSeverity;
}

interface AlarmStatusBadgeProps {
  status: AlarmStatus;
}

export function AlarmSeverityBadge({ severity }: AlarmSeverityBadgeProps) {
  const { t } = useTranslation();

  switch (severity) {
    case "CRITICAL":
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {t("critical")}
        </Badge>
      );
    case "HIGH":
      return (
        <Badge className="bg-orange-600 hover:bg-orange-700 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {t("high")}
        </Badge>
      );
    case "MEDIUM":
      return (
        <Badge className="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-1">
          <Bell className="h-3 w-3" />
          {t("medium")}
        </Badge>
      );
    case "LOW":
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Bell className="h-3 w-3" />
          {t("low")}
        </Badge>
      );
    default:
      return null;
  }
}

export function AlarmStatusBadge({ status }: AlarmStatusBadgeProps) {
  const { t } = useTranslation();

  switch (status) {
    case "OPEN":
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          {t("open")}
        </Badge>
      );
    case "ACKED":
      return (
        <Badge className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          {t("acknowledged")}
        </Badge>
      );
    case "RESOLVED":
      return (
        <Badge className="bg-green-600 hover:bg-green-700 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          {t("resolved")}
        </Badge>
      );
    default:
      return null;
  }
}
