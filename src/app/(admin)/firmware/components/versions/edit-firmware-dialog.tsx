"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import type { FirmwareReleaseDTO } from "@/lib/api/dto/firmware.dto";
import { formatFileSize } from "../../lib/firmware.utils";

interface EditFirmwareDialogProps {
  firmware: FirmwareReleaseDTO;
}

export function EditFirmwareDialog({ firmware }: EditFirmwareDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(firmware.notes ?? "");
  const [file, setFile] = useState<File | null>(null);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("notes", notes);
        return apiFetchBrowser(`/api/v1/firmware/releases/${firmware.id}`, {
          method: "PATCH",
          body: fd,
        });
      }
      return apiFetchBrowser(`/api/v1/firmware/releases/${firmware.id}`, {
        method: "PATCH",
        body: JSON.stringify({ releaseNotes: notes }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.firmware.releases() });
      setOpen(false);
      setFile(null);
      toast({ title: t("firmwareUpdated") });
    },
    onError: (err: any) =>
      toast({
        title: t("failedUpdateFirmware"),
        description: err.message || t("unknownError"),
        variant: "destructive",
      }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("editFirmware")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label>{t("appVersion")}</Label>
            <Input value={firmware.version} disabled />
          </div>

          <div className="space-y-1">
            <Label>{t("appPlatform")}</Label>
            <Input value={firmware.platform} disabled />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-file">
              {t("replaceFirmwareFile")} ({t("optional")})
            </Label>
            <Input
              id="edit-file"
              type="file"
              accept=".bin,.hex,.elf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                {t("selectedFile")}: {file.name} ({formatFileSize(file.size)})
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-notes">{t("releaseNotes")}</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("whatsNew")}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? t("saving") : t("save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
