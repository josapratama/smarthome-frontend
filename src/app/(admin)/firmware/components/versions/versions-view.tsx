"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import type { FirmwareReleaseDTO } from "@/lib/api/dto/firmware.dto";
import { useTranslation } from "@/hooks/use-translation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Search, Upload } from "lucide-react";

import { FirmwareStats } from "./firmware-stats";
import { FirmwareCard } from "./firmware-card";
import { UploadFirmwareDialog } from "./upload-firmware-dialog";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export function VersionsView() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const firmwareQuery = useQuery({
    queryKey: qk.firmware.releases(),
    queryFn: async () => {
      const res = await apiFetchBrowser<{ data: FirmwareReleaseDTO[] }>(
        "/api/v1/firmware/releases",
      );
      return res.data ?? [];
    },
  });

  // ── Topbar events ─────────────────────────────────────────
  useEffect(() => {
    const onSearch = () => {
      const input =
        searchRef.current?.querySelector("input") ??
        (document.querySelector("input") as HTMLInputElement | null);
      input?.focus();
      input?.select();
    };
    window.addEventListener("topbar-search", onSearch);
    window.addEventListener("topbar-add", () => setUploadOpen(true));
    return () => {
      window.removeEventListener("topbar-search", onSearch);
      window.removeEventListener("topbar-add", () => {});
    };
  }, []);

  const filtered = (firmwareQuery.data ?? []).filter((fw) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      fw.version.toLowerCase().includes(q) ||
      fw.platform.toLowerCase().includes(q) ||
      (fw.notes ?? "").toLowerCase().includes(q)
    );
  });

  const data = firmwareQuery.data ?? [];
  const stats = {
    total: data.length,
    latestVersion: data[0]?.version ?? "-",
    esp32Count: data.filter((f) => f.platform.includes("ESP32")).length,
    esp8266Count: data.filter((f) => f.platform === "ESP8266").length,
  };

  return (
    <div className="space-y-6">
      <FirmwareStats {...stats} />

      {/* Search + Upload */}
      <div ref={searchRef} className="flex gap-3 items-center">
        <Card className="flex-1">
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
        <Button onClick={() => setUploadOpen(true)} className="shrink-0">
          <Upload className="h-4 w-4 mr-2" />
          {t("uploadFirmware")}
        </Button>
      </div>

      {/* List */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {t("firmwareReleases")} ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {firmwareQuery.isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : firmwareQuery.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              {(firmwareQuery.error as Error).message}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">
                {searchQuery
                  ? t("noFirmwareMatchSearch")
                  : t("noFirmwareFound")}
              </h3>
              {!searchQuery && (
                <p className="text-sm text-muted-foreground">
                  {t("uploadFirstFirmware")}
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((fw) => (
                <FirmwareCard
                  key={fw.id}
                  firmware={fw}
                  apiBaseUrl={API_BASE_URL}
                />
              ))}
            </div>
          )}
          {firmwareQuery.isFetching && !firmwareQuery.isLoading && (
            <p className="mt-3 text-xs text-muted-foreground">
              {t("updating")}
            </p>
          )}
        </CardContent>
      </Card>

      <UploadFirmwareDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
