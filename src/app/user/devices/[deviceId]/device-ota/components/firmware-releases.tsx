"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Package } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { FirmwareRelease } from "@/lib/api/services/ota";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

interface FirmwareReleasesProps {
  releases: FirmwareRelease[];
  onSelect: (release: FirmwareRelease) => void;
}

export function FirmwareReleases({
  releases,
  onSelect,
}: FirmwareReleasesProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {t("availableFirmware")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {releases.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{t("noFirmwareAvailable")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {releases.map((release) => (
              <div
                key={release.id}
                className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{release.version}</span>
                    <Badge variant="outline">{release.platform}</Badge>
                  </div>
                  {release.notes && (
                    <p className="text-sm text-muted-foreground">
                      {release.notes}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{formatBytes(release.sizeBytes)}</span>
                    <span>
                      {new Date(release.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button onClick={() => onSelect(release)} className="gap-2">
                  <Download className="h-4 w-4" />
                  {t("update")}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { formatBytes };
