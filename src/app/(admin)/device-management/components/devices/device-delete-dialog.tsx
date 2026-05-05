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
import type { DeviceDTO } from "@/lib/api/dto/devices.dto";

interface DeviceDeleteDialogProps {
  device: DeviceDTO | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeviceDeleteDialog({
  device,
  isDeleting,
  onConfirm,
  onClose,
}: DeviceDeleteDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={!!device} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("areYouSure")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteDeviceConfirm")}{" "}
            <span className="font-semibold">{device?.deviceName}</span> (#
            {device?.id}). {t("cannotUndo")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? t("deleting") : t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
