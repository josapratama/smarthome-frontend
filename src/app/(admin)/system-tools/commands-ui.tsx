"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  TerminalSquare,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Search,
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

export default function CommandsUI() {
  const { t } = useLanguage();
  const [commands, setCommands] = useState<Command[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredCommands = commands.filter((command) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      command.type.toLowerCase().includes(search) ||
      command.deviceName?.toLowerCase().includes(search) ||
      String(command.id).includes(search) ||
      String(command.deviceId).includes(search)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchCommands")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              {t("sendCommand")}
            </Button>
          </div>
        </CardContent>
      </Card>

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
                  {filteredCommands.map((command) => (
                    <TableRow key={command.id}>
                      <TableCell className="font-mono text-sm">
                        #{command.id}
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
