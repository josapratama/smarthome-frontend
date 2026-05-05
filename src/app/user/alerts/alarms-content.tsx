"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Bell,
  XCircle,
  CheckCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { PageHeader } from "@/components/ui/page-header";
import { useAlarms } from "./hooks/use-alarms";
import { AlarmCard } from "./components/alarm-card";
import { AlarmFilters } from "./components/alarm-filters";
import { AlarmStats } from "./components/alarm-stats";

export default function AlarmsContent() {
  const { t } = useTranslation();
  const {
    alarms,
    filteredAlarms,
    homes,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    severityFilter,
    setSeverityFilter,
    homeFilter,
    setHomeFilter,
    filterSectionRef,
    loadData,
    handleAcknowledge,
    handleResolve,
    openCount,
    criticalCount,
    ackedCount,
  } = useAlarms();

  return (
    <div className="space-y-6">
      <PageHeader
        stats={[
          {
            label: t("totalAlarms"),
            value: alarms.length,
            icon: AlertTriangle,
            color: "text-red-500",
          },
          {
            label: t("open"),
            value: openCount,
            icon: XCircle,
            color: "text-red-600",
          },
          {
            label: t("acknowledged"),
            value: ackedCount,
            icon: CheckCircle,
            color: "text-blue-600",
          },
          {
            label: t("critical"),
            value: criticalCount,
            icon: AlertCircle,
            color: "text-orange-600",
          },
        ]}
        actions={
          <Button
            variant="outline"
            size="icon"
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        }
      />

      {criticalCount > 0 && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100">
                  {t("criticalAlertsActive")}
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {criticalCount} {t("criticalAlertsCount")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <AlarmStats
        total={alarms.length}
        open={openCount}
        acked={ackedCount}
        critical={criticalCount}
      />

      <AlarmFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        severityFilter={severityFilter}
        onSeverityChange={setSeverityFilter}
        homeFilter={homeFilter}
        onHomeChange={setHomeFilter}
        homes={homes}
        filterSectionRef={filterSectionRef}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            {t("recentAlarms")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : filteredAlarms.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚨</div>
              <h3 className="text-lg font-semibold mb-2">
                {alarms.length === 0
                  ? t("noAlarmsFound")
                  : t("noAlarmsMatchSearch")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {alarms.length === 0
                  ? t("securityAlarmsWillAppear")
                  : t("tryDifferentSearch")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlarms.map((alarm) => (
                <AlarmCard
                  key={alarm.id}
                  alarm={alarm}
                  onAcknowledge={handleAcknowledge}
                  onResolve={handleResolve}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
