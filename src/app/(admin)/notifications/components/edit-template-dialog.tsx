"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import type { NotificationTemplate } from "../types";
import { apiFetchBrowser } from "@/lib/api/client/fetch";

interface EditTemplateDialogProps {
  template: NotificationTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditTemplateDialog({
  template,
  open,
  onOpenChange,
  onSuccess,
}: EditTemplateDialogProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    channel: template?.channel ?? "FCM",
    emailSubject: template?.emailSubject ?? "",
    emailBody: template?.emailBody ?? "",
    pushTitle: template?.pushTitle ?? "",
    pushBody: template?.pushBody ?? "",
    pushIcon: template?.pushIcon ?? "",
    pushSound: template?.pushSound ?? "default",
    isActive: template?.isActive ?? true,
  });
  const [isSaving, setIsSaving] = useState(false);

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!template) return;
    setIsSaving(true);
    try {
      await apiFetchBrowser(
        `/api/v1/notifications/templates/${template.type}`,
        {
          method: "PATCH",
          body: JSON.stringify(form),
        },
      );
      toast.success(t("templateUpdated"));
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || t("failedUpdateTemplate"));
    } finally {
      setIsSaving(false);
    }
  }

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("editTemplate")}</DialogTitle>
          <DialogDescription>{t("updateTemplateSettings")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Channel */}
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
                <SelectItem value="FCM">{t("pushNotificationFcm")}</SelectItem>
                <SelectItem value="EMAIL">{t("email")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.channel === "EMAIL" ? (
            <>
              <div className="space-y-2">
                <Label>{t("emailSubject")}</Label>
                <Input
                  placeholder="e.g., {{homeName}} - Alert"
                  value={form.emailSubject}
                  onChange={(e) => update("emailSubject", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {t("useDynamicValues")}
                </p>
              </div>
              <div className="space-y-2">
                <Label>{t("emailBodyHtml")}</Label>
                <Textarea
                  placeholder={t("htmlContentWithVariables")}
                  value={form.emailBody}
                  onChange={(e) => update("emailBody", e.target.value)}
                  rows={8}
                />
                <p className="text-xs text-muted-foreground">
                  {t("supportsHtmlPlaceholders")}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>{t("pushTitle")}</Label>
                <Input
                  placeholder="e.g., 🔥 Fire Alert!"
                  value={form.pushTitle}
                  onChange={(e) => update("pushTitle", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {t("useDynamicValues")}
                </p>
              </div>
              <div className="space-y-2">
                <Label>{t("pushBody")}</Label>
                <Textarea
                  placeholder="e.g., Fire detected in {{roomName}} at {{homeName}}"
                  value={form.pushBody}
                  onChange={(e) => update("pushBody", e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {t("useDynamicValues")}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("iconUrlOptional")}</Label>
                  <Input
                    placeholder="https://..."
                    value={form.pushIcon}
                    onChange={(e) => update("pushIcon", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("sound")}</Label>
                  <Select
                    value={form.pushSound}
                    onValueChange={(v) => update("pushSound", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">{t("default")}</SelectItem>
                      <SelectItem value="alarm">{t("alarm")}</SelectItem>
                      <SelectItem value="alert">{t("alert")}</SelectItem>
                      <SelectItem value="notification">
                        {t("notification")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <Switch
              id="isActive"
              checked={form.isActive}
              onCheckedChange={(v) => update("isActive", v)}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              {t("templateIsActive")}
            </Label>
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
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? t("saving") : t("saveChanges")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
