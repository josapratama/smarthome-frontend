"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client.browser";
import type { RoomDTO, RoomCreateRequest } from "@/lib/api/dto/rooms.dto";
import { useLanguage } from "@/contexts/language-context";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Home, Trash2, DoorOpen } from "lucide-react";

function fmtDateTime(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
}

export function RoomsClient({ homeId }: { homeId: number }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const q = useQuery({
    queryKey: qk.homes.rooms(homeId),
    queryFn: async () => {
      const payload = await apiFetchBrowser<{ data: RoomDTO[] }>(
        `/api/homes/${homeId}/rooms`,
      );
      return payload.data ?? [];
    },
  });

  const filtered = (q.data ?? []).filter((room) => {
    const search = searchText.toLowerCase();
    return (
      room.name.toLowerCase().includes(search) ||
      String(room.id).includes(search)
    );
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
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
          {t("rooms")} - {t("home")} #{homeId}
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t("rooms")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("manageRoomsForHome")} #{homeId}
        </p>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder={t("searchRooms")}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Room Button */}
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="shadow-md hover:shadow-lg transition-all"
        >
          <DoorOpen className="h-4 w-4 mr-2" />
          {t("addRoom")}
        </Button>
      </div>

      {/* Create Room Dialog */}
      <CreateRoomDialogControlled
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        homeId={homeId}
      />

      {/* Rooms List */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">
            {t("roomsList")} ({filtered.length})
          </CardTitle>
        </CardHeader>

        <CardContent>
          {q.isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : q.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {(q.error as Error).message}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Home className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">
                {searchText ? t("noRoomsMatchSearch") : t("noRoomsFound")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchText ? t("tryDifferentSearch") : t("getStartedRoom")}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((room) => (
                <Card
                  key={room.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                          <DoorOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold">
                            {room.name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            ID: #{room.id}
                          </p>
                        </div>
                      </div>
                      {room.deletedAt && (
                        <Badge variant="destructive" className="text-xs">
                          <Trash2 className="h-3 w-3 mr-1" />
                          {t("deleted")}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Timestamps */}
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <div>
                        {t("created")}: {fmtDateTime(room.createdAt)}
                      </div>
                      {room.deletedAt && (
                        <div className="text-red-600">
                          {t("deleted")}: {fmtDateTime(room.deletedAt)}
                        </div>
                      )}
                    </div>

                    {/* View Devices Button */}
                    <Link
                      href={`/device-management?homeId=${homeId}&roomId=${room.id}`}
                      className="block pt-2 border-t"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        {t("viewDevices")}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {q.isFetching && !q.isLoading ? (
            <div className="mt-3 text-xs text-muted-foreground">
              {t("updating")}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

// Controlled version of CreateRoomDialog
function CreateRoomDialogControlled({
  open,
  onOpenChange,
  homeId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  homeId: number;
}) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<RoomCreateRequest>({
    name: "",
    homeId,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: RoomCreateRequest) => {
      return apiFetchBrowser(`/api/homes/${homeId}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.homes.rooms(homeId) });
      onOpenChange(false);
      setFormData({ name: "", homeId });
      toast({ title: t("roomCreated") });
    },
    onError: (error) => {
      toast({
        title: t("failedCreateRoom"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createNewRoom")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">{t("roomName")} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder={t("roomNamePlaceholder")}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={() => createMutation.mutate(formData)}
              disabled={!formData.name || createMutation.isPending}
            >
              {createMutation.isPending ? t("creating") : t("create")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
