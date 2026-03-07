"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { useLanguage } from "@/contexts/language-context";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Home as HomeIcon,
  Power,
  TrendingUp,
  Zap,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";

interface OverviewData {
  users: number;
  homes: number;
  devices: number;
  onlineDevices: number;
  offlineDevices: number;
  pendingInvitesCount: number;
  homesList: Array<{
    id: number;
    name: string;
    city?: string | null;
    roleInHome: string;
    devicesOnline: number;
    devicesOffline: number;
    openAlarms: number;
  }>;
}

interface DashboardClientProps {
  data?: OverviewData;
  error?: { status?: number; payload?: unknown };
}

function extractMsg(payload: unknown): string | null {
  if (typeof payload === "string") return payload;
  if (!payload || typeof payload !== "object") return null;

  const p = payload as Record<string, unknown>;
  if (typeof p.message === "string") return p.message;
  if (typeof p.error === "string") return p.error;
  return null;
}

function ErrorView({
  status,
  payload,
  t,
}: {
  status?: number;
  payload?: unknown;
  t: any;
}) {
  const msg = extractMsg(payload);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{t("failedLoadDashboard")}</h1>
        <p className="text-sm text-muted-foreground">
          {status ? `HTTP ${status}` : t("unknownError")}
          {msg ? ` • ${msg}` : ""}
        </p>
      </div>

      {payload !== undefined ? (
        <pre className="text-xs whitespace-pre-wrap rounded-xl border bg-muted/30 p-4">
          {typeof payload === "string"
            ? payload
            : JSON.stringify(payload, null, 2)}
        </pre>
      ) : null}

      {status === 401 ? (
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/login">{t("goToLogin")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">{t("home")}</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default function DashboardClient({ data, error }: DashboardClientProps) {
  const { t } = useLanguage();

  if (error)
    return <ErrorView status={error.status} payload={error.payload} t={t} />;
  if (!data) return <ErrorView t={t} />;

  // Calculate system health
  const totalDevices = data.devices;
  const healthPercentage =
    totalDevices > 0
      ? Math.round((data.onlineDevices / totalDevices) * 100)
      : 0;
  const criticalAlarms = data.homesList.reduce(
    (sum, h) => sum + h.openAlarms,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <PageHeader
        stats={[
          {
            label: t("totalHomes"),
            value: data.homes,
            icon: HomeIcon,
            color: "text-blue-500",
          },
          {
            label: t("totalDevices"),
            value: data.devices,
            icon: Zap,
            color: "text-purple-500",
          },
          {
            label: t("onlineDevices"),
            value: data.onlineDevices,
            icon: Wifi,
            color: "text-green-500",
          },
          {
            label: t("offlineDevices"),
            value: data.offlineDevices,
            icon: WifiOff,
            color: "text-gray-500",
          },
        ]}
        actions={
          typeof data.pendingInvitesCount === "number" &&
          data.pendingInvitesCount > 0 ? (
            <Link href="/invites">
              <div className="inline-flex items-center gap-2 rounded-full border bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 px-3 py-1.5 text-sm cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors">
                <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-muted-foreground">
                  {t("pendingInvites")}
                </span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {data.pendingInvitesCount}
                </span>
              </div>
            </Link>
          ) : undefined
        }
      />

      {/* System Health Alert */}
      {healthPercentage < 80 && totalDevices > 0 ? (
        <Card className="rounded-2xl shadow-sm border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-amber-900 dark:text-amber-100">
                  {t("systemHealthWarning")}
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  {data.offlineDevices} {t("devicesOffline")} -{" "}
                  {t("checkDeviceConnections")}
                </p>
              </div>
              <Link href="/monitoring">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-300 dark:border-amber-700"
                >
                  {t("viewDetails")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Critical Alarms Alert */}
      {criticalAlarms > 0 ? (
        <Card className="rounded-2xl shadow-sm border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-900 dark:text-red-100">
                  {t("criticalAlertsActive")}
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {criticalAlarms} {t("openAlarms")} {t("requireAttention")}
                </p>
              </div>
              <Link href="/alarms">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 dark:border-red-700"
                >
                  {t("viewAlarms")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* System Health Card */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            {t("systemHealth")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("deviceConnectivity")}
              </span>
              <span className="text-2xl font-semibold">
                {healthPercentage}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  healthPercentage >= 90
                    ? "bg-green-500"
                    : healthPercentage >= 70
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${healthPercentage}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <div className="text-2xl font-semibold text-green-600 dark:text-green-400">
                  {data.onlineDevices}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("online")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-red-600 dark:text-red-400">
                  {data.offlineDevices}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("offline")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-amber-600 dark:text-amber-400">
                  {criticalAlarms}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("alarms")}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t("quickActions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/devices" className="block">
              <Button
                variant="outline"
                className="w-full h-auto py-3 sm:py-4 flex-col gap-1 sm:gap-2"
                size="sm"
              >
                <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">{t("devices")}</span>
              </Button>
            </Link>
            <Link href="/monitoring" className="block">
              <Button
                variant="outline"
                className="w-full h-auto py-3 sm:py-4 flex-col gap-1 sm:gap-2"
                size="sm"
              >
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">{t("monitoring")}</span>
              </Button>
            </Link>
            <Link href="/alarms" className="block">
              <Button
                variant="outline"
                className="w-full h-auto py-3 sm:py-4 flex-col gap-1 sm:gap-2"
                size="sm"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">{t("alarms")}</span>
              </Button>
            </Link>
            <Link href="/energy" className="block">
              <Button
                variant="outline"
                className="w-full h-auto py-3 sm:py-4 flex-col gap-1 sm:gap-2"
                size="sm"
              >
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">{t("energy")}</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Homes List */}
      {Array.isArray(data.homesList) && data.homesList.length > 0 ? (
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t("myHomes")}</CardTitle>
              <Link href="/homes">
                <Button variant="ghost" size="sm">
                  {t("viewAll")}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              {data.homesList.slice(0, 6).map((h) => (
                <Link key={h.id} href={`/homes/${h.id}`}>
                  <div className="rounded-xl border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          {h.name}
                          {h.roleInHome === "OWNER" && (
                            <Badge variant="secondary" className="text-xs">
                              {t("owner")}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {h.city ?? "—"}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        #{h.id}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border px-2 py-1 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                        {t("online")}: <b>{h.devicesOnline}</b>
                      </span>
                      <span className="rounded-full border px-2 py-1 flex items-center gap-1">
                        <Power className="h-3 w-3 text-muted-foreground" />
                        {t("offline")}: <b>{h.devicesOffline}</b>
                      </span>
                      {h.openAlarms > 0 && (
                        <span className="rounded-full border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-2 py-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                          {t("alarms")}:{" "}
                          <b className="text-red-600 dark:text-red-400">
                            {h.openAlarms}
                          </b>
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
