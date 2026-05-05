"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import type { RoomDTO } from "@/lib/api/dto/rooms.dto";
import type { HomeDTO } from "@/lib/api/dto/homes.dto";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/page-header";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, DoorOpen, Smartphone, Search } from "lucide-react";

import { RoomCard } from "./room-card";
import { AddRoomDialog } from "./add-room-dialog";
import { RoomAccessDialog } from "@/app/user/locations/components/room-access-dialog";

export function RoomsView() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomDTO | null>(null);
  const [accessOpen, setAccessOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // ── Topbar events ─────────────────────────────────────────
  useEffect(() => {
    const onSearch = () => {
      const input =
        searchRef.current?.querySelector("input") ??
        (document.querySelector("input") as HTMLInputElement | null);
      input?.focus();
      input?.select();
    };
    window.addEventListener("topbar-search", onSearch);
    window.addEventListener("topbar-add", () => setAddOpen(true));
    return () => {
      window.removeEventListener("topbar-search", onSearch);
      window.removeEventListener("topbar-add", () => {});
    };
  }, []);

  // ── Queries ───────────────────────────────────────────────
  const roomsQuery = useQuery({
    queryKey: qk.rooms.all,
    queryFn: async () => {
      const res = await apiFetchBrowser<{ data: RoomDTO[] }>("/api/v1/rooms");
      return res.data ?? [];
    },
  });

  const homesQuery = useQuery({
    queryKey: qk.homes.list(),
    queryFn: async () => {
      const res = await apiFetchBrowser<{ data: HomeDTO[] }>("/api/v1/homes");
      return res.data ?? [];
    },
  });

  // ── Delete ────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (roomId: number) =>
      apiFetchBrowser(`/api/v1/rooms/${roomId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.rooms.all });
      toast({ title: t("roomDeleted") });
    },
    onError: (err: any) =>
      toast({
        title: t("failedDeleteRoom"),
        description: err.message || t("unknownError"),
        variant: "destructive",
      }),
  });

  function getHomeName(homeId: number): string {
    return (
      homesQuery.data?.find((h) => h.id === homeId)?.name ??
      `${t("home")} #${homeId}`
    );
  }

  function handleDeleteClick(room: RoomDTO) {
    if (confirm(`${t("deleteRoom")} "${room.name}"?`)) {
      deleteMutation.mutate(room.id);
    }
  }

  function handleAccessClick(room: RoomDTO) {
    setSelectedRoom(room);
    setAccessOpen(true);
  }

  function handleAccessClose() {
    setAccessOpen(false);
    setSelectedRoom(null);
    queryClient.invalidateQueries({ queryKey: qk.rooms.all });
  }

  // ── Derived ───────────────────────────────────────────────
  const activeHomes = new Set(roomsQuery.data?.map((r) => r.homeId) ?? []);

  const filtered = (roomsQuery.data ?? []).filter((room) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      room.name.toLowerCase().includes(q) ||
      getHomeName(room.homeId).toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        stats={[
          {
            label: t("totalRooms"),
            value: roomsQuery.data?.length ?? 0,
            icon: DoorOpen,
            color: "text-blue-500",
          },
          {
            label: t("activeHomes"),
            value: activeHomes.size,
            icon: Home,
            color: "text-green-500",
          },
          {
            label: t("devicesInRooms"),
            value: 0,
            icon: Smartphone,
            color: "text-purple-500",
          },
        ]}
      />

      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div ref={searchRef} className="flex-1">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchRooms")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="shadow-md hover:shadow-lg transition-all"
        >
          <DoorOpen className="h-4 w-4 mr-2" />
          {t("addRoom")}
        </Button>
      </div>

      <AddRoomDialog open={addOpen} onOpenChange={setAddOpen} />

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t("allRooms")}</CardTitle>
        </CardHeader>
        <CardContent>
          {roomsQuery.isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : roomsQuery.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              {(roomsQuery.error as Error).message}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Home className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">
                {searchQuery ? t("noRoomsMatchSearch") : t("noRoomsFound")}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("getStartedRoom")}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  homeName={getHomeName(room.homeId)}
                  isDeleting={deleteMutation.isPending}
                  onAccessClick={handleAccessClick}
                  onDeleteClick={handleDeleteClick}
                />
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

      {selectedRoom && (
        <RoomAccessDialog
          isOpen={accessOpen}
          onClose={handleAccessClose}
          roomId={selectedRoom.id}
          roomName={selectedRoom.name}
          homeId={selectedRoom.homeId}
          currentPrivacy={selectedRoom.privacyLevel ?? "PUBLIC"}
        />
      )}
    </div>
  );
}
