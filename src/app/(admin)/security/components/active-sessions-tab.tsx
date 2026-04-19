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
import { RefreshCw, Trash2, Monitor, Smartphone, Tablet } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api } from "@/lib/api/client/axios";
import { useTranslation } from "@/hooks/use-translation";

interface UserSession {
  id: number;
  userId: number;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
  user: {
    username: string;
    email: string;
  };
}

export default function ActiveSessionsTab() {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokeId, setRevokeId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/v1/auth/sessions");
      setSessions(response.data.data || []);
    } catch (error: any) {
      // Silently handle 404 errors (endpoint not implemented yet)
      if (error.response?.status !== 404) {
        toast({
          title: t("error"),
          description:
            error.response?.data?.error || t("failedToFetchSessions"),
          variant: "destructive",
        });
      }
      console.log("Sessions fetch error:", error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const revokeSession = async (sessionId: number) => {
    try {
      await api.delete(`/v1/auth/sessions/${sessionId}`);
      toast({
        title: t("success"),
        description: t("sessionRevokedSuccess"),
      });
      fetchSessions();
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.response?.data?.error || t("failedToRevokeSession"),
        variant: "destructive",
      });
    } finally {
      setRevokeId(null);
    }
  };

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return <Monitor className="h-4 w-4" />;
    const ua = userAgent.toLowerCase();
    if (
      ua.includes("mobile") ||
      ua.includes("android") ||
      ua.includes("iphone")
    ) {
      return <Smartphone className="h-4 w-4" />;
    }
    if (ua.includes("tablet") || ua.includes("ipad")) {
      return <Tablet className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const activeSessions = sessions.filter(
    (s) => !s.revokedAt && new Date(s.expiresAt) > new Date(),
  );

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
    <>
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{t("activeSessions")}</h3>
            <p className="text-sm text-muted-foreground">
              {activeSessions.length} {t("activeSessionsCount")}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchSessions}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("refresh")}
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("user")}</TableHead>
                <TableHead>{t("device")}</TableHead>
                <TableHead>{t("ipAddress")}</TableHead>
                <TableHead>{t("created")}</TableHead>
                <TableHead>{t("expires")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeSessions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground"
                  >
                    {t("noActiveSessionsFound")}
                  </TableCell>
                </TableRow>
              ) : (
                activeSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {session.user.username}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {session.user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(session.userAgent)}
                        <span className="text-sm">
                          {session.userAgent || t("unknown")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {session.ipAddress || t("unknown")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(session.createdAt), "MMM dd, HH:mm")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(session.expiresAt), "MMM dd, HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        {t("active")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRevokeId(session.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AlertDialog
        open={revokeId !== null}
        onOpenChange={() => setRevokeId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("revokeSession")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("revokeSessionConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => revokeId && revokeSession(revokeId)}
            >
              {t("revoke")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
