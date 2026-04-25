"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Wifi, WifiOff, RefreshCw, Search } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { PageHeader } from "@/components/ui/page-header";
import { useDevices } from "./hooks/use-devices";
import { DeviceFilters } from "./components/device-filters";
import { DeviceCard } from "./components/device-card";

export default function UserDevicesPage() {
  const { t } = useTranslation();
  const {
    devices,
    filteredDevices,
    homes,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    homeFilter,
    setHomeFilter,
    filterSectionRef,
    loadData,
    onlineCount,
    offlineCount,
  } = useDevices();

  return (
    <div className="space-y-6">
      <PageHeader
        stats={[
          {
            label: t("totalDevices"),
            value: devices.length,
            icon: Smartphone,
            color: "text-purple-500",
          },
          {
            label: t("online"),
            value: onlineCount,
            icon: Wifi,
            color: "text-green-500",
          },
          {
            label: t("offline"),
            value: offlineCount,
            icon: WifiOff,
            color: "text-gray-500",
          },
        ]}
        actions={
          <Button
            variant="outline"
            size="icon"
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        }
      />

      <DeviceFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        homeFilter={homeFilter}
        onHomeChange={setHomeFilter}
        homes={homes}
        filterSectionRef={filterSectionRef}
      />

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
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
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
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      )}
    </div>
  );
}
