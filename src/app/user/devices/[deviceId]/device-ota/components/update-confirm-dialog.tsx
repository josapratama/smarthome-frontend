"use client";

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
import { useTranslation } from "@/hooks/use-translation";
import { formatBytes } from "./firmware-releases";
import type { FirmwareRelease } from "@/lib/api/services/ota";

interface UpdateConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  release: FirmwareRelease | null;
  onConfirm: () => void;
}

export function UpdateConfirmDialog({
  open,
  onOpenChange,
  release,
  onConfirm,
}: UpdateConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("confirmFirmwareUpdate")}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <p>{t("firmwareUpdateWarning")}</p>
              {release && (
                <div className="mt-4 p-3 bg-muted rounded space-y-1 text-sm">
                  <div>
                    <strong>{t("version")}:</strong> {release.version}
                  </div>
                  <div>
                    <strong>{t("platform")}:</strong> {release.platform}
                  </div>
                  <div>
                    <strong>{t("size")}:</strong>{" "}
                    {formatBytes(release.sizeBytes)}
                  </div>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {t("update")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
