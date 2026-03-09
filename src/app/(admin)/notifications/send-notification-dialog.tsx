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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/language-context";
import type { SendNotificationForm } from "./types";
import { apiFetchBrowser } from "@/lib/api/client/fetch";

interface SendNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendNotificationDialog({
  open,
  onOpenChange,
}: SendNotificationDialogProps) {
  const { t } = useLanguage();
  const [sendForm, setSendForm] = useState<SendNotificationForm>({
    channel: "FCM",
    type: "CUSTOM",
    homeId: "",
    title: "",
    body: "",
    subject: "",
  });

  const handleSendNotification = async () => {
    try {
      const res = await apiFetchBrowser("/api/v1/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: sendForm.channel,
          type: sendForm.type,
          homeId: sendForm.homeId ? parseInt(sendForm.homeId) : undefined,
          customData: {
            title: sendForm.title,
            body: sendForm.body,
            subject: sendForm.subject,
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          `${t("notificationSent")}: ${data.data.sent} ${t("usersNotified")}`,
        );
        onOpenChange(false);
        setSendForm({
          channel: "FCM",
          type: "CUSTOM",
          homeId: "",
          title: "",
          body: "",
          subject: "",
        });
      } else {
        toast.error(data.error || t("failedSendNotification"));
      }
    } catch (error) {
      toast.error(t("failedSendNotification"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          {t("sendNotification")}
        </Button>
      </DialogTrigger>
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
                value={sendForm.channel}
                onValueChange={(val) =>
                  setSendForm({ ...sendForm, channel: val })
                }
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
                value={sendForm.type}
                onValueChange={(val) => setSendForm({ ...sendForm, type: val })}
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
              value={sendForm.homeId}
              onChange={(e) =>
                setSendForm({ ...sendForm, homeId: e.target.value })
              }
            />
          </div>

          {sendForm.channel === "FCM" ? (
            <>
              <div className="space-y-2">
                <Label>{t("title")}</Label>
                <Input
                  placeholder={t("notificationTitle")}
                  value={sendForm.title}
                  onChange={(e) =>
                    setSendForm({ ...sendForm, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("body")}</Label>
                <Textarea
                  placeholder={t("notificationBody")}
                  value={sendForm.body}
                  onChange={(e) =>
                    setSendForm({ ...sendForm, body: e.target.value })
                  }
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
                  value={sendForm.subject}
                  onChange={(e) =>
                    setSendForm({ ...sendForm, subject: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("bodyHtml")}</Label>
                <Textarea
                  placeholder={t("emailBodyHtml")}
                  value={sendForm.body}
                  onChange={(e) =>
                    setSendForm({ ...sendForm, body: e.target.value })
                  }
                  rows={6}
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSendNotification}>
            <Send className="h-4 w-4 mr-2" />
            {t("send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
