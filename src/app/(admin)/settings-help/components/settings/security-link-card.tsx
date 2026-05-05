import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, ChevronRight } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export function SecurityLinkCard() {
  const { t } = useTranslation();

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          {t("security")}
        </CardTitle>
        <CardDescription className="text-sm">
          {t("manageSecuritySettings")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <a
          href="/security"
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{t("securitySettings")}</p>
              <p className="text-xs text-muted-foreground">
                {t("manageLoginAndSessions")}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </a>
      </CardContent>
    </Card>
  );
}
