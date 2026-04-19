"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Edit, Shield, Lock, Users, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api/client/axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";

interface Room {
  id: number;
  name: string;
  privacyLevel: string;
  ownerId: number | null;
  home: {
    name: string;
  };
  owner?: {
    username: string;
  };
  _count: {
    devices: number;
    accessGrants: number;
  };
}

export default function RoomPrivacyTab() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [newPrivacyLevel, setNewPrivacyLevel] = useState("");
  const { toast } = useToast();
  const { t } = useTranslation();
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get("/v1/rooms");
      setRooms(response.data.data || []);
    } catch (error: any) {
      // Silently handle 404 errors (endpoint not implemented yet)
      if (error.response?.status !== 404) {
        toast({
          title: t("error"),
          description: error.response?.data?.error || t("failedFetchRooms"),
          variant: "destructive",
        });
      }
      console.log("Rooms fetch error:", error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const updatePrivacy = async () => {
    if (!editRoom) return;

    try {
      await api.patch(`/v1/rooms/${editRoom.id}`, {
        privacyLevel: newPrivacyLevel,
      });
      toast({
        title: t("success"),
        description: t("roomPrivacyUpdatedSuccess"),
      });
      setEditRoom(null);
      fetchRooms();
    } catch (error: any) {
      toast({
        title: t("error"),
        description:
          error.response?.data?.error || t("failedUpdatePrivacyLevel"),
        variant: "destructive",
      });
    }
  };

  const getPrivacyIcon = (level: string) => {
    switch (level) {
      case "PUBLIC":
        return <Users className="h-4 w-4" />;
      case "PRIVATE":
        return <Lock className="h-4 w-4" />;
      case "SHARED":
        return <Shield className="h-4 w-4" />;
      case "RESTRICTED":
        return <Eye className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getPrivacyBadge = (level: string) => {
    const variants: Record<string, any> = {
      PUBLIC: "success",
      PRIVATE: "destructive",
      SHARED: "default",
      RESTRICTED: "secondary",
    };
    return (
      <Badge variant={variants[level] || "outline"} className="gap-1">
        {getPrivacyIcon(level)}
        {level}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-4 grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">{t("public")}</p>
              <p className="text-2xl font-bold">
                {rooms.filter((r) => r.privacyLevel === "PUBLIC").length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">{t("shared")}</p>
              <p className="text-2xl font-bold">
                {rooms.filter((r) => r.privacyLevel === "SHARED").length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Lock className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">{t("private")}</p>
              <p className="text-2xl font-bold">
                {rooms.filter((r) => r.privacyLevel === "PRIVATE").length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Eye className="h-8 w-8 text-amber-600" />
            <div>
              <p className="text-sm text-muted-foreground">{t("restricted")}</p>
              <p className="text-2xl font-bold">
                {rooms.filter((r) => r.privacyLevel === "RESTRICTED").length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {t("roomPrivacySettings")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {rooms.length} {t("rooms")}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchRooms}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("refresh")}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              {t("noRoomsFound")}
            </div>
          ) : (
            rooms
              .filter((room) => room && room.home)
              .map((room) => (
                <Card key={room.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{room.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {room.home.name}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditRoom(room);
                          setNewPrivacyLevel(room.privacyLevel);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("privacy")}
                      </span>
                      {getPrivacyBadge(room.privacyLevel)}
                    </div>

                    {room.owner && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {t("owner")}
                        </span>
                        <span className="text-sm font-medium">
                          {room.owner.username}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t pt-3">
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          {t("devices")}:{" "}
                        </span>
                        <span className="font-medium">
                          {room._count?.devices || 0}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          {t("grants")}:{" "}
                        </span>
                        <span className="font-medium">
                          {room._count?.accessGrants || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
          )}
        </div>
      </Card>

      <Dialog open={editRoom !== null} onOpenChange={() => setEditRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("updateRoomPrivacy")}</DialogTitle>
            <DialogDescription>
              {t("changePrivacyLevelFor")} {editRoom?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("privacyLevel")}</Label>
              <Select
                value={newPrivacyLevel}
                onValueChange={setNewPrivacyLevel}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {t("publicAllHomeMembersCanAccess")}
                    </div>
                  </SelectItem>
                  <SelectItem value="SHARED">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      {t("sharedOwnerPlusSelectedMembers")}
                    </div>
                  </SelectItem>
                  <SelectItem value="PRIVATE">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      {t("privateOnlyOwnerPlusGrantedUsers")}
                    </div>
                  </SelectItem>
                  <SelectItem value="RESTRICTED">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      {t("restrictedOnlyHomeOwnerAdmin")}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRoom(null)}>
              {t("cancel")}
            </Button>
            <Button onClick={updatePrivacy}>{t("updatePrivacy")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
