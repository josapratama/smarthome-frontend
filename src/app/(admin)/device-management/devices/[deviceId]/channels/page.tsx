"use client";

import { Suspense } from "react";
import { ChannelsUI } from "./ui";
import { useTranslation } from "@/hooks/use-translation";

export default function ChannelsPage({
  params,
}: {
  params: { deviceId: string };
}) {
  const { t } = useTranslation();

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t("loading")}...</p>
          </div>
        </div>
      }
    >
      <ChannelsUI deviceId={parseInt(params.deviceId)} />
    </Suspense>
  );
}
