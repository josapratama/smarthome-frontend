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

interface DeviceDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deviceId: number;
  deviceName: string;
  onConfirm: () => void;
  isDeleting: boolean;
  t: (key: string) => string;
}

export function DeviceDeleteDialog({
  open,
  onOpenChange,
  deviceId,
  deviceName,
  onConfirm,
  isDeleting,
  t,
}: DeviceDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("areYouSure")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteDeviceConfirm")}{" "}
            <span className="font-semibold">{deviceName}</span> (#{deviceId}).{" "}
            {t("cannotUndo")}
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
