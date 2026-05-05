"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface UploadFirmwareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const INITIAL_FORM = { platform: "ESP32", version: "", description: "" };

export function UploadFirmwareDialog({
  open,
  onOpenChange,
}: UploadFirmwareDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState(INITIAL_FORM);
  const [file, setFile] = useState<File | null>(null);

  function update<K extends keyof typeof INITIAL_FORM>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("platform", form.platform);
      fd.append("version", form.version);
      fd.append("notes", form.description);
      return apiFetchBrowser("/api/v1/firmware/releases", {
        method: "POST",
        body: fd,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.firmware.releases() });
      onOpenChange(false);
      setForm(INITIAL_FORM);
      setFile(null);
      toast({ title: t("firmwareUploaded") });
    },
    onError: (err: any) =>
      toast({
        title: t("failedUploadFirmware"),
        description: err.message || t("unknownError"),
        variant: "destructive",
      }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("uploadNewFirmware")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="fw-file">
              {t("firmwareFile")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fw-file"
              type="file"
              accept=".bin,.hex,.elf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="fw-platform">
              {t("appPlatform")} <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.platform}
              onValueChange={(v) => update("platform", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["ESP32", "ESP32-C3", "ESP32-S3", "ESP8266"].map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="fw-version">
              {t("appVersion")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fw-version"
              value={form.version}
              onChange={(e) => update("version", e.target.value)}
              placeholder={t("versionPlaceholder")}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="fw-notes">{t("releaseNotes")}</Label>
            <Textarea
              id="fw-notes"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder={t("whatsNew")}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={() => uploadMutation.mutate()}
              disabled={!file || !form.version || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? t("uploading") : t("upload")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
