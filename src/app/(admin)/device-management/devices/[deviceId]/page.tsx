"use client";

import { DeviceDetailClient } from "./ui";
import { useTranslation } from "@/hooks/use-translation";

export default function DeviceDetailPage({
  params,
}: {
  params: { deviceId: string };
}) {
  const { t } = useTranslation();
  const deviceId = parseInt(params.deviceId, 10);

  if (isNaN(deviceId)) {
    return (
      <div className="p-6 text-center text-red-600">{t("invalidDeviceId")}</div>
    );
  }

  return <DeviceDetailClient deviceId={deviceId} />;
}
