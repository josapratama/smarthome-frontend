"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Copy, Loader2, Wifi } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { CreatedDevice } from "../lib/register.types";

interface CredentialsCardProps {
  device: CreatedDevice | null;
  macAddress: string;
  isSending: boolean;
  onSend: () => void;
  onCopy: (text: string, label: string) => void;
}

export function CredentialsCard({
  device,
  macAddress,
  isSending,
  onSend,
  onCopy,
}: CredentialsCardProps) {
  const { t } = useTranslation();

  return (
    <Card
      className={`rounded-2xl shadow-sm ${device ? "border-green-500" : ""}`}
    >
      <CardHeader>
        <CardTitle>{t("sendCredentials")}</CardTitle>
        <CardDescription>
          {device
            ? t("deviceCreatedSendCredentials")
            : t("createDeviceFirstToSendCredentials")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!device ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Wifi className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              {t("fillFormAndCreateDevice")}
            </p>
          </div>
        ) : (
          <>
            {/* Credentials summary */}
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t("deviceId")}:</span>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="font-mono">
                    {device.id}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCopy(device.id.toString(), t("deviceId"))}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t("deviceKey")}:</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-background px-2 py-1 rounded">
                    {device.deviceKey.substring(0, 20)}...
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCopy(device.deviceKey, t("deviceKey"))}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="text-sm font-medium">{t("name")}:</span>
                <span className="text-sm">{device.deviceName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium">MAC:</span>
                <span className="text-sm font-mono">
                  {device.capabilities?.mac ?? macAddress}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium">{t("type")}:</span>
                <Badge variant="outline">{device.deviceType}</Badge>
              </div>
            </div>

            {/* Info */}
            <Alert>
              <AlertDescription className="text-sm">
                {t("clickToSendCredentials")}
              </AlertDescription>
            </Alert>

            {/* Send button */}
            <Button
              onClick={onSend}
              disabled={isSending}
              size="lg"
              className="w-full"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("sending")}
                </>
              ) : (
                t("sendCredentialsToDevice")
              )}
            </Button>

            {/* What happens next */}
            <Alert>
              <AlertTitle className="text-sm">
                {t("whatHappensNext")}:
              </AlertTitle>
              <AlertDescription className="text-xs space-y-1">
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    {t("credentialsSentViaMqtt")}:{" "}
                    <code>devices/register/{macAddress.replace(/:/g, "")}</code>
                  </li>
                  <li>{t("esp32ReceivesAndSaves")}</li>
                  <li>{t("esp32RestartsAutomatically")}</li>
                  <li>{t("deviceConnectsAndAppearsOnline")}</li>
                </ol>
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
}
