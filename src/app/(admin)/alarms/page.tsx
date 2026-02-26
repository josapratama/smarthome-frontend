"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Siren, AlertTriangle, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export default function AlarmsPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("alarms")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("monitorSecurityAlarms")}
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          {t("createAlarmRule")}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("totalAlarms")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">0</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("critical")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div className="text-3xl font-semibold">0</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("active")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Siren className="h-5 w-5 text-orange-500" />
              <div className="text-3xl font-semibold">0</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("resolved")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <div className="text-3xl font-semibold">0</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t("recentAlarms")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Siren className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">{t("noAlarmsFound")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("securityAlarmsWillAppear")}
            </p>
            <Button className="mt-4" variant="outline">
              <Plus className="h-4 w-4" />
              {t("configureAlarmRules")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
