"use client";

import { Room } from "@/lib/api/client/rooms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DoorOpen, Trash2 } from "lucide-react";
import { roomsApi } from "@/lib/api/client/rooms";
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

interface RoomCardProps {
  room: Room;
  deviceCount: number;
  onDelete: () => void;
}

export function RoomCard({ room, deviceCount, onDelete }: RoomCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await roomsApi.delete(room.id);
      toast.success("Room deleted successfully");
      setDeleteDialogOpen(false);
      onDelete();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete room");
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
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </CardHeader>
        <CardContent>
          {room.description && (
            <p className="text-sm text-muted-foreground mb-3">
              {room.description}
            </p>
          )}
          <div className="text-sm text-muted-foreground">
            {deviceCount} {deviceCount === 1 ? "device" : "devices"}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{room.name}"? Devices in this
              room will not be deleted, but will be unassigned from the room.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
