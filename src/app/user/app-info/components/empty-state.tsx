"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export function EmptyState() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {t("noInformationAvailable")}
        </h3>
        <p className="text-muted-foreground">
          {t("appInformationWillBeDisplayed")}
        </p>
      </CardContent>
    </Card>
  );
}
