"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, AlertCircle } from "lucide-react";
import type { TelemetryDTO } from "@/lib/api/dto/telemetry.dto";
import { useTranslation } from "@/hooks/use-translation";
import type { TableColumn } from "../lib/sensor-detector";

interface HistoryTableProps {
  history: TelemetryDTO[];
  columns: TableColumn[];
  isLoading: boolean;
}

function fmtDateTime(v?: string | null): string {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString("id-ID");
}

export function HistoryTable({
  history,
  columns,
  isLoading,
}: HistoryTableProps) {
  const { t } = useTranslation();

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t("recentReadings")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{t("noTelemetryData")}</p>
            <p className="text-sm mt-1">{t("telemetryWillAppear")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">{t("time")}</th>
                  {columns.map((col) => (
                    <th key={col.key} className="text-right p-2">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="p-2 whitespace-nowrap">
                      {fmtDateTime(item.timestamp)}
                    </td>
                    {columns.map((col) => {
                      const raw = item[col.key];
                      let display = "-";
                      if (raw != null) {
                        if (typeof raw === "number") {
                          display =
                            `${raw.toFixed(col.decimals)} ${col.unit}`.trim();
                        } else if (typeof raw === "boolean") {
                          display = raw ? t("yes") : t("no");
                        } else {
                          display = String(raw);
                        }
                      }
                      return (
                        <td key={col.key} className="text-right p-2 font-mono">
                          {display}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
