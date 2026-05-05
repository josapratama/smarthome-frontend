"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import type { HomeDTO } from "@/lib/api/dto/homes.dto";
import type { RoomCreateRequest } from "@/lib/api/dto/rooms.dto";

interface AddRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const INITIAL = { name: "", homeId: "" };

export function AddRoomDialog({ open, onOpenChange }: AddRoomDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(INITIAL);

  const homesQuery = useQuery({
    queryKey: qk.homes.list(),
    queryFn: async () => {
      const res = await apiFetchBrowser<{ data: HomeDTO[] }>("/api/v1/homes");
      return res.data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: RoomCreateRequest) =>
      apiFetchBrowser(`/api/v1/homes/${data.homeId}/rooms`, {
        method: "POST",
        body: JSON.stringify({ name: data.name }),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.rooms.all });
      onOpenChange(false);
      setForm(INITIAL);
      toast({ title: t("roomCreated"), variant: "success" });
    },
    onError: (err: any) =>
      toast({
        title: t("failedCreateRoom"),
        description: err.message || t("unknownError"),
        variant: "destructive",
      }),
  });

  function handleSubmit() {
    if (!form.name || !form.homeId) {
      toast({
        title: t("validationError"),
        description: t("fillAllFields"),
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate({ name: form.name, homeId: Number(form.homeId) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("addNewRoom")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="room-home">
              {t("home")} {t("required")}
            </Label>
            <Select
              value={form.homeId}
              onValueChange={(v) => setForm((p) => ({ ...p, homeId: v }))}
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

          <div className="space-y-1">
            <Label htmlFor="room-name">
              {t("roomName")} {t("required")}
            </Label>
            <Input
              id="room-name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder={t("roomNamePlaceholder")}
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
