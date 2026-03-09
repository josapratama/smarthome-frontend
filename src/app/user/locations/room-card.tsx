"use client";

import { useTranslation } from "@/hooks/use-translation";
import { Room } from "@/lib/api/services/rooms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DoorOpen, Trash2, Shield } from "lucide-react";
import { roomsApi } from "@/lib/api/services/rooms";
import { toast } from "sonner";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RoomAccessDialog } from "./room-access-dialog";

interface RoomCardProps {
  room: Room;
  deviceCount: number;
  onDelete: () => void;
}

export function RoomCard({ room, deviceCount, onDelete }: RoomCardProps) {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await roomsApi.delete(room.id);
      toast.success(t("roomDeletedSuccess") || "Room deleted successfully");
      setDeleteDialogOpen(false);
      onDelete();
    } catch (error: any) {
      toast.error(
        error.message || t("failedToDeleteRoom") || "Failed to delete room",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <DoorOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{room.name}</CardTitle>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setAccessDialogOpen(true)}
              title={t("accessControl") || "Access Control"}
            >
              <Shield className="h-4 w-4 text-blue-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {room.description && (
            <p className="text-sm text-muted-foreground mb-3">
              {room.description}
            </p>
          )}
          <div className="text-sm text-muted-foreground">
            {deviceCount}{" "}
            {deviceCount === 1
              ? t("device") || "device"
              : t("devices") || "devices"}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("deleteRoom") || "Delete Room"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteRoomConfirm") || "Are you sure you want to delete"} "
              {room.name}"?{" "}
              {t("devicesWillBeUnassigned") ||
                "Devices in this room will not be deleted, but will be unassigned from the room."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("cancel") || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting
                ? t("deleting") || "Deleting..."
                : t("delete") || "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RoomAccessDialog
        isOpen={accessDialogOpen}
        onClose={() => setAccessDialogOpen(false)}
        roomId={room.id}
        roomName={room.name}
        homeId={room.homeId}
        currentPrivacy={room.privacyLevel || "PUBLIC"}
      />
    </>
  );
}
