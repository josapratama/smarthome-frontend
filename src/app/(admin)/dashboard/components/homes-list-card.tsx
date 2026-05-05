import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Power, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface HomeItem {
  id: number;
  name: string;
  city?: string | null;
  roleInHome: string;
  devicesOnline: number;
  devicesOffline: number;
  openAlarms: number;
}

interface HomesListCardProps {
  homes: HomeItem[];
}

export function HomesListCard({ homes }: HomesListCardProps) {
  const { t } = useTranslation();
  if (homes.length === 0) return null;

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{t("myHomes")}</CardTitle>
          <Link href="/location-management">
            <Button variant="ghost" size="sm">
              {t("viewAll")}
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {homes.slice(0, 6).map((h) => (
            <Link key={h.id} href="/location-management">
              <div className="rounded-xl border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {h.name}
                      {h.roleInHome === "OWNER" && (
                        <Badge variant="secondary" className="text-xs">
                          {t("owner")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {h.city ?? "—"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">#{h.id}</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border px-2 py-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                    {t("online")}: <b>{h.devicesOnline}</b>
                  </span>
                  <span className="rounded-full border px-2 py-1 flex items-center gap-1">
                    <Power className="h-3 w-3 text-muted-foreground" />
                    {t("offline")}: <b>{h.devicesOffline}</b>
                  </span>
                  {h.openAlarms > 0 && (
                    <span className="rounded-full border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-2 py-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                      {t("alarms")}:{" "}
                      <b className="text-red-600 dark:text-red-400">
                        {h.openAlarms}
                      </b>
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
