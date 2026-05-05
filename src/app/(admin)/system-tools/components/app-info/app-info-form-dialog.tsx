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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export interface AppInfoFormData {
  key: string;
  value: string;
  category: string;
  displayOrder: number;
  isPublic: boolean;
}

interface AppInfoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  formData: AppInfoFormData;
  onChange: (data: AppInfoFormData) => void;
  onSave: () => void;
}

export function AppInfoFormDialog({
  open,
  onOpenChange,
  isEditing,
  formData,
  onChange,
  onSave,
}: AppInfoFormDialogProps) {
  const { t } = useTranslation();

  function update<K extends keyof AppInfoFormData>(
    key: K,
    value: AppInfoFormData[K],
  ) {
    onChange({ ...formData, [key]: value });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("editAppInfo") : t("addAppInfo")}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t("updateAppInfo") : t("addNewAppInfo")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Key */}
          <div className="space-y-2">
            <Label htmlFor="ai-key">{t("key")}</Label>
            <Input
              id="ai-key"
              value={formData.key}
              onChange={(e) => update("key", e.target.value)}
              placeholder={t("keyPlaceholder")}
              disabled={isEditing}
            />
            <p className="text-xs text-muted-foreground">
              {t("keyDescription")}
            </p>
          </div>

          {/* Value */}
          <div className="space-y-2">
            <Label htmlFor="ai-value">{t("value")}</Label>
            <Textarea
              id="ai-value"
              value={formData.value}
              onChange={(e) => update("value", e.target.value)}
              placeholder={t("enterValue")}
              rows={4}
            />
          </div>

          {/* Category + Display Order */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ai-category">{t("category")}</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => update("category", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">{t("general")}</SelectItem>
                  <SelectItem value="about">{t("about")}</SelectItem>
                  <SelectItem value="contact">{t("contact")}</SelectItem>
                  <SelectItem value="legal">{t("legal")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-order">{t("displayOrder")}</Label>
              <Input
                id="ai-order"
                type="number"
                value={formData.displayOrder}
                onChange={(e) =>
                  update("displayOrder", parseInt(e.target.value) || 0)
                }
              />
            </div>
          </div>

          {/* Public */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ai-public"
              checked={formData.isPublic}
              onChange={(e) => update("isPublic", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="ai-public" className="cursor-pointer">
              {t("publicVisibility")}
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
