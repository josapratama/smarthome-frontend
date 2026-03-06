"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/language-context";

type Device = { id: number; name?: string | null; status?: boolean | null };
type Release = { id: number; version: string };

type OtaJob = {
  id: number;
  deviceId: number;
  releaseId: number;
  status: string;
  progress: number | null;
  lastError: string | null;
  createdAt?: string;
};

function getMsg(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const rec = payload as Record<string, unknown>;
  if (typeof rec.message === "string") return rec.message;
  return null;
}

async function fetchJobs(deviceId: number): Promise<OtaJob[]> {
  const res = await fetch(`/api/ota/devices/${deviceId}/jobs`, {
    cache: "no-store",
  });
  const payload: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(getMsg(payload) ?? `Failed load jobs (HTTP ${res.status})`);
  }

  const data = (payload as Record<string, unknown>)?.data;
  return (Array.isArray(data) ? data : []) as OtaJob[];
}

export function OtaTriggerPanel({
  devices,
  releases,
}: {
  devices: Device[];
  releases: Release[];
}) {
  const { t } = useLanguage();

  // default selection: first item
  const [deviceId, setDeviceId] = useState<number>(() => devices[0]?.id ?? 0);
  const [releaseId, setReleaseId] = useState<number>(
    () => releases[0]?.id ?? 0,
  );

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const canSubmit = deviceId > 0 && releaseId > 0;

  // ✅ TanStack Query polling OTA jobs
  const jobsQuery = useQuery({
    queryKey: ["ota-jobs", deviceId],
    enabled: deviceId > 0,
    queryFn: () => fetchJobs(deviceId),
    refetchInterval: 5000,
    staleTime: 0,
  });

  // nice: clear messages when switching device/release
  useEffect(() => {
    setErr(null);
    setOk(null);
  }, [deviceId, releaseId]);

  async function trigger() {
    setErr(null);
    setOk(null);
    if (!canSubmit) return;

    setLoading(true);
    try {
      const res = await fetch("/api/ota/trigger", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ deviceId, releaseId }),
      });

      const payload: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          getMsg(payload) ?? `${t("failedTriggerOta")} (HTTP ${res.status})`,
        );
      }

      setOk(t("otaTriggered"));
      await jobsQuery.refetch();
    } catch (e: unknown) {
      setErr(
        e instanceof Error
          ? e.message || t("failedTriggerOta")
          : t("failedTriggerOta"),
      );
    } finally {
      setLoading(false);
    }
  }

  const jobs = jobsQuery.data ?? [];

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="text-sm text-muted-foreground">
            {t("selectDevice")}
          </label>
          <select
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={deviceId}
            onChange={(e) => setDeviceId(Number(e.target.value))}
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                #{d.id} {d.name ? `- ${d.name}` : ""}{" "}
                {d.status ? `(${t("online")})` : `(${t("offline")})`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="text-sm text-muted-foreground">
            {t("selectFirmwareVersion")}
          </label>
          <select
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={releaseId}
            onChange={(e) => setReleaseId(Number(e.target.value))}
          >
            {releases.map((r) => (
              <option key={r.id} value={r.id}>
                #{r.id} - {r.version}
              </option>
            ))}
          </select>
        </div>

        <Button onClick={trigger} disabled={!canSubmit || loading}>
          {loading ? t("triggering") : t("triggerOta")}
        </Button>
      </div>

      {err ? <div className="text-sm text-red-600">{err}</div> : null}
      {ok ? <div className="text-sm text-green-600">{ok}</div> : null}

      {jobsQuery.isError ? (
        <div className="text-sm text-red-600">
          {(jobsQuery.error as Error)?.message ?? t("error")}
        </div>
      ) : null}

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr className="border-b">
              <th className="py-2 pr-4">{t("jobs")}</th>
              <th className="py-2 pr-4">{t("status")}</th>
              <th className="py-2 pr-4">{t("progress")}</th>
              <th className="py-2 pr-4">{t("errorMessage")}</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="border-b">
                <td className="py-2 pr-4">
                  <a
                    className="underline text-muted-foreground hover:text-foreground"
                    href={`/ota/jobs/${j.id}`}
                  >
                    #{j.id}
                  </a>
                </td>
                <td className="py-2 pr-4">{j.status}</td>
                <td className="py-2 pr-4">{j.progress ?? "-"}</td>
                <td className="py-2 pr-4">{j.lastError ?? "-"}</td>
              </tr>
            ))}

            {jobsQuery.isLoading ? (
              <tr>
                <td colSpan={4} className="py-6 text-muted-foreground">
                  {t("loading")}
                </td>
              </tr>
            ) : null}

            {!jobsQuery.isLoading && jobs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-muted-foreground">
                  {t("noJobsYet")}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
