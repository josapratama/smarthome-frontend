import { Card, CardContent } from "@/components/ui/card";
import { Wifi, WifiOff, Clock, Home as HomeIcon, DoorOpen } from "lucide-react";
import type { DeviceDTO } from "@/lib/api/dto/devices.dto";

interface DeviceStatusCardsProps {
  device: DeviceDTO;
  t: (key: string) => string;
}

export function DeviceStatusCards({ device, t }: DeviceStatusCardsProps) {
  const lastSeen = device.lastSeenAt
    ? new Date(device.lastSeenAt).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : t("never");

  const cards = [
    {
      icon: device.status ? (
        <Wifi className="h-5 w-5 text-green-600 dark:text-green-400" />
      ) : (
        <WifiOff className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      ),
      bg: device.status
        ? "bg-green-100 dark:bg-green-900"
        : "bg-gray-100 dark:bg-gray-800",
      label: t("status"),
      value: device.status ? t("online") : t("offline"),
    },
    {
      icon: <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      bg: "bg-blue-100 dark:bg-blue-900",
      label: t("lastSeen"),
      value: lastSeen,
    },
    {
      icon: (
        <HomeIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      ),
      bg: "bg-purple-100 dark:bg-purple-900",
      label: t("home"),
      value: `#${device.homeId}`,
    },
    {
      icon: (
        <DoorOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
      ),
      bg: "bg-orange-100 dark:bg-orange-900",
      label: t("room"),
      value: device.roomId ? `#${device.roomId}` : t("notAssigned"),
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ icon, bg, label, value }) => (
        <Card
          key={label}
          className="rounded-xl hover:shadow-md transition-shadow"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}
              >
                {icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold">{value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
