"use client";

import Link from "next/link";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Search, Home, Trash2 } from "lucide-react";

function fmtDateTime(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
}

function CreateRoomDialog({ homeId }: { homeId: number }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
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
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t("createRoom")}
        </Button>
      </DialogTrigger>
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
            <Button variant="outline" onClick={() => setOpen(false)}>
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

export function RoomsClient({ homeId }: { homeId: number }) {
  const { t } = useLanguage();
  const [searchText, setSearchText] = useState("");

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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/homes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToHomes")}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("rooms")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("manageRoomsForHome")} #{homeId}
          </p>
        </div>

        <CreateRoomDialog homeId={homeId} />
      </div>

      {/* Search Bar */}
      <Card className="border-none shadow-md">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={t("searchRooms")}
              className="pl-10 h-11"
            />
          </div>
        </CardContent>
      </Card>

      {/* Rooms List */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              {t("roomsList")} ({filtered.length})
            </CardTitle>
            {q.isFetching && !q.isLoading && (
              <span className="text-sm text-muted-foreground">
                {t("updating")}
              </span>
            )}
          </div>
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
              {!searchText && <CreateRoomDialog homeId={homeId} />}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((room) => (
                <Link
                  key={room.id}
                  href={`/devices?homeId=${homeId}&roomId=${room.id}`}
                  className="block group"
                >
                  <div className="p-4 rounded-xl border-2 border-transparent bg-muted/50 hover:border-primary/20 hover:bg-muted hover:shadow-md transition-all">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Home className="h-5 w-5 text-primary" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold truncate group-hover:text-primary transition-colors">
                              {room.name}
                            </h4>
                            {room.deletedAt && (
                              <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                <Trash2 className="h-3 w-3" />
                                {t("deleted")}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>ID: #{room.id}</span>
                            <span>•</span>
                            <span>
                              {t("created")}: {fmtDateTime(room.createdAt)}
                            </span>
                            {room.deletedAt && (
                              <>
                                <span>•</span>
                                <span>
                                  {t("deleted")}: {fmtDateTime(room.deletedAt)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0"
                      >
                        {t("viewDevices")}
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
