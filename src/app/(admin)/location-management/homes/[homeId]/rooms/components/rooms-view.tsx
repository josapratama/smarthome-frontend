"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import type { RoomDTO } from "@/lib/api/dto/rooms.dto";
import { useTranslation } from "@/hooks/use-translation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, DoorOpen, Search } from "lucide-react";

import { RoomItemCard } from "./room-item-card";
import { CreateRoomDialog } from "./create-room-dialog";

interface RoomsViewProps {
  homeId: number;
}

export function RoomsView({ homeId }: RoomsViewProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const roomsQuery = useQuery({
    queryKey: qk.homes.rooms(homeId),
    queryFn: async () => {
      const res = await apiFetchBrowser<{ data: RoomDTO[] }>(
        `/api/v1/homes/${homeId}/rooms`,
      );
      return res.data ?? [];
    },
  });

  const filtered = (roomsQuery.data ?? []).filter((room) => {
    const q = searchText.toLowerCase();
    return room.name.toLowerCase().includes(q) || String(room.id).includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => router.push("/location-management")}
          className="hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Home className="h-4 w-4" />
          {t("locationManagement")}
        </button>
        <span>/</span>
        <span className="text-foreground font-medium">
          {t("rooms")} — {t("home")} #{homeId}
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t("rooms")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("manageRoomsForHome")} #{homeId}
        </p>
      </div>

      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Card className="flex-1">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={t("searchRooms")}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>
        <Button
          onClick={() => setCreateOpen(true)}
          className="shadow-md hover:shadow-lg transition-all"
        >
          <DoorOpen className="h-4 w-4 mr-2" />
          {t("addRoom")}
        </Button>
      </div>

      <CreateRoomDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        homeId={homeId}
      />

      {/* List */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">
            {t("roomsList")} ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {roomsQuery.isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : roomsQuery.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              {(roomsQuery.error as Error).message}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Home className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">
                {searchText ? t("noRoomsMatchSearch") : t("noRoomsFound")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchText ? t("tryDifferentSearch") : t("getStartedRoom")}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((room) => (
                <RoomItemCard key={room.id} room={room} homeId={homeId} />
              ))}
            </div>
          )}
          {roomsQuery.isFetching && !roomsQuery.isLoading && (
            <p className="mt-3 text-xs text-muted-foreground">
              {t("updating")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
