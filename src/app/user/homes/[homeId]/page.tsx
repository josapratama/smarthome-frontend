"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { homesApi, Home } from "@/lib/api/client/homes";
import { roomsApi, Room } from "@/lib/api/client/rooms";
import { devicesApi, DeviceWithDetails } from "@/lib/api/client/devices";
import { membersApi, HomeMember } from "@/lib/api/client/members";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Plus,
  Home as HomeIcon,
  DoorOpen,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { CreateRoomDialog } from "@/components/user/create-room-dialog";
import { RoomCard } from "@/components/user/room-card";
import { InviteMemberDialog } from "@/components/user/invite-member-dialog";
import { MembersList } from "@/components/user/members-list";
import { useTranslation } from "@/hooks/use-translation";

export default function HomeDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const homeId = Number(params.homeId);

  const [home, setHome] = useState<Home | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [devices, setDevices] = useState<DeviceWithDetails[]>([]);
  const [members, setMembers] = useState<HomeMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [createRoomDialogOpen, setCreateRoomDialogOpen] = useState(false);
  const [inviteMemberDialogOpen, setInviteMemberDialogOpen] = useState(false);

  useEffect(() => {
    // Get current user ID
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.id) {
          setCurrentUserId(data.data.id);
        }
      })
      .catch(console.error);

    if (homeId) {
      loadData();
    }
  }, [homeId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [homeData, roomsData, devicesData, membersData] = await Promise.all(
        [
          homesApi.getById(homeId),
          roomsApi.listByHome(homeId),
          devicesApi.list(homeId),
          membersApi.listByHome(homeId),
        ],
      );
      setHome(homeData);
      setRooms(roomsData);
      setDevices(devicesData);
      setMembers(membersData);
    } catch (error: any) {
      toast.error(
        error.message ||
          t("failedToLoadHomeDetails") ||
          "Failed to load home details",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!home) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">
          {t("homeNotFound") || "Home Not Found"}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t("homeNotFoundDesc") ||
            "The home you're looking for doesn't exist."}
        </p>
        <Link href="/user/homes">
          <Button>{t("backToHomes") || "Back to Homes"}</Button>
        </Link>
      </div>
    );
  }

  const devicesInHome = devices.filter((d) => d.homeId === homeId);
  const onlineDevices = devicesInHome.filter((d) => d.status === "ONLINE");
  const isOwner = home && currentUserId && home.ownerUserId === currentUserId;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/user/homes")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{home.name}</h1>
          {home.addressText && (
            <p className="text-muted-foreground mt-1">{home.addressText}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalRooms") || "Total Rooms"}
            </CardTitle>
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalDevices") || "Total Devices"}
            </CardTitle>
            <HomeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devicesInHome.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("onlineDevices") || "Online Devices"}
            </CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {onlineDevices.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("members") || "Members"}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Rooms */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{t("rooms") || "Rooms"}</h2>
          <Button onClick={() => setCreateRoomDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("addRoom") || "Add Room"}
          </Button>
        </div>

        {rooms.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <DoorOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {t("noRoomsYet") || "No Rooms Yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t("createRoomsDesc") ||
                  "Create rooms to organize your devices better."}
              </p>
              <Button onClick={() => setCreateRoomDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t("addRoom") || "Add Room"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => {
              const roomDevices = devices.filter((d) => d.roomId === room.id);
              return (
                <RoomCard
                  key={room.id}
                  room={room}
                  deviceCount={roomDevices.length}
                  onDelete={() => loadData()}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Members */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{t("members") || "Members"}</h2>
          {isOwner && (
            <Button onClick={() => setInviteMemberDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("inviteMember") || "Invite Member"}
            </Button>
          )}
        </div>

        {currentUserId && (
          <MembersList
            members={members}
            homeId={homeId}
            currentUserId={currentUserId}
            onUpdate={loadData}
          />
        )}
      </div>

      <CreateRoomDialog
        open={createRoomDialogOpen}
        onOpenChange={setCreateRoomDialogOpen}
        homeId={homeId}
        onSuccess={loadData}
      />

      {isOwner && (
        <InviteMemberDialog
          open={inviteMemberDialogOpen}
          onOpenChange={setInviteMemberDialogOpen}
          homeId={homeId}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
