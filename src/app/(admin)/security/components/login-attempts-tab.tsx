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
import { RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api/client/axios";
import { useTranslation } from "@/hooks/use-translation";

interface LoginAttempt {
  id: number;
  userId: number | null;
  usernameInput: string | null;
  attemptTime: string;
  ipAddress: string | null;
  isSuccess: boolean;
  failReason: string | null;
  user?: {
    username: string;
    email: string;
  };
}

export default function LoginAttemptsTab() {
  const { t } = useTranslation();
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "success" | "failed">("all");
  const { toast } = useToast();

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/v1/auth/login-attempts");
      setAttempts(response.data.data || []);
    } catch (error: any) {
      // Silently handle 404 errors (endpoint not implemented yet)
      if (error.response?.status !== 404) {
        toast({
          title: t("error"),
          description:
            error.response?.data?.error || t("failedToFetchLoginAttempts"),
          variant: "destructive",
        });
      }
      console.log("Login attempts fetch error:", error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, []);

  const filteredAttempts = attempts.filter((attempt) => {
    if (filter === "success") return attempt.isSuccess;
    if (filter === "failed") return !attempt.isSuccess;
    return true;
  });

  const failedCount = attempts.filter((a) => !a.isSuccess).length;
  const successCount = attempts.filter((a) => a.isSuccess).length;

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
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("totalAttempts")}
              </p>
              <p className="text-2xl font-bold">{attempts.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("successful")}</p>
              <p className="text-2xl font-bold text-green-600">
                {successCount}
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("failed")}</p>
              <p className="text-2xl font-bold text-destructive">
                {failedCount}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        </Card>
      </div>

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
              variant={filter === "success" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("success")}
            >
              {t("success")}
            </Button>
            <Button
              variant={filter === "failed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("failed")}
            >
              {t("failed")}
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAttempts}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("refresh")}
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("username")}</TableHead>
                <TableHead>{t("attemptTime")}</TableHead>
                <TableHead>{t("ipAddress")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("reason")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttempts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    {t("noLoginAttemptsFound")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAttempts.map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell className="font-medium">
                      {attempt.user?.username ||
                        attempt.usernameInput ||
                        t("unknown")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(
                        new Date(attempt.attemptTime),
                        "MMM dd, yyyy HH:mm:ss",
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {attempt.ipAddress || t("unknown")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {attempt.isSuccess ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          {t("success")}
                        </Badge>
                      ) : (
                        <Badge variant="destructive">{t("failed")}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {attempt.failReason || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
