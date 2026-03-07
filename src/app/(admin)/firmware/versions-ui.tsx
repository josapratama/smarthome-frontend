"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client.browser";
import type { FirmwareReleaseDTO } from "@/lib/api/dto/firmware.dto";
import { useTranslation } from "@/hooks/use-translation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import {
  Pencil,
  Trash2,
  Package,
  Upload,
  Smartphone,
  Clock,
  Search,
} from "lucide-react";

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
              {t("appPlatform")} {t("required")}
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
              {t("appVersion")} {t("required")}
            </Label>
            <Input
              id="version"
              value={formData.version}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, version: e.target.value }))
              }
              placeholder={t("versionPlaceholder")}
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

function EditFirmwareDialog({ firmware }: { firmware: FirmwareReleaseDTO }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(firmware.notes || "");
  const [file, setFile] = useState<File | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  const updateMutation = useMutation({
    mutationFn: async (data: { releaseNotes: string; file: File | null }) => {
      if (data.file) {
        // Upload new file
        const form = new FormData();
        form.append("file", data.file);
        form.append("notes", data.releaseNotes);

        return apiFetchBrowser(`/api/v1/firmware/releases/${firmware.id}`, {
          method: "PATCH",
          body: form,
        });
      } else {
        // Update notes only
        return apiFetchBrowser(`/api/v1/firmware/releases/${firmware.id}`, {
          method: "PATCH",
          body: JSON.stringify({ releaseNotes: data.releaseNotes }),
          headers: { "Content-Type": "application/json" },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.firmware.releases() });
      setOpen(false);
      setFile(null);
      toast({ title: t("firmwareUpdated") });
    },
    onError: (error: any) => {
      toast({
        title: t("failedUpdateFirmware"),
        description: error.message || t("unknownError"),
        variant: "destructive",
      });
    },
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
          <div>
            <Label>{t("appVersion")}</Label>
            <Input value={firmware.version} disabled />
          </div>

          <div>
            <Label>{t("appPlatform")}</Label>
            <Input value={firmware.platform} disabled />
          </div>

          <div>
            <Label htmlFor="file">
              {t("replaceFirmwareFile")} ({t("optional")})
            </Label>
            <Input
              id="file"
              type="file"
              accept=".bin,.hex,.elf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file && (
              <p className="text-xs text-muted-foreground mt-1">
                {t("selectedFile")}: {file.name} ({formatFileSize(file.size)})
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">{t("releaseNotes")}</Label>
            <Textarea
              id="notes"
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
              onClick={() =>
                updateMutation.mutate({ releaseNotes: notes, file })
              }
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

function DeleteFirmwareDialog({ firmware }: { firmware: FirmwareReleaseDTO }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiFetchBrowser(`/api/v1/firmware/releases/${firmware.id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.firmware.releases() });
      toast({ title: t("firmwareDeleted") });
    },
    onError: (error: any) => {
      toast({
        title: t("failedDeleteFirmware"),
        description: error.message || t("unknownError"),
        variant: "destructive",
      });
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteFirmware")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteFirmwareConfirm")} {firmware.version} ({firmware.platform}
            )?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? t("deleting") : t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function FirmwareVersionsUI() {
  const { t } = useTranslation();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchSectionRef = useRef<HTMLDivElement>(null);

  const q = useQuery({
    queryKey: qk.firmware.releases(),
    queryFn: async () => {
      const payload = await apiFetchBrowser<{ data: FirmwareReleaseDTO[] }>(
        "/api/v1/firmware/releases",
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
      setUploadDialogOpen(true);
    };

    window.addEventListener("topbar-search", handleSearch);
    window.addEventListener("topbar-add", handleAdd);

    return () => {
      window.removeEventListener("topbar-search", handleSearch);
      window.removeEventListener("topbar-add", handleAdd);
    };
  }, []);

  const filteredData = q.data?.filter((firmware) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      firmware.version.toLowerCase().includes(search) ||
      firmware.platform.toLowerCase().includes(search) ||
      firmware.notes?.toLowerCase().includes(search)
    );
  });

  const stats = {
    total: q.data?.length || 0,
    esp32: q.data?.filter((f) => f.platform.includes("ESP32")).length || 0,
    esp8266: q.data?.filter((f) => f.platform === "ESP8266").length || 0,
    latest: q.data?.[0]?.version || "-",
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("totalFirmware")}
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("latestVersion")}
                </p>
                <p className="text-lg font-bold">{stats.latest}</p>
              </div>
              <Upload className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ESP32</p>
                <p className="text-2xl font-bold">{stats.esp32}</p>
              </div>
              <Smartphone className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ESP8266</p>
                <p className="text-2xl font-bold">{stats.esp8266}</p>
              </div>
              <Smartphone className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div ref={searchSectionRef}>
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchFirmware")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {t("firmwareReleases")} ({filteredData?.length || 0})
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
          ) : !filteredData || filteredData.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              {searchQuery ? t("noFirmwareMatchSearch") : t("noFirmwareFound")}
            </div>
          ) : (
            <div className="divide-y rounded-xl border">
              {filteredData.map((firmware) => (
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
                      {t("size")}: {formatFileSize(firmware.sizeBytes)} •{" "}
                      {t("sha256")}: {firmware.sha256.substring(0, 12)}...
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

                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/v1/firmware/releases/${firmware.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("download")}
                      </a>
                    </Button>
                    <EditFirmwareDialog firmware={firmware} />
                    <DeleteFirmwareDialog firmware={firmware} />
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

      {/* Upload Dialog - controlled externally */}
      {uploadDialogOpen && (
        <UploadFirmwareDialogControlled
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
        />
      )}
    </div>
  );
}

// Controlled version of UploadFirmwareDialog
function UploadFirmwareDialogControlled({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              {t("appPlatform")} {t("required")}
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
              {t("appVersion")} {t("required")}
            </Label>
            <Input
              id="version"
              value={formData.version}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, version: e.target.value }))
              }
              placeholder={t("versionPlaceholder")}
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
            <Button variant="outline" onClick={() => onOpenChange(false)}>
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
