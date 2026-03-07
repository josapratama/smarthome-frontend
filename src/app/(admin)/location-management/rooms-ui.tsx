"use client";

import { useState, useEffect, useRef } from "react";
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
import { PageHeader } from "@/components/ui/page-header";
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
import {
  Plus,
  Home,
  MapPin,
  Trash2,
  Shield,
  Lock,
  Users,
  UserCheck,
  ShieldAlert,
  DoorOpen,
  Smartphone,
  Search,
} from "lucide-react";
import { RoomAccessDialog } from "@/app/user/rooms/room-access-dialog";

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

export default function RoomsClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [selectedRoom, setSelectedRoom] = useState<RoomDTO | null>(null);
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchSectionRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleSearch = () => {
      let searchInput: HTMLInputElement | null = null;
      if (searchSectionRef.current) {
        searchInput = searchSectionRef.current.querySelector(
          "input",
        ) as HTMLInputElement;
      }
      if (!searchInput) {
        searchInput = document.querySelector("input") as HTMLInputElement;
      }
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    };

    const handleAdd = () => {
      setAddDialogOpen(true);
    };

    window.addEventListener("topbar-search", handleSearch);
    window.addEventListener("topbar-add", handleAdd);

    return () => {
      window.removeEventListener("topbar-search", handleSearch);
      window.removeEventListener("topbar-add", handleAdd);
    };
  }, []);

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

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case "PRIVATE":
        return <Lock className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case "SHARED":
        return (
          <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        );
      case "RESTRICTED":
        return (
          <ShieldAlert className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        );
      default:
        return <Users className="h-4 w-4 text-green-600 dark:text-green-400" />;
    }
  };

  const getPrivacyColor = (privacy: string) => {
    switch (privacy) {
      case "PRIVATE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "SHARED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "RESTRICTED":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
  };

  const activeHomes = new Set(roomsQuery.data?.map((r) => r.homeId) || []);
  const devicesInRooms = 0;

  const filteredRooms = roomsQuery.data?.filter((room) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      room.name.toLowerCase().includes(search) ||
      getHomeName(room.homeId).toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <PageHeader
        stats={[
          {
            label: t("totalRooms"),
            value: roomsQuery.data?.length || 0,
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
            value: devicesInRooms,
            icon: Smartphone,
            color: "text-purple-500",
          },
        ]}
      />

      {/* Search */}
      <div ref={searchSectionRef}>
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
          ) : !filteredRooms || filteredRooms.length === 0 ? (
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
            <div className="divide-y rounded-xl border">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium">{room.name}</span>
                      <Badge variant="outline">
                        {getHomeName(room.homeId)}
                      </Badge>
                      {/* Privacy Badge */}
                      <Badge
                        className={`flex items-center gap-1 ${getPrivacyColor(room.privacyLevel || "PUBLIC")}`}
                      >
                        {getPrivacyIcon(room.privacyLevel || "PUBLIC")}
                        <span className="text-xs">
                          {t(`privacy${room.privacyLevel || "PUBLIC"}` as any)}
                        </span>
                      </Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {t("createdAt")}:{" "}
                      {new Date(room.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {/* Access Control Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRoom(room);
                        setIsAccessDialogOpen(true);
                      }}
                      title={t("accessControl")}
                    >
                      <Shield className="h-4 w-4" />
                    </Button>

                    {/* Delete Button */}
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

      {/* Add Room Dialog - controlled externally */}
      {addDialogOpen && (
        <AddRoomDialogControlled
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
        />
      )}

      {/* Access Control Dialog */}
      {selectedRoom && (
        <RoomAccessDialog
          isOpen={isAccessDialogOpen}
          onClose={() => {
            setIsAccessDialogOpen(false);
            setSelectedRoom(null);
            queryClient.invalidateQueries({ queryKey: qk.rooms.all });
          }}
          roomId={selectedRoom.id}
          roomName={selectedRoom.name}
          homeId={selectedRoom.homeId}
          currentPrivacy={selectedRoom.privacyLevel || "PUBLIC"}
        />
      )}
    </div>
  );
}

// Controlled version of AddRoomDialog
function AddRoomDialogControlled({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Button variant="outline" onClick={() => onOpenChange(false)}>
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
