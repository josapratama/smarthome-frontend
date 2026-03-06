"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  TerminalSquare,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { SendCommandDialog } from "@/components/admin/send-command-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface Command {
  id: number;
  deviceId: number;
  deviceName: string | null;
  type: string;
  payload: any;
  status: "PENDING" | "SENT" | "ACKED" | "FAILED" | "TIMEOUT";
  ackedAt: string | null;
  lastError: string | null;
  requestedBy: number | null;
  requesterUsername: string | null;
  source: string;
  correlationId: string;
  createdAt: string;
  updatedAt: string;
}

export default function CommandsPage() {
  const { t } = useLanguage();
  const [commands, setCommands] = useState<Command[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadCommands();
  }, []);

  const loadCommands = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/commands");
      const data = await res.json();
      if (res.ok) {
        setCommands(data.data || []);
      } else {
        toast.error(data.error || t("failedLoadCommands"));
      }
    } catch (error) {
      console.error("Error loading commands:", error);
      toast.error(t("failedLoadCommands"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCommands();
    setIsRefreshing(false);
  };

  const getStatusBadge = (status: Command["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {t("pending")}
          </Badge>
        );
      case "SENT":
        return (
          <Badge variant="default" className="gap-1">
            {t("sent")}
          </Badge>
        );
      case "ACKED":
        return (
          <Badge variant="default" className="gap-1 bg-green-500">
            <CheckCircle className="h-3 w-3" />
            {t("acked")}
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            {t("failed")}
          </Badge>
        );
      case "TIMEOUT":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            {t("timeout")}
          </Badge>
        );
    }
  };

  const stats = {
    total: commands.length,
    pending: commands.filter((c) => c.status === "PENDING").length,
    successful: commands.filter((c) => c.status === "ACKED").length,
    failed: commands.filter(
      (c) => c.status === "FAILED" || c.status === "TIMEOUT",
    ).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("commands")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("monitorCommands")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("sendCommand")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("totalCommands")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("pending")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div className="text-3xl font-semibold">{stats.pending}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("successful")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="text-3xl font-semibold">{stats.successful}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("failed")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div className="text-3xl font-semibold">{stats.failed}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t("recentCommands")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : commands.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TerminalSquare className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">
                {t("noCommandsFound")}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("commandsWillAppear")}
              </p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                {t("sendFirstCommand")}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>{t("deviceName")}</TableHead>
                    <TableHead>{t("commandType")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead>{t("username")}</TableHead>
                    <TableHead>{t("createdAt")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commands.map((command) => (
                    <TableRow key={command.id}>
                      <TableCell className="font-mono text-sm">
                        {t("commandId")}: {command.id}
                      </TableCell>
                      <TableCell>
                        {command.deviceName ||
                          `${t("device")} ${command.deviceId}`}
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-2 py-1 text-xs">
                          {command.type}
                        </code>
                      </TableCell>
                      <TableCell>{getStatusBadge(command.status)}</TableCell>
                      <TableCell>{command.requesterUsername || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(command.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <SendCommandDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadCommands}
      />
    </div>
  );
}
