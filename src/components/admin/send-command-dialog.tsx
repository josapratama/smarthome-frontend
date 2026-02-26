"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/language-context";

interface Device {
  id: number;
  name: string;
  macAddress: string;
  type: string;
  status: string;
}

interface SendCommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SendCommandDialog({
  open,
  onOpenChange,
  onSuccess,
}: SendCommandDialogProps) {
  const { t } = useLanguage();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [formData, setFormData] = useState({
    deviceId: "",
    type: "",
    payload: "{}",
  });

  useEffect(() => {
    if (open) {
      loadDevices();
    }
  }, [open]);

  const loadDevices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/devices");
      const data = await res.json();
      if (res.ok) {
        setDevices(data.data || []);
      }
    } catch (error) {
      console.error("Error loading devices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.deviceId || !formData.type) {
      toast.error(t("fillAllFields"));
      return;
    }

    // Validate JSON payload
    try {
      JSON.parse(formData.payload);
    } catch (error) {
      toast.error("Invalid JSON payload");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch(`/api/v1/devices/${formData.deviceId}/commands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.type,
          payload: JSON.parse(formData.payload),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(t("commandSent"));
        onOpenChange(false);
        setFormData({ deviceId: "", type: "", payload: "{}" });
        onSuccess?.();
      } else {
        toast.error(data.error || t("failedSendCommand"));
      }
    } catch (error) {
      toast.error(t("failedSendCommand"));
    } finally {
      setIsSending(false);
    }
  };

  const handleCommandTypeChange = (type: string) => {
    setFormData({ ...formData, type });

    // Set default payload based on command type
    switch (type) {
      case "relay_set":
        setFormData({
          ...formData,
          type,
          payload: JSON.stringify({ state: "on" }, null, 2),
        });
        break;
      case "relay_toggle":
        setFormData({ ...formData, type, payload: "{}" });
        break;
      case "get_status":
        setFormData({ ...formData, type, payload: "{}" });
        break;
      case "reboot":
        setFormData({ ...formData, type, payload: "{}" });
        break;
      default:
        setFormData({ ...formData, type, payload: "{}" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("sendCommand")}</DialogTitle>
            <DialogDescription>
              Send a control command to a device via MQTT
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="device">{t("selectDevice")}</Label>
              <Select
                value={formData.deviceId}
                onValueChange={(value) =>
                  setFormData({ ...formData, deviceId: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={isLoading ? t("loading") : t("selectDevice")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((device) => (
                    <SelectItem key={device.id} value={device.id.toString()}>
                      {device.name} ({device.macAddress})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">{t("commandType")}</Label>
              <Select
                value={formData.type}
                onValueChange={handleCommandTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("commandType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relay_set">Relay Set (On/Off)</SelectItem>
                  <SelectItem value="relay_toggle">Relay Toggle</SelectItem>
                  <SelectItem value="get_status">Get Status</SelectItem>
                  <SelectItem value="reboot">Reboot Device</SelectItem>
                  <SelectItem value="custom">Custom Command</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payload">{t("commandPayload")}</Label>
              <Textarea
                id="payload"
                value={formData.payload}
                onChange={(e) =>
                  setFormData({ ...formData, payload: e.target.value })
                }
                placeholder='{"state": "on"}'
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                JSON format. Example: {`{"state": "on"}`}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSending}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSending}>
              {isSending ? t("sending") : t("sendCommand")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
