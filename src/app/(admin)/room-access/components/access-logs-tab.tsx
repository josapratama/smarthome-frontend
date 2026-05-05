"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import { useTranslation } from "@/hooks/use-translation";

interface RoomAccessLog {
  id: number;
  roomId: number;
  userId: number;
  action: string;
  deviceId: number | null;
  channelId: number | null;
  allowed: boolean;
  reason: string | null;
  ipAddress: string | null;
  timestamp: string;
  room: {
    name: string;
  };
  user: {
    username: string;
  };
  device?: {
    deviceName: string;
  };
}

export default function RoomAccessLogsTab() {
  const [logs, setLogs] = useState<RoomAccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "allowed" | "denied">("all");
  const { toast } = useToast();
  const { t } = useTranslation();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await apiFetchBrowser<{ data: RoomAccessLog[] }>(
        "/api/v1/room-access/logs",
      );
      setLogs(response.data || []);
    } catch (error: any) {
      // Silently handle 404 errors (endpoint not implemented yet)
      if ((error as any).status !== 404) {
        toast({
          title: t("error"),
          description: (error as any).message || t("failedFetchAccessLogs"),
          variant: "destructive",
        });
      }
      console.log("Access logs fetch error:", error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filter === "allowed") return log.allowed;
    if (filter === "denied") return !log.allowed;
    return true;
  });

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            {t("all")}
          </Button>
          <Button
            variant={filter === "allowed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("allowed")}
          >
            {t("allowed")}
          </Button>
          <Button
            variant={filter === "denied" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("denied")}
          >
            {t("denied")}
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {t("refresh")}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("user")}</TableHead>
              <TableHead>{t("room")}</TableHead>
              <TableHead>{t("action")}</TableHead>
              <TableHead>{t("device")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("reason")}</TableHead>
              <TableHead>{t("ipAddress")}</TableHead>
              <TableHead>{t("timestamp")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  {t("noAccessLogsFound")}
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {log.user.username}
                  </TableCell>
                  <TableCell>{log.room.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.device?.deviceName || "-"}
                  </TableCell>
                  <TableCell>
                    {log.allowed ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm">{t("allowed")}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-destructive">
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm">{t("denied")}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {log.reason || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {log.ipAddress || t("unknown")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(log.timestamp), "MMM dd, HH:mm:ss")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
