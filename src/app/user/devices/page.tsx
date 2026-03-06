"use client";

import { useEffect, useState } from "react";
import { devicesApi, DeviceWithDetails } from "@/lib/api/client/devices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Smartphone,
  Wifi,
  WifiOff,
  Lightbulb,
  Fan,
  Thermometer,
  Zap,
  RefreshCw,
  Search,
  Filter,
  Home as HomeIcon,
  DoorOpen,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { homesApi } from "@/lib/api/client/homes";

export default function UserDevicesPage() {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<DeviceWithDetails[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<DeviceWithDetails[]>(
    [],
  );
  const [homes, setHomes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [homeFilter, setHomeFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterDevices();
  }, [devices, searchQuery, statusFilter, homeFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [devicesData, homesData] = await Promise.all([
        devicesApi.list(),
        homesApi.list(),
      ]);
      setDevices(devicesData);
      setHomes(homesData);
    } catch (error: any) {
      toast.error(error.message || t("failedLoadDevices"));
    } finally {
      setIsLoading(false);
    }
  };

  const filterDevices = () => {
    let filtered = [...devices];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (device) =>
          device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          device.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          device.home?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          device.room?.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((device) => device.status === statusFilter);
    }

    // Home filter
    if (homeFilter !== "all") {
      filtered = filtered.filter(
        (device) => device.homeId === parseInt(homeFilter),
      );
    }

    setFilteredDevices(filtered);
  };

  const getDeviceIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("light") || lowerType.includes("lampu")) {
      return <Lightbulb className="h-6 w-6 text-yellow-500" />;
    }
    if (lowerType.includes("fan") || lowerType.includes("kipas")) {
      return <Fan className="h-6 w-6 text-blue-500" />;
    }
    if (lowerType.includes("ac") || lowerType.includes("thermostat")) {
      return <Thermometer className="h-6 w-6 text-blue-500" />;
    }
    if (lowerType.includes("power") || lowerType.includes("meter")) {
      return <Zap className="h-6 w-6 text-orange-500" />;
    }
    return <Smartphone className="h-6 w-6 text-primary" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ONLINE":
        return (
          <Badge className="bg-green-600 flex items-center gap-1">
            <Wifi className="h-3 w-3" />
            {t("online")}
          </Badge>
        );
      case "OFFLINE":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <WifiOff className="h-3 w-3" />
            {t("offline")}
          </Badge>
        );
      case "ERROR":
        return <Badge variant="destructive">{t("error")}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const onlineCount = devices.filter((d) => d.status === "ONLINE").length;
  const offlineCount = devices.filter((d) => d.status === "OFFLINE").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Smartphone className="h-7 w-7" />
            {t("devices")}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            {t("monitorAndControl")}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={loadData}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Stats Cards */}
      {devices.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{devices.length}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t("totalDevices")}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {onlineCount}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t("online")}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-500">
                  {offlineCount}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t("offline")}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      {devices.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchDevices") || "Search devices..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t("status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allStatus")}</SelectItem>
                  <SelectItem value="ONLINE">{t("online")}</SelectItem>
                  <SelectItem value="OFFLINE">{t("offline")}</SelectItem>
                  <SelectItem value="ERROR">{t("error")}</SelectItem>
                </SelectContent>
              </Select>

              {/* Home Filter */}
              <Select value={homeFilter} onValueChange={setHomeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t("filterByHome")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allHomes")}</SelectItem>
                  {homes.map((home) => (
                    <SelectItem key={home.id} value={home.id.toString()}>
                      {home.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Devices Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[200px] rounded-lg" />
          ))}
        </div>
      ) : devices.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📱</div>
            <h2 className="text-xl font-semibold mb-2">{t("noDevicesYet")}</h2>
            <p className="text-muted-foreground mb-2">{t("startPairing")}</p>
            <p className="text-sm text-muted-foreground">
              {t("devicesWillAppear")}
            </p>
          </CardContent>
        </Card>
      ) : filteredDevices.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Filter className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">
              {t("noDevicesMatchSearch")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("tryDifferentSearch")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map((device) => (
            <Link key={device.id} href={`/user/devices/${device.id}`}>
              <Card className="hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer border-l-4 border-l-primary h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(device.type)}
                      <div>
                        <CardTitle className="text-lg">{device.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {device.type}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(device.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {device.home && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <HomeIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{device.home.name}</span>
                      </div>
                      {device.room && (
                        <div className="flex items-center gap-2 text-sm">
                          <DoorOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {device.room.name}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>
                      {device.firmwareVersion
                        ? `v${device.firmwareVersion}`
                        : "-"}
                    </span>
                    {device.lastSeenAt && (
                      <span>
                        {new Date(device.lastSeenAt).toLocaleDateString(
                          "id-ID",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
