"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client.browser";
import type { RoomDTO, RoomCreateRequest } from "@/lib/api/dto/rooms.dto";
import type { HomeDTO } from "@/lib/api/dto/homes.dto";
import { useTranslation } from "@/hooks/use-translation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Home, MapPin, Trash2 } from "lucide-react";

function AddRoomDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    homeId: "",
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  const homesQuery = useQuery({
    queryKey: qk.homes.list(),
    queryFn: async () => {
      const payload = await apiFetchBrowser<{ data: HomeDTO[] }>(
        "/api/v1/homes",
      );
      return payload.data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: RoomCreateRequest) => {
      return apiFetchBrowser(`/api/v1/homes/${data.homeId}/rooms`, {
        method: "POST",
        body: JSON.stringify({ name: data.name }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.rooms.all });
      setOpen(false);
      setFormData({ name: "", homeId: "" });
      toast({
        title: t("roomCreated"),
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: t("failedCreateRoom"),
        description: error.message || t("unknownError"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.homeId) {
      toast({
        title: t("validationError"),
        description: t("fillAllFields"),
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      name: formData.name,
      homeId: Number(formData.homeId),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          {t("addRoom")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("addNewRoom")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="home">
              {t("home")} {t("required")}
            </Label>
            <Select
              value={formData.homeId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, homeId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectHome")} />
              </SelectTrigger>
              <SelectContent>
                {homesQuery.data?.map((home) => (
                  <SelectItem key={home.id} value={String(home.id)}>
                    {home.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="name">
              {t("roomName")} {t("required")}
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Living Room, Bedroom"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? t("creating") : t("createRoom")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function RoomsClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  const roomsQuery = useQuery({
    queryKey: qk.rooms.all,
    queryFn: async () => {
      const payload = await apiFetchBrowser<{ data: RoomDTO[] }>(
        "/api/v1/rooms",
      );
      return payload.data ?? [];
    },
  });

  const homesQuery = useQuery({
    queryKey: qk.homes.list(),
    queryFn: async () => {
      const payload = await apiFetchBrowser<{ data: HomeDTO[] }>(
        "/api/v1/homes",
      );
      return payload.data ?? [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (roomId: number) => {
      return apiFetchBrowser(`/api/v1/rooms/${roomId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.rooms.all });
      toast({ title: t("roomDeleted") });
    },
    onError: (error: any) => {
      toast({
        title: t("failedDeleteRoom"),
        description: error.message || t("unknownError"),
        variant: "destructive",
      });
    },
  });

  const getHomeName = (homeId: number) => {
    const home = homesQuery.data?.find((h) => h.id === homeId);
    return home?.name || `${t("home")} #${homeId}`;
  };

  const activeHomes = new Set(roomsQuery.data?.map((r) => r.homeId) || []);
  const devicesInRooms = 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("rooms")}</h1>
          <p className="text-sm text-muted-foreground">{t("manageRooms")}</p>
        </div>
        <AddRoomDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("totalRooms")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {roomsQuery.data?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("activeHomes")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{activeHomes.size}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("devicesInRooms")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{devicesInRooms}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t("allRooms")}</CardTitle>
        </CardHeader>
        <CardContent>
          {roomsQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : roomsQuery.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {(roomsQuery.error as Error).message}
            </div>
          ) : !roomsQuery.data || roomsQuery.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Home className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">
                {t("noRoomsFound")}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("getStartedRoom")}
              </p>
            </div>
          ) : (
            <div className="divide-y rounded-xl border">
              {roomsQuery.data.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{room.name}</span>
                      <Badge variant="outline">
                        {getHomeName(room.homeId)}
                      </Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {t("createdAt")}:{" "}
                      {new Date(room.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`${t("deleteRoom")} "${room.name}"?`)) {
                        deleteMutation.mutate(room.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {roomsQuery.isFetching && !roomsQuery.isLoading ? (
            <div className="mt-3 text-xs text-muted-foreground">
              {t("updating")}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
