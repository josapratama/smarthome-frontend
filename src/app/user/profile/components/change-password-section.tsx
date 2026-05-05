"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { PasswordForm } from "../types";

interface ChangePasswordSectionProps {
  showPasswordForm: boolean;
  isSaving: boolean;
  passwordForm: PasswordForm;
  onShowForm: () => void;
  onFieldChange: (field: keyof PasswordForm, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function ChangePasswordSection({
  showPasswordForm,
  isSaving,
  passwordForm,
  onShowForm,
  onFieldChange,
  onSubmit,
  onCancel,
}: ChangePasswordSectionProps) {
  const { t } = useTranslation();

  return (
    <Card className="rounded-2xl shadow-sm border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Key className="h-5 w-5" />
          {t("security")}
        </CardTitle>
        <CardDescription className="text-sm">
          {t("changePasswordDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showPasswordForm ? (
          <Button variant="outline" className="w-full" onClick={onShowForm}>
            <Key className="h-4 w-4 mr-2" />
            {t("changePassword")}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
              ℹ️ {t("passwordChangeLimit")}
            </div>

            <div className="space-y-2">
              <Label htmlFor="oldPassword">{t("currentPassword")}</Label>
              <Input
                id="oldPassword"
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) => onFieldChange("oldPassword", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("newPassword")}</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => onFieldChange("newPassword", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("confirmNewPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  onFieldChange("confirmPassword", e.target.value)
                }
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={onSubmit} disabled={isSaving} className="flex-1">
                {isSaving ? t("changingPassword") : t("changePassword")}
              </Button>
              <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                {t("cancel")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
