"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Home as HomeIcon, Smartphone, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

interface Home {
  id: number;
  name: string;
  addressText?: string;
  city?: string;
}

interface Device {
  id: number;
  deviceName: string;
  deviceType: string;
  status: boolean;
  homeId: number;
}

export default function GuestDashboardPage() {
  const { t } = useLanguage();
  const [homes, setHomes] = useState<Home[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [homesRes, devicesRes] = await Promise.all([
        fetch("/api/homes"),
        fetch("/api/devices"),
      ]);

      if (homesRes.ok) {
        const homesData = await homesRes.json();
        setHomes(homesData.data || []);
      }

      if (devicesRes.ok) {
        const devicesData = await devicesRes.json();
        setDevices(devicesData.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || t("failedLoadData"));
    } finally {
      setIsLoading(false);
    }
  };

  const onlineDevices = devices.filter((d) => d.status).length;
  const offlineDevices = devices.filter((d) => !d.status).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Read-only badge */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("dashboard")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("guestDashboardDesc")}
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Eye className="h-3 w-3" />
          {t("readOnlyMode")}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalHomes")}
            </CardTitle>
            <HomeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{homes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("homesYouCanView")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("onlineDevices")}
            </CardTitle>
            <Smartphone className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineDevices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("devicesActive")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("offlineDevices")}
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offlineDevices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("devicesInactive")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Card className="border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                {t("guestAccessInfo")}
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                {t("guestAccessDesc")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Homes List */}
      {homes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("yourHomes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {homes.map((home) => {
                const homeDevices = devices.filter((d) => d.homeId === home.id);
                const homeOnline = homeDevices.filter((d) => d.status).length;
                const homeOffline = homeDevices.filter((d) => !d.status).length;

                return (
                  <Link key={home.id} href={`/guest/homes/${home.id}`}>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">
                              {home.name}
                            </CardTitle>
                            {home.city && (
                              <p className="text-xs text-muted-foreground mt-1">
                                📍 {home.city}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="gap-1">
                            <Eye className="h-3 w-3" />
                            {t("guest")}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span>
                              {homeOnline} {t("online")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-gray-400" />
                            <span>
                              {homeOffline} {t("offline")}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {homes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <HomeIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t("noHomesYet")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("waitForInvitation")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
