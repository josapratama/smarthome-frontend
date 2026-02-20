"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client.browser";
import type { FirmwareReleaseDTO } from "@/lib/api/dto/firmware.dto";
import { useTranslation } from "@/hooks/use-translation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

function fmtDateTime(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function UploadFirmwareDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    platform: "ESP32",
    version: "",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  const uploadMutation = useMutation({
    mutationFn: async (data: { formData: typeof formData; file: File }) => {
      const form = new FormData();
      form.append("file", data.file);
      form.append("platform", data.formData.platform);
      form.append("version", data.formData.version);
      form.append("notes", data.formData.description);

      return apiFetchBrowser("/api/v1/firmware/releases", {
        method: "POST",
        body: form,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.firmware.releases() });
      setOpen(false);
      setFormData({
        platform: "ESP32",
        version: "",
        description: "",
      });
      setFile(null);
      toast({ title: t("firmwareUploaded") });
    },
    onError: (error: any) => {
      toast({
        title: t("failedUploadFirmware"),
        description: error.message || t("unknownError"),
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{t("uploadFirmware")}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("uploadNewFirmware")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="file">
              {t("firmwareFile")} {t("required")}
            </Label>
            <Input
              id="file"
              type="file"
              accept=".bin,.hex,.elf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div>
            <Label htmlFor="platform">
              {t("platform")} {t("required")}
            </Label>
            <Select
              value={formData.platform}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, platform: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ESP32">ESP32</SelectItem>
                <SelectItem value="ESP32-C3">ESP32-C3</SelectItem>
                <SelectItem value="ESP32-S3">ESP32-S3</SelectItem>
                <SelectItem value="ESP8266">ESP8266</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="version">
              {t("version")} {t("required")}
            </Label>
            <Input
              id="version"
              value={formData.version}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, version: e.target.value }))
              }
              placeholder="e.g., 1.0.4"
            />
          </div>

          <div>
            <Label htmlFor="description">{t("releaseNotes")}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder={t("whatsNew")}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={() => file && uploadMutation.mutate({ formData, file })}
              disabled={!file || !formData.version || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? t("uploading") : t("upload")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function FirmwareClient() {
  const { t } = useTranslation();

  const q = useQuery({
    queryKey: qk.firmware.releases(),
    queryFn: async () => {
      const payload = await apiFetchBrowser<{ data: FirmwareReleaseDTO[] }>(
        "/api/v1/firmware/releases",
      );
      return payload.data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("firmware")}</h1>
          <p className="text-sm text-muted-foreground">{t("manageFirmware")}</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => q.refetch()}
            disabled={q.isFetching}
          >
            {t("refresh")}
          </Button>
          <UploadFirmwareDialog />
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {t("firmwareReleases")} ({q.data?.length || 0})
          </CardTitle>
        </CardHeader>

        <CardContent>
          {q.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : q.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {(q.error as Error).message}
            </div>
          ) : !q.data || q.data.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              {t("noFirmwareFound")}
            </div>
          ) : (
            <div className="divide-y rounded-xl border">
              {q.data.map((firmware) => (
                <div
                  key={firmware.id}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{firmware.version}</span>
                      <Badge variant="outline">{firmware.platform}</Badge>
                    </div>

                    <div className="mt-1 text-sm text-muted-foreground">
                      {t("size")}: {formatFileSize(firmware.sizeBytes)} •
                      SHA256: {firmware.sha256.substring(0, 12)}...
                    </div>

                    {firmware.notes && (
                      <div className="mt-1 text-sm text-muted-foreground">
                        {firmware.notes}
                      </div>
                    )}

                    <div className="mt-1 text-xs text-muted-foreground">
                      {t("released")}: {fmtDateTime(firmware.createdAt)}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`http://192.168.100.11:3000/api/v1/firmware/releases/${firmware.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("download")}
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {q.isFetching && !q.isLoading ? (
            <div className="mt-3 text-xs text-muted-foreground">
              {t("updating")}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
