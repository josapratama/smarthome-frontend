"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";

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

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("overview")}</h1>
          <p className="text-sm text-muted-foreground">{t("systemOverview")}</p>
        </div>

        {typeof data.pendingInvitesCount === "number" ? (
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/30 px-3 py-1 text-sm">
            <span className="text-muted-foreground">{t("pendingInvites")}</span>
            <span className="font-semibold">{data.pendingInvitesCount}</span>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Stat title={t("users")} value={data.users} />
        <Stat title={t("homes")} value={data.homes} />
        <Stat title={t("devices")} value={data.devices} />
        <Stat title={t("online")} value={data.onlineDevices} />
        <Stat title={t("offline")} value={data.offlineDevices} />
      </div>

      {Array.isArray(data.homesList) && data.homesList.length > 0 ? (
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{t("myHomes")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              {data.homesList.slice(0, 6).map((h) => (
                <div key={h.id} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{h.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {h.city ?? "—"} • {h.roleInHome}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">#{h.id}</div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border px-2 py-1">
                      {t("online")}: <b>{h.devicesOnline}</b>
                    </span>
                    <span className="rounded-full border px-2 py-1">
                      {t("offline")}: <b>{h.devicesOffline}</b>
                    </span>
                    <span className="rounded-full border px-2 py-1">
                      {t("openAlarms")}: <b>{h.openAlarms}</b>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
