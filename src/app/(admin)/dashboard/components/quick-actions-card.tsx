import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Home as HomeIcon, Bell, TrendingUp } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export function QuickActionsCard() {
  const { t } = useTranslation();

  const actions = [
    { href: "/device-management", icon: Zap, label: t("deviceManagement") },
    {
      href: "/location-management",
      icon: HomeIcon,
      label: t("locationManagement"),
    },
    { href: "/alarms", icon: Bell, label: t("alarms") },
    { href: "/energy", icon: TrendingUp, label: t("energyManagement") },
  ];

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{t("quickActions")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {actions.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className="block">
              <Button
                variant="outline"
                className="w-full h-auto py-3 sm:py-4 flex-col gap-1 sm:gap-2"
                size="sm"
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">{label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
