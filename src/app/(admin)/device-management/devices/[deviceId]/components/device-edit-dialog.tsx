"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DeviceEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deviceId: number;
  name: string;
  type: string;
  onNameChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onSave: () => void;
  isSaving: boolean;
  t: (key: string) => string;
}

export function DeviceEditDialog({
  open,
  onOpenChange,
  deviceId,
  name,
  type,
  onNameChange,
  onTypeChange,
  onSave,
  isSaving,
  t,
}: DeviceEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("edit")} {t("device")}
          </DialogTitle>
          <DialogDescription>
            {t("updateDeviceInfo")} #{deviceId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">{t("deviceName")}</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder={t("enterDeviceName")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-type">{t("deviceType")}</Label>
            <Select value={type} onValueChange={onTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SENSOR_NODE">{t("sensorNode")}</SelectItem>
                <SelectItem value="LIGHT">{t("light")}</SelectItem>
                <SelectItem value="FAN">{t("fan")}</SelectItem>
                <SelectItem value="DOOR">{t("door")}</SelectItem>
                <SelectItem value="POWER_METER">{t("powerMeter")}</SelectItem>
                <SelectItem value="ENERGY_MONITOR">Energy Monitor</SelectItem>
                <SelectItem value="OTHER">{t("other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            {t("cancel")}
          </Button>
          <Button onClick={onSave} disabled={isSaving || !name.trim()}>
            {isSaving ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
