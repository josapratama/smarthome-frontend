"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client.browser";
import type { TelemetryDTO } from "@/lib/api/dto/telemetry.dto";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

function fmtDateTime(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
}

function formatValue(value: number | null, unit?: string) {
  if (value === null) return "-";
  return `${value}${unit ? ` ${unit}` : ""}`;
}

export function TelemetryClient({ deviceId }: { deviceId: number }) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const q = useQuery({
    queryKey: qk.devices.telemetry(deviceId),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      params.set("limit", "100");

      const url = params.toString()
        ? `/api/v1/devices/${deviceId}/telemetry?${params}`
        : `/api/v1/devices/${deviceId}/telemetry`;

      const payload = await apiFetchBrowser<{ data: TelemetryDTO[] }>(url);
      return payload.data ?? [];
    },
    refetchInterval: 10_000, // Refresh every 10 seconds
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/devices">
            <ArrowLeft className="h-4 w-4" />
            Back to Devices
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Device Telemetry</h1>
          <p className="text-sm text-muted-foreground">
            Telemetry data for Device #{deviceId}.
          </p>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <Input
            type="datetime-local"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="sm:w-auto"
            placeholder="From"
          />
          <Input
            type="datetime-local"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="sm:w-auto"
            placeholder="To"
          />
          <Button
            variant="outline"
            onClick={() => q.refetch()}
            disabled={q.isFetching}
          >
            Refresh
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Telemetry Data ({q.data?.length || 0} records)
          </CardTitle>
        </CardHeader>

        <CardContent>
          {q.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : q.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {(q.error as Error).message}
            </div>
          ) : !q.data || q.data.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No telemetry data found for this device.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Timestamp</th>
                    <th className="text-left p-2">Current (A)</th>
                    <th className="text-left p-2">Gas (PPM)</th>
                    <th className="text-left p-2">Flame</th>
                    <th className="text-left p-2">Bin Level (%)</th>
                    <th className="text-left p-2">Power (W)</th>
                    <th className="text-left p-2">Energy (kWh)</th>
                  </tr>
                </thead>
                <tbody>
                  {q.data.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-mono text-xs">
                        {fmtDateTime(record.timestamp)}
                      </td>
                      <td className="p-2">
                        {formatValue(record.current, "A")}
                      </td>
                      <td className="p-2">
                        {formatValue(record.gasPpm, "PPM")}
                      </td>
                      <td className="p-2">
                        {record.flame === null
                          ? "-"
                          : record.flame
                            ? "🔥"
                            : "✅"}
                      </td>
                      <td className="p-2">
                        {formatValue(record.binLevel, "%")}
                      </td>
                      <td className="p-2">{formatValue(record.powerW, "W")}</td>
                      <td className="p-2">
                        {formatValue(record.energyKwh, "kWh")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {q.isFetching && !q.isLoading ? (
            <div className="mt-3 text-xs text-muted-foreground">Updating…</div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
