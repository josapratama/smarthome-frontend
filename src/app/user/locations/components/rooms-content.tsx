"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Home, DoorOpen, ChevronRight } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useRooms } from "../hooks/use-rooms";
import type { RoomDTO } from "@/lib/api/dto/rooms.dto";

type Room = RoomDTO;

function getPrivacyIcon(level?: string) {
  switch (level) {
    case "PRIVATE":
      return "🔒";
    case "SHARED":
      return "👥";
    case "RESTRICTED":
      return "⚠️";
    default:
      return "🌐";
  }
}

export default function RoomsContent() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    rooms,
    homes,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedHomeId,
    setSelectedHomeId,
    filteredRooms,
  } = useRooms();

  const getPrivacyLabel = (level?: string) => {
    switch (level) {
      case "PRIVATE":
        return t("private");
      case "SHARED":
        return t("shared");
      case "RESTRICTED":
        return t("restricted");
      default:
        return t("public");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: t("totalRooms"), value: rooms.length },
          { label: t("totalHomes"), value: homes.length },
          {
            label: t("privateRooms"),
            value: rooms.filter((r) => r.privacyLevel === "PRIVATE").length,
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("filterRooms")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchRooms")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedHomeId} onValueChange={setSelectedHomeId}>
              <SelectTrigger>
                <SelectValue />
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

      {/* Rooms */}
      {filteredRooms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <DoorOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t("noRoomsFound")}</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedHomeId !== "all"
                ? t("tryDifferentFilters")
                : t("createFirstRoom")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => (
            <Card
              key={room.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/user/homes/${room.homeId}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DoorOpen className="h-5 w-5" />
                      {room.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Home className="h-3 w-3" />
                      {room.homeName}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <span>{getPrivacyIcon(room.privacyLevel)}</span>
                    {getPrivacyLabel(room.privacyLevel)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {room.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {room.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {t("created")}{" "}
                    {new Date(room.createdAt).toLocaleDateString()}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
