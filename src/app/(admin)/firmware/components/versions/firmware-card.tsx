import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import type { FirmwareReleaseDTO } from "@/lib/api/dto/firmware.dto";
import { fmtDateTime, formatFileSize } from "../../lib/firmware.utils";
import { EditFirmwareDialog } from "./edit-firmware-dialog";
import { DeleteFirmwareDialog } from "./delete-firmware-dialog";

interface FirmwareCardProps {
  firmware: FirmwareReleaseDTO;
  apiBaseUrl: string;
}

export function FirmwareCard({ firmware, apiBaseUrl }: FirmwareCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-lg truncate block">
              {firmware.version}
            </span>
            <Badge variant="outline">{firmware.platform}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>{t("size")}:</span>
            <span className="font-mono">
              {formatFileSize(firmware.sizeBytes)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t("sha256")}:</span>
            <span className="font-mono truncate">
              {firmware.sha256.substring(0, 12)}...
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t("released")}:</span>
            <span>{fmtDateTime(firmware.createdAt)}</span>
          </div>
        </div>

        {firmware.notes && (
          <p className="text-sm text-muted-foreground border-t pt-2">
            {firmware.notes}
          </p>
        )}

        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <a
              href={`${apiBaseUrl}/api/v1/firmware/releases/${firmware.id}/download`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("download")}
            </a>
          </Button>
          <EditFirmwareDialog firmware={firmware} />
          <DeleteFirmwareDialog firmware={firmware} />
        </div>
      </CardContent>
    </Card>
  );
}
