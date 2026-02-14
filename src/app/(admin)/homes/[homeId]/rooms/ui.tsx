"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client.browser";
import type { RoomDTO, RoomCreateRequest } from "@/lib/api/dto/rooms.dto";

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
import { ArrowLeft } from "lucide-react";

function fmtDateTime(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
}

function CreateRoomDialog({ homeId }: { homeId: number }) {
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
      toast({ title: "Room created successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to create room",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Room</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Room</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Room Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Living Room, Kitchen"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(formData)}
              disabled={!formData.name || createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function RoomsClient({ homeId }: { homeId: number }) {
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/homes">
            <ArrowLeft className="h-4 w-4" />
            Back to Homes
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Rooms</h1>
          <p className="text-sm text-muted-foreground">
            Manage rooms for Home #{homeId}.
          </p>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search rooms..."
            className="sm:w-[300px]"
          />
          <Button
            variant="outline"
            onClick={() => q.refetch()}
            disabled={q.isFetching}
          >
            Refresh
          </Button>
          <CreateRoomDialog homeId={homeId} />
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Rooms List</CardTitle>
        </CardHeader>

        <CardContent>
          {q.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : q.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {(q.error as Error).message}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              {searchText ? "No rooms match your search." : "No rooms found."}
            </div>
          ) : (
            <div className="divide-y rounded-xl border">
              {filtered.map((room) => (
                <div
                  key={room.id}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">
                        #{room.id} • {room.name}
                      </span>
                      {room.deletedAt && (
                        <span className="text-xs text-red-600">(Deleted)</span>
                      )}
                    </div>

                    <div className="mt-1 text-xs text-muted-foreground">
                      Created: {fmtDateTime(room.createdAt)}
                      {room.deletedAt &&
                        ` • Deleted: ${fmtDateTime(room.deletedAt)}`}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <Link
                      className="text-sm underline underline-offset-4 hover:opacity-80"
                      href={`/devices?homeId=${homeId}&roomId=${room.id}`}
                    >
                      View Devices
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {q.isFetching && !q.isLoading ? (
            <div className="mt-3 text-xs text-muted-foreground">Updating…</div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
