"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  AlertCircle,
  Flame,
  Wind,
  Trash2,
  Zap,
  Activity,
  Home as HomeIcon,
  Filter,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { homesApi } from "@/lib/api/services/homes";
import {
  listHomeAlarms,
  acknowledgeAlarm,
  resolveAlarm,
} from "@/lib/api/services/alarms";
import { PageHeader } from "@/components/ui/page-header";
import type {
  AlarmDTO,
  AlarmStatus,
  AlarmSeverity,
} from "@/lib/api/dto/alarm.dto";

export default function AlarmsContent() {
  const { t } = useTranslation();
  const [alarms, setAlarms] = useState<AlarmDTO[]>([]);
  const [filteredAlarms, setFilteredAlarms] = useState<AlarmDTO[]>([]);
  const [homes, setHomes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [homeFilter, setHomeFilter] = useState<string>("all");

  const filterSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [homeFilter]);

  useEffect(() => {
    filterAlarms();
  }, [alarms, searchQuery, statusFilter, severityFilter]);

  useEffect(() => {
    const handleRefresh = () => {
      loadData();
    };

    const handleFilter = () => {
      if (filterSectionRef.current) {
        filterSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        filterSectionRef.current.classList.add(
          "ring-2",
          "ring-primary",
          "ring-offset-2",
        );
        setTimeout(() => {
          filterSectionRef.current?.classList.remove(
            "ring-2",
            "ring-primary",
            "ring-offset-2",
          );
        }, 2000);
      }
    };

    const handleSearch = () => {
      let searchInput: HTMLInputElement | null = null;

      if (filterSectionRef.current) {
        searchInput = filterSectionRef.current.querySelector(
          'input[type="text"]',
        ) as HTMLInputElement;
      }

      if (!searchInput) {
        searchInput = document.querySelector(
          'input[type="text"]',
        ) as HTMLInputElement;
      }

      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    };

    window.addEventListener("topbar-refresh", handleRefresh);
    window.addEventListener("topbar-filter", handleFilter);
    window.addEventListener("topbar-search", handleSearch);

    return () => {
      window.removeEventListener("topbar-refresh", handleRefresh);
      window.removeEventListener("topbar-filter", handleFilter);
      window.removeEventListener("topbar-search", handleSearch);
    };
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const homesData = await homesApi.list();
      setHomes(homesData);

      let allAlarms: AlarmDTO[] = [];
      if (homeFilter === "all") {
        const alarmsPromises = homesData.map((home) =>
          listHomeAlarms(home.id).catch(() => ({ data: [] })),
        );
        const alarmsResults = await Promise.all(alarmsPromises);
        allAlarms = alarmsResults.flatMap((result) => result.data || []);
      } else {
        const result = await listHomeAlarms(parseInt(homeFilter));
        allAlarms = result.data || [];
      }

      allAlarms.sort(
        (a, b) =>
          new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime(),
      );

      setAlarms(allAlarms);
    } catch (error: any) {
      console.error("Failed to load alarms:", error);
      toast.error(error.message || t("errorLoadingAlarms"));
    } finally {
      setIsLoading(false);
    }
  };

  const filterAlarms = () => {
    let filtered = [...alarms];

    if (searchQuery) {
      filtered = filtered.filter(
        (alarm) =>
          alarm.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          alarm.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          alarm.deviceId.toString().includes(searchQuery),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((alarm) => alarm.status === statusFilter);
    }

    if (severityFilter !== "all") {
      filtered = filtered.filter((alarm) => alarm.severity === severityFilter);
    }

    setFilteredAlarms(filtered);
  };

  const handleAcknowledge = async (alarm: AlarmDTO) => {
    try {
      await acknowledgeAlarm(alarm.homeId, alarm.id);
      toast.success(t("alarmAcknowledged"));
      loadData();
    } catch (error: any) {
      toast.error(error.message || t("failedToAcknowledgeAlarm"));
    }
  };

  const handleResolve = async (alarm: AlarmDTO) => {
    try {
      await resolveAlarm(alarm.homeId, alarm.id);
      toast.success(t("alarmResolved"));
      loadData();
    } catch (error: any) {
      toast.error(error.message || t("failedToResolveAlarm"));
    }
  };

  const getSeverityBadge = (severity: AlarmSeverity) => {
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
    }
  };

  const getStatusBadge = (status: AlarmStatus) => {
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
    }
  };

  const getAlarmIcon = (type: string) => {
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
  };

  const getAlarmTypeLabel = (type: string) => {
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
    return typeMap[type] || type;
  };

  const openCount = alarms.filter((a) => a.status === "OPEN").length;
  const criticalCount = alarms.filter((a) => a.severity === "CRITICAL").length;
  const ackedCount = alarms.filter((a) => a.status === "ACKED").length;

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

      {alarms.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{alarms.length}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t("totalAlarms")}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {openCount}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t("open")}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {ackedCount}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t("acknowledged")}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {criticalCount}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t("critical")}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div ref={filterSectionRef}>
        <Card className="transition-all duration-300">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchAlarms")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder={t("status")} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allStatus")}</SelectItem>
                  <SelectItem value="OPEN">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      {t("open")}
                    </div>
                  </SelectItem>
                  <SelectItem value="ACKED">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      {t("acknowledged")}
                    </div>
                  </SelectItem>
                  <SelectItem value="RESOLVED">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {t("resolved")}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder={t("severity")} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allSeverity")}</SelectItem>
                  <SelectItem value="CRITICAL">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      {t("critical")}
                    </div>
                  </SelectItem>
                  <SelectItem value="HIGH">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      {t("high")}
                    </div>
                  </SelectItem>
                  <SelectItem value="MEDIUM">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-yellow-500" />
                      {t("medium")}
                    </div>
                  </SelectItem>
                  <SelectItem value="LOW">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-gray-500" />
                      {t("low")}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={homeFilter} onValueChange={setHomeFilter}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <HomeIcon className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder={t("filterByHome")} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allHomes")}</SelectItem>
                  {homes.map((home) => (
                    <SelectItem key={home.id} value={home.id.toString()}>
                      <div className="flex items-center gap-2">
                        <HomeIcon className="h-4 w-4" />
                        {home.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

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
                <div
                  key={alarm.id}
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
                          <h4 className="font-semibold">
                            {getAlarmTypeLabel(alarm.type)}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {alarm.message}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          {getSeverityBadge(alarm.severity)}
                          {getStatusBadge(alarm.status)}
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
                            {new Date(alarm.acknowledgedAt).toLocaleString(
                              "id-ID",
                              {
                                dateStyle: "short",
                                timeStyle: "short",
                              },
                            )}
                          </div>
                        )}
                        {alarm.resolvedAt && (
                          <div className="text-green-600">
                            {t("resolvedAt")}:{" "}
                            {new Date(alarm.resolvedAt).toLocaleString(
                              "id-ID",
                              {
                                dateStyle: "short",
                                timeStyle: "short",
                              },
                            )}
                          </div>
                        )}
                      </div>

                      {alarm.status !== "RESOLVED" && (
                        <div className="flex gap-2 mt-3">
                          {alarm.status === "OPEN" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAcknowledge(alarm)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {t("acknowledge")}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleResolve(alarm)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {t("resolve")}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
