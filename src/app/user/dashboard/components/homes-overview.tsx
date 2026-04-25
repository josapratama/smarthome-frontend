"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home as HomeIcon, TrendingUp } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { Home } from "@/lib/api/services/homes";
import type { DeviceWithDetails } from "@/lib/api/services/devices";

interface HomesOverviewProps {
  homes: Home[];
  devices: DeviceWithDetails[];
  maxDisplay?: number;
}

export function HomesOverview({
  homes,
  devices,
  maxDisplay = 3,
}: HomesOverviewProps) {
  const { t } = useTranslation();
  const displayed = homes.slice(0, maxDisplay);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold">
          {t("yourHomes") || "Your Homes"}
        </h2>
        {homes.length > maxDisplay && (
          <Link href="/user/locations">
            <Button variant="ghost" size="sm" className="gap-1">
              {t("viewAll") || "View All"}
              <TrendingUp className="h-3 w-3" />
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {displayed.map((home) => {
          const homeDevices = devices.filter((d) => d.homeId === home.id);
          const onlineCount = homeDevices.filter(
            (d) => d.status === "ONLINE",
          ).length;
          const offlineCount = homeDevices.filter(
            (d) => d.status === "OFFLINE",
          ).length;

          return (
            <Link key={home.id} href={`/user/locations/${home.id}`}>
              <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <HomeIcon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="truncate">{home.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("devices") || "Devices"}
                    </span>
                    <span className="font-semibold">{homeDevices.length}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-muted-foreground">
                        {onlineCount} {t("online") || "online"}
                      </span>
                    </div>
                    {offlineCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-gray-400" />
                        <span className="text-muted-foreground">
                          {offlineCount} {t("offline") || "offline"}
                        </span>
                      </div>
                    )}
                  </div>
                  {home.addressText && (
                    <p className="text-xs text-muted-foreground truncate">
                      📍 {home.addressText}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
