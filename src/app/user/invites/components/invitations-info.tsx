"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";

export function InvitationsInfo() {
  const { t } = useTranslation();

  const infoItems = [
    {
      emoji: "📨",
      title: t("receivingInvitations"),
      description: t("receivingInvitationsDesc"),
      bgColor: "bg-primary/10",
    },
    {
      emoji: "✅",
      title: t("acceptingInvitations"),
      description: t("acceptingInvitationsDesc"),
      bgColor: "bg-green-500/10",
    },
    {
      emoji: "❌",
      title: t("decliningInvitations"),
      description: t("decliningInvitationsDesc"),
      bgColor: "bg-red-500/10",
    },
    {
      emoji: "👥",
      title: t("memberRoles"),
      description: t("memberRolesDesc"),
      bgColor: "bg-blue-500/10",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("aboutInvitations")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        {infoItems.map((item, index) => (
          <div key={index} className="flex gap-3">
            <div
              className={`h-8 w-8 rounded-full ${item.bgColor} flex items-center justify-center shrink-0`}
            >
              <span className="text-lg">{item.emoji}</span>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">{item.title}</h4>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
