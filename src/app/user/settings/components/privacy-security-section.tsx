"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, Eye, ChevronRight } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export function PrivacySecuritySection() {
  const { t } = useTranslation();

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          {t("privacySecurity")}
        </CardTitle>
        <CardDescription className="text-sm">
          {t("managePrivacyAndSecurity")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <a
          href="/user/privacy"
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{t("privacySettings")}</p>
              <p className="text-xs text-muted-foreground">
                {t("controlDataAndPrivacy")}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </a>
      </CardContent>
    </Card>
  );
}
