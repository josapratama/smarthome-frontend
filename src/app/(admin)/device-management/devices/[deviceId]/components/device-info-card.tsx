import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { DeviceDTO } from "@/lib/api/dto/devices.dto";
import { DeviceTypeBadge } from "../lib/device-badges";

interface DeviceInfoCardProps {
  device: DeviceDTO;
  t: (key: string) => string;
}

export function DeviceInfoCard({ device, t }: DeviceInfoCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{t("deviceInformation")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              {t("deviceName")}
            </Label>
            <p className="text-sm font-medium">{device.deviceName}</p>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              {t("deviceType")}
            </Label>
            <DeviceTypeBadge type={device.deviceType} />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              MQTT Client ID
            </Label>
            <p className="text-sm font-mono">{device.mqttClientId || "-"}</p>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              {t("pairedAt")}
            </Label>
            <p className="text-sm">
              {device.pairedAt
                ? new Date(device.pairedAt).toLocaleString()
                : "-"}
            </p>
          </div>

          {device.capabilities && (
            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs text-muted-foreground">
                {t("capabilities")}
              </Label>
              <pre className="rounded-lg bg-muted p-3 text-xs overflow-x-auto">
                {JSON.stringify(device.capabilities, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
