"use client";

import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle,
  Wind,
  Flame,
  Trash2,
  Zap,
  Activity,
  Home as HomeIcon,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { AlarmSeverityBadge, AlarmStatusBadge } from "./alarm-severity-badge";
import type { AlarmDTO } from "@/lib/api/dto/alarm.dto";

interface AlarmCardProps {
  alarm: AlarmDTO;
  onAcknowledge: (alarm: AlarmDTO) => void;
  onResolve: (alarm: AlarmDTO) => void;
}

function getAlarmIcon(type: string) {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("gas") || lowerType.includes("leak")) {
    return <Wind className="h-6 w-6 text-orange-500" />;
  }
  if (lowerType.includes("flame") || lowerType.includes("fire")) {
    return <Flame className="h-6 w-6 text-red-500" />;
  }
  if (lowerType.includes("bin") || lowerType.includes("trash")) {
    return <Trash2 className="h-6 w-6 text-yellow-500" />;
  }
  if (lowerType.includes("voltage") || lowerType.includes("current")) {
    return <Zap className="h-6 w-6 text-blue-500" />;
  }
  if (lowerType.includes("anomaly") || lowerType.includes("ml")) {
    return <Activity className="h-6 w-6 text-purple-500" />;
  }
  return <AlertTriangle className="h-6 w-6 text-red-500" />;
}

export function AlarmCard({ alarm, onAcknowledge, onResolve }: AlarmCardProps) {
  const { t } = useTranslation();

  const typeMap: Record<string, string> = {
    GAS_LEAK: t("alarmTypeGasLeak"),
    FLAME_DETECTED: t("alarmTypeFlameDetected"),
    BIN_FULL: t("alarmTypeBinFull"),
    VOLTAGE_ABNORMAL: t("alarmTypeVoltageAbnormal"),
    OVERCURRENT: t("alarmTypeOvercurrent"),
    SENSOR_MALFUNCTION: t("alarmTypeSensorMalfunction"),
    ENERGY_ANOMALY: t("alarmTypeEnergyAnomaly"),
    ML_DETECTION: t("alarmTypeMlDetection"),
  };

  const alarmTypeLabel = typeMap[alarm.type] || alarm.type;

  return (
    <div
      className={`p-4 rounded-lg border transition-colors ${
        alarm.severity === "CRITICAL"
          ? "border-red-500 bg-red-50 dark:bg-red-950/20"
          : alarm.severity === "HIGH"
            ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
            : "hover:bg-muted/50"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            alarm.severity === "CRITICAL"
              ? "bg-red-500/10"
              : alarm.severity === "HIGH"
                ? "bg-orange-500/10"
                : "bg-primary/10"
          }`}
        >
          {getAlarmIcon(alarm.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h4 className="font-semibold">{alarmTypeLabel}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {alarm.message}
              </p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <AlarmSeverityBadge severity={alarm.severity} />
              <AlarmStatusBadge status={alarm.status} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3">
            <div className="flex items-center gap-1">
              <HomeIcon className="h-3 w-3" />
              <span>
                {t("home")} #{alarm.homeId}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              <span>
                {t("device")} #{alarm.deviceId}
              </span>
            </div>
            <div>
              {new Date(alarm.triggeredAt).toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>
            {alarm.acknowledgedAt && (
              <div className="text-blue-600">
                {t("acknowledgedAt")}:{" "}
                {new Date(alarm.acknowledgedAt).toLocaleString("id-ID", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </div>
            )}
            {alarm.resolvedAt && (
              <div className="text-green-600">
                {t("resolvedAt")}:{" "}
                {new Date(alarm.resolvedAt).toLocaleString("id-ID", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </div>
            )}
          </div>

          {alarm.status !== "RESOLVED" && (
            <div className="flex gap-2 mt-3">
              {alarm.status === "OPEN" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAcknowledge(alarm)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {t("acknowledge")}
                </Button>
              )}
              <Button
                size="sm"
                variant="default"
                onClick={() => onResolve(alarm)}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                {t("resolve")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
