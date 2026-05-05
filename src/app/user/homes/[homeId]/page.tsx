"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Home as HomeIcon,
  MapPin,
  DoorOpen,
  Cpu,
  Users,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { homesApi, type Home } from "@/lib/api/services/homes";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import { toast } from "sonner";

interface Room {
  id: number;
  name: string;
  homeId: number;
  privacyLevel?: string;
  _count?: { devices: number };
}

export default function HomeDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const homeId = parseInt(params.homeId as string);

  const [home, setHome] = useState<Home | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [homeData, roomsRes] = await Promise.all([
        homesApi.getById(homeId),
        apiFetchBrowser<{ data: Room[] }>(
          `/api/v1/homes/${homeId}/rooms`,
        ).catch(() => ({ data: [] })),
      ]);
      setHome(homeData);
      setRooms(roomsRes.data ?? []);
    } catch (error: any) {
      toast.error(error.message || t("failedToLoadHomes"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!homeId || isNaN(homeId)) return;
    loadData();
  }, [homeId]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/user/locations")}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {isLoading ? (
          <Skeleton className="h-8 w-48" />
        ) : home ? (
          <div className="flex items-center gap-3 min-w-0">
            <HomeIcon className="h-6 w-6 text-primary shrink-0" />
            <h1 className="text-xl font-bold truncate">{home.name}</h1>
          </div>
        ) : (
          <h1 className="text-xl font-bold text-muted-foreground">
            {t("homeNotFound")}
          </h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={loadData}
          className="ml-auto shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-lg" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
        </div>
      ) : home ? (
        <>
          {/* Home Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HomeIcon className="h-5 w-5 text-primary" />
                {t("homeDetails") || "Home Details"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {home.addressText && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div>{home.addressText}</div>
                    {home.city && (
                      <div className="text-muted-foreground">
                        {home.city}
                        {home.postalCode && `, ${home.postalCode}`}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2 border-t">
                <div className="flex items-center gap-1">
                  <DoorOpen className="h-4 w-4" />
                  <span>
                    {rooms.length} {t("rooms") || "rooms"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rooms Grid */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <DoorOpen className="h-5 w-5" />
              {t("rooms")}
            </h2>
            {rooms.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <DoorOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    {t("noRoomsFound") || "No rooms found"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rooms.map((room) => (
                  <Card
                    key={room.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <DoorOpen className="h-4 w-4 text-primary" />
                        {room.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        {room._count?.devices !== undefined && (
                          <div className="flex items-center gap-1">
                            <Cpu className="h-3 w-3" />
                            <span>
                              {room._count.devices} {t("devices")}
                            </span>
                          </div>
                        )}
                        {room.privacyLevel && (
                          <Badge variant="outline" className="text-xs">
                            {room.privacyLevel}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <HomeIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">{t("homeNotFound")}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/user/locations")}
            >
              {t("backToLocations") || "Back to Locations"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
