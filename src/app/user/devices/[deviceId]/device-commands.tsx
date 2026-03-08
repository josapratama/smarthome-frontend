"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Terminal,
  Send,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Power,
  RotateCw,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { commandsApi, Command, CommandStatus } from "@/lib/api/commands";
import { toast } from "sonner";

interface DeviceCommandsProps {
  deviceId: number;
}

export default function DeviceCommands({ deviceId }: DeviceCommandsProps) {
  const { t } = useTranslation();
  const [commands, setCommands] = useState<Command[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadCommands();
    const interval = setInterval(loadCommands, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, [deviceId, statusFilter]);

  const loadCommands = async () => {
    try {
      const filter =
        statusFilter !== "all"
          ? { status: statusFilter as CommandStatus }
          : undefined;
      const data = await commandsApi.list(deviceId, filter);
      setCommands(data);
    } catch (error: any) {
      console.error("Failed to load commands:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickCommand = async (action: string) => {
    try {
      switch (action) {
        case "on":
          await commandsApi.turnOn(deviceId);
          break;
        case "off":
          await commandsApi.turnOff(deviceId);
          break;
        case "reboot":
          await commandsApi.reboot(deviceId);
          break;
      }
      toast.success(t("commandSent"));
      loadCommands();
    } catch (error: any) {
      toast.error(error.message || t("failedToSendCommand"));
    }
  };

  const handleRetry = async (commandId: number) => {
    try {
      await commandsApi.retry(deviceId, commandId);
      toast.success(t("commandRetried"));
      loadCommands();
    } catch (error: any) {
      toast.error(error.message || t("failedToRetryCommand"));
    }
  };

  const getStatusIcon = (status: CommandStatus) => {
    switch (status) {
      case "ACKED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "FAILED":
      case "TIMEOUT":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "SENT":
        return <Send className="h-4 w-4 text-blue-500" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: CommandStatus) => {
    const variants: Record<CommandStatus, any> = {
      ACKED: "default",
      FAILED: "destructive",
      TIMEOUT: "destructive",
      SENT: "secondary",
      PENDING: "outline",
    };

    return (
      <Badge variant={variants[status] || "outline"} className="gap-1">
        {getStatusIcon(status)}
        {t(status.toLowerCase())}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Commands */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            {t("quickCommands")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleQuickCommand("on")}
              variant="outline"
              className="gap-2"
            >
              <Power className="h-4 w-4" />
              {t("turnOn")}
            </Button>
            <Button
              onClick={() => handleQuickCommand("off")}
              variant="outline"
              className="gap-2"
            >
              <Power className="h-4 w-4" />
              {t("turnOff")}
            </Button>
            <Button
              onClick={() => handleQuickCommand("reboot")}
              variant="outline"
              className="gap-2"
            >
              <RotateCw className="h-4 w-4" />
              {t("reboot")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Command History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("commandHistory")}</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all")}</SelectItem>
                  <SelectItem value="PENDING">{t("pending")}</SelectItem>
                  <SelectItem value="SENT">{t("sent")}</SelectItem>
                  <SelectItem value="ACKED">{t("acked")}</SelectItem>
                  <SelectItem value="FAILED">{t("failed")}</SelectItem>
                </SelectContent>
              </Select>
              <Button size="icon" variant="outline" onClick={loadCommands}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {commands.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Terminal className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t("noCommandsFound")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {commands.map((command) => (
                <div
                  key={command.id}
                  className="flex items-start justify-between p-3 rounded-lg border"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{command.type}</span>
                      {getStatusBadge(command.status)}
                    </div>
                    <pre className="text-xs text-muted-foreground bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(command.payload, null, 2)}
                    </pre>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {new Date(command.createdAt).toLocaleString()}
                      </span>
                      {command.ackedAt && (
                        <span>
                          {t("acked")}:{" "}
                          {new Date(command.ackedAt).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    {command.lastError && (
                      <p className="text-xs text-red-500">
                        {t("error")}: {command.lastError}
                      </p>
                    )}
                  </div>
                  {(command.status === "FAILED" ||
                    command.status === "TIMEOUT") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRetry(command.id)}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      {t("retry")}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
