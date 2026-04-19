"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import type { SendNotificationForm } from "../types";
import { apiFetchBrowser } from "@/lib/api/client/fetch";

const INITIAL_FORM: SendNotificationForm = {
  channel: "FCM",
  type: "CUSTOM",
  homeId: "",
  title: "",
  body: "",
  subject: "",
};

interface SendNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendNotificationDialog({
  open,
  onOpenChange,
}: SendNotificationDialogProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<SendNotificationForm>(INITIAL_FORM);
  const [isSending, setIsSending] = useState(false);

  function update<K extends keyof SendNotificationForm>(
    key: K,
    value: SendNotificationForm[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSend() {
    setIsSending(true);
    try {
      const res = await apiFetchBrowser<{ data: { sent: number } }>(
        "/api/v1/notifications/send",
        {
          method: "POST",
          body: JSON.stringify({
            channel: form.channel,
            type: form.type,
            homeId: form.homeId ? parseInt(form.homeId) : undefined,
            customData: {
              title: form.title,
              body: form.body,
              subject: form.subject,
            },
          }),
        },
      );
      toast.success(
        `${t("notificationSent")}: ${res.data.sent} ${t("usersNotified")}`,
      );
      onOpenChange(false);
      setForm(INITIAL_FORM);
    } catch (err: any) {
      toast.error(err.message || t("failedSendNotification"));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("sendNotification")}</DialogTitle>
          <DialogDescription>{t("sendCustomNotification")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("channel")}</Label>
              <Select
                value={form.channel}
                onValueChange={(v) => update("channel", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FCM">{t("pushNotifications")}</SelectItem>
                  <SelectItem value="EMAIL">{t("email")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("type")}</Label>
              <Select
                value={form.type}
                onValueChange={(v) => update("type", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOM">{t("custom")}</SelectItem>
                  <SelectItem value="ALARM_FIRE">{t("fireAlarm")}</SelectItem>
                  <SelectItem value="ALARM_GAS_LEAK">{t("gasLeak")}</SelectItem>
                  <SelectItem value="ALARM_TRASH_FULL">
                    {t("trashFull")}
                  </SelectItem>
                  <SelectItem value="ALARM_ANOMALY">{t("anomaly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("homeIdOptional")}</Label>
            <Input
              type="number"
              placeholder={t("enterHomeId")}
              value={form.homeId}
              onChange={(e) => update("homeId", e.target.value)}
            />
          </div>

          {form.channel === "FCM" ? (
            <>
              <div className="space-y-2">
                <Label>{t("title")}</Label>
                <Input
                  placeholder={t("notificationTitle")}
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("body")}</Label>
                <Textarea
                  placeholder={t("notificationBody")}
                  value={form.body}
                  onChange={(e) => update("body", e.target.value)}
                  rows={3}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>{t("subject")}</Label>
                <Input
                  placeholder={t("emailSubject")}
                  value={form.subject}
                  onChange={(e) => update("subject", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("bodyHtml")}</Label>
                <Textarea
                  placeholder={t("emailBodyHtml")}
                  value={form.body}
                  onChange={(e) => update("body", e.target.value)}
                  rows={6}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            {t("cancel")}
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            <Send className="h-4 w-4 mr-2" />
            {isSending ? t("sending") : t("send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
