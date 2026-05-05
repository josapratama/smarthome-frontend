"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Home } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export function EmptyState() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">{t("members")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("manageHomeMembersAndInvites")}
        </p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("noHomesYet")}</h3>
          <p className="text-muted-foreground">
            {t("createHomeToManageMembers")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
