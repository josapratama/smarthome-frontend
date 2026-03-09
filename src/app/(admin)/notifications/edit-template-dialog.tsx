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
import { toast } from "sonner";
import { useLanguage } from "@/contexts/language-context";
import type { NotificationTemplate } from "./types";
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
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    channel: template?.channel || "FCM",
    emailSubject: template?.emailSubject || "",
    emailBody: template?.emailBody || "",
    pushTitle: template?.pushTitle || "",
    pushBody: template?.pushBody || "",
    pushIcon: template?.pushIcon || "",
    pushSound: template?.pushSound || "default",
    isActive: template?.isActive ?? true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!template) return;

    setIsSaving(true);
    try {
      const res = await apiFetchBrowser(
        `/api/v1/notifications/templates/${template.type}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      if (res.ok) {
        toast.success(t("templateUpdated"));
        onSuccess();
      } else {
        const data = await res.json();
        toast.error(data.error || t("failedUpdateTemplate"));
      }
    } catch (error) {
      toast.error(t("failedUpdateTemplate"));
    } finally {
      setIsSaving(false);
    }
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("editTemplate")}</DialogTitle>
          <DialogDescription>{t("updateTemplateSettings")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("channel")}</Label>
            <Select
              value={formData.channel}
              onValueChange={(val) =>
                setFormData({ ...formData, channel: val })
              }
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

          {formData.channel === "EMAIL" ? (
            <>
              <div className="space-y-2">
                <Label>{t("emailSubject")}</Label>
                <Input
                  placeholder="e.g., {{homeName}} - Alert"
                  value={formData.emailSubject}
                  onChange={(e) =>
                    setFormData({ ...formData, emailSubject: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {t("useDynamicValues")}
                </p>
              </div>
              <div className="space-y-2">
                <Label>{t("emailBodyHtml")}</Label>
                <Textarea
                  placeholder={t("htmlContentWithVariables")}
                  value={formData.emailBody}
                  onChange={(e) =>
                    setFormData({ ...formData, emailBody: e.target.value })
                  }
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
                  value={formData.pushTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, pushTitle: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {t("useDynamicValues")}
                </p>
              </div>
              <div className="space-y-2">
                <Label>{t("pushBody")}</Label>
                <Textarea
                  placeholder="e.g., Fire detected in {{roomName}} at {{homeName}}"
                  value={formData.pushBody}
                  onChange={(e) =>
                    setFormData({ ...formData, pushBody: e.target.value })
                  }
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
                    value={formData.pushIcon}
                    onChange={(e) =>
                      setFormData({ ...formData, pushIcon: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("sound")}</Label>
                  <Select
                    value={formData.pushSound}
                    onValueChange={(val) =>
                      setFormData({ ...formData, pushSound: val })
                    }
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

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              {t("templateIsActive")}
            </Label>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
