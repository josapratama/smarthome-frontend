"use client";

import { useTranslation } from "@/hooks/use-translation";

export function LoadingState() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">{t("loading")}</p>
      </div>
    </div>
  );
}
