import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";

export function TroubleshootingCard() {
  const { t } = useTranslation();

  const sections = [
    {
      title: t("deviceNotReceivingCredentials"),
      items: [
        t("checkMqttBrokerRunning"),
        t("checkEsp32StillOnline"),
        t("verifyMacAddressCorrect"),
      ],
    },
    {
      title: t("deviceNotAppearingOnline"),
      items: [
        t("checkWifiCredentialsInFirmware"),
        t("checkMqttServerIpCorrect"),
        t("wait30SecondsForHeartbeat"),
      ],
    },
    {
      title: t("macAddressAlreadyExists"),
      items: [
        t("deviceAlreadyRegistered"),
        t("checkDeviceList"),
        t("deleteOldDeviceIfNeeded"),
      ],
    },
  ];

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{t("troubleshooting")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3 text-sm">
          {sections.map(({ title, items }) => (
            <div key={title}>
              <h4 className="font-medium mb-2">{title}</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
