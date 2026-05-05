import { Card, CardContent } from "@/components/ui/card";
import { Package, Upload, Smartphone } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface FirmwareStatsProps {
  total: number;
  latestVersion: string;
  esp32Count: number;
  esp8266Count: number;
}

export function FirmwareStats({
  total,
  latestVersion,
  esp32Count,
  esp8266Count,
}: FirmwareStatsProps) {
  const { t } = useTranslation();

  const stats = [
    {
      label: t("totalFirmware"),
      value: total,
      icon: Package,
      bg: "bg-blue-100 dark:bg-blue-900",
      color: "text-blue-600 dark:text-blue-400",
      isText: false,
    },
    {
      label: t("latestVersion"),
      value: latestVersion,
      icon: Upload,
      bg: "bg-green-100 dark:bg-green-900",
      color: "text-green-600 dark:text-green-400",
      isText: true,
    },
    {
      label: "ESP32",
      value: esp32Count,
      icon: Smartphone,
      bg: "bg-purple-100 dark:bg-purple-900",
      color: "text-purple-600 dark:text-purple-400",
      isText: false,
    },
    {
      label: "ESP8266",
      value: esp8266Count,
      icon: Smartphone,
      bg: "bg-orange-100 dark:bg-orange-900",
      color: "text-orange-600 dark:text-orange-400",
      isText: false,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, bg, color, isText }) => (
        <Card
          key={label}
          className="rounded-2xl shadow-sm hover:shadow-md transition-shadow"
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p
                  className={`font-bold ${isText ? "text-lg truncate" : "text-2xl"}`}
                >
                  {value}
                </p>
              </div>
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center ${bg}`}
              >
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
