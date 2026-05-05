"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  ArrowLeft,
  Home as HomeIcon,
  MapPin,
  DoorOpen,
  Cpu,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

interface Home {
  id: number;
  name: string;
  addressText?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

interface Room {
  id: number;
  name: string;
  _count?: {
    devices: number;
  };
}

interface Device {
  id: number;
  deviceName: string;
  deviceType: string;
  status: boolean;
  roomId?: number;
}

interface Member {
  id: number;
  userId: number;
  role: string;
  user: {
    fullName: string;
    email: string;
  };
}

export default function GuestHomeDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const homeId = parseInt(params.homeId as string);

  const [home, setHome] = useState<Home | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadHomeData();
  }, [homeId]);

  const loadHomeData = async () => {
    try {
      const [homeRes, roomsRes, devicesRes, membersRes] = await Promise.all([
        fetch(`/api/homes/${homeId}`),
        fetch(`/api/homes/${homeId}/rooms`),
        fetch(`/api/devices?homeId=${homeId}`),
        fetch(`/api/homes/${homeId}/members`),
      ]);

      if (homeRes.ok) {
        const homeData = await homeRes.json();
        setHome(homeData.data);
      }

      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        setRooms(roomsData.data || []);
      }

      if (devicesRes.ok) {
        const devicesData = await devicesRes.json();
        setDevices(devicesData.data || []);
      }

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || t("failedLoadHomeData"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!home) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("back")}
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <HomeIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t("homeNotFound")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("homeNotFoundDesc")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onlineDevices = devices.filter((d) => d.status).length;
  const offlineDevices = devices.filter((d) => !d.status).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{home.name}</h1>
            {(home.city || home.addressText) && (
              <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{home.addressText || home.city}</span>
              </div>
            )}
          </div>
        </div>
        <Badge variant="outline" className="gap-1">
          <Eye className="h-3 w-3" />
          {t("guestAccess")}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("rooms")}</p>
                <p className="text-2xl font-bold">{rooms.length}</p>
              </div>
              <DoorOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("devices")}</p>
                <p className="text-2xl font-bold">{devices.length}</p>
              </div>
              <Cpu className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("online")}</p>
                <p className="text-2xl font-bold text-green-600">
                  {onlineDevices}
                </p>
              </div>
              <Wifi className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("members")}</p>
                <p className="text-2xl font-bold">{members.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="gap-2">
            <HomeIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{t("overview")}</span>
          </TabsTrigger>
          <TabsTrigger value="rooms" className="gap-2">
            <DoorOpen className="h-4 w-4" />
            <span className="hidden sm:inline">{t("rooms")}</span>
          </TabsTrigger>
          <TabsTrigger value="devices" className="gap-2">
            <Cpu className="h-4 w-4" />
            <span className="hidden sm:inline">{t("devices")}</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("homeInformation")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("name")}</p>
                  <p className="font-medium">{home.name}</p>
                </div>
                {home.city && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t("city")}</p>
                    <p className="font-medium">{home.city}</p>
                  </div>
                )}
                {home.country && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("country")}
                    </p>
                    <p className="font-medium">{home.country}</p>
                  </div>
                )}
                {home.addressText && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">
                      {t("address")}
                    </p>
                    <p className="font-medium">{home.addressText}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle>{t("members")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted"
                  >
                    <div>
                      <p className="font-medium">{member.user.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                    <Badge variant="outline">{member.role}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rooms Tab */}
        <TabsContent value="rooms" className="space-y-4">
          {rooms.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => {
                const roomDevices = devices.filter((d) => d.roomId === room.id);
                const roomOnline = roomDevices.filter((d) => d.status).length;

                return (
                  <Card key={room.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{room.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {t("devices")}:
                          </span>
                          <span className="font-medium">
                            {roomDevices.length}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {t("online")}:
                          </span>
                          <span className="font-medium text-green-600">
                            {roomOnline}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <DoorOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t("noRoomsYet")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("noRoomsInHome")}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-4">
          {devices.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {devices.map((device) => (
                <Link key={device.id} href={`/guest/devices/${device.id}`}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        {device.deviceName}
                      </CardTitle>
                      <Badge variant="outline" className="w-fit">
                        {device.deviceType.replace("_", " ")}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {t("status")}:
                        </span>
                        {device.status ? (
                          <Badge className="bg-green-500">
                            <Wifi className="h-3 w-3 mr-1" />
                            {t("online")}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <WifiOff className="h-3 w-3 mr-1" />
                            {t("offline")}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Cpu className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t("noDevicesYet")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("noDevicesInHome")}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
