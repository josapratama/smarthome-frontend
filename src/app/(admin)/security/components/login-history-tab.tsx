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
import { RefreshCw, Download, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import { useTranslation } from "@/hooks/use-translation";

interface LoginHistory {
  id: number;
  userId: number;
  loginTime: string;
  ipAddress: string | null;
  user: {
    username: string;
    email: string;
  };
}

export default function LoginHistoryTab() {
  const { t } = useTranslation();
  const [history, setHistory] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await apiFetchBrowser<{ data: LoginHistory[] }>(
        "/api/v1/auth/login-history",
      );
      setHistory(response.data || []);
    } catch (error: any) {
      // Silently handle 404 errors (endpoint not implemented yet)
      if ((error as any).status !== 404) {
        toast({
          title: t("error"),
          description: (error as any).message || t("failedToFetchLoginHistory"),
          variant: "destructive",
        });
      }
      console.log("Login history fetch error:", error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const exportHistory = () => {
    const csv = [
      [t("username"), t("email"), t("loginTime"), t("ipAddress")],
      ...history.map((h) => [
        h.user.username,
        h.user.email,
        format(new Date(h.loginTime), "yyyy-MM-dd HH:mm:ss"),
        h.ipAddress || "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `login-history-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

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
        <div>
          <h3 className="text-lg font-semibold">{t("loginHistory")}</h3>
          <p className="text-sm text-muted-foreground">
            {history.length} {t("loginRecords")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchHistory}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("refresh")}
          </Button>
          <Button variant="outline" size="sm" onClick={exportHistory}>
            <Download className="mr-2 h-4 w-4" />
            {t("export")}
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("user")}</TableHead>
              <TableHead>{t("email")}</TableHead>
              <TableHead>{t("loginTime")}</TableHead>
              <TableHead>{t("ipAddress")}</TableHead>
              <TableHead>{t("location")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  {t("noLoginHistoryFound")}
                </TableCell>
              </TableRow>
            ) : (
              history.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.user.username}
                  </TableCell>
                  <TableCell>{item.user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(item.loginTime), "MMM dd, yyyy HH:mm")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.ipAddress || t("unknown")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {t("unknown")}
                    </div>
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
