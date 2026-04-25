"use client";

import { useTranslation } from "@/hooks/use-translation";

export function ErrorState() {
  const { t } = useTranslation();

  return (
    <div className="text-center py-12 p-4">
      <p className="text-muted-foreground">{t("failedLoadProfile")}</p>
    </div>
  );
}
