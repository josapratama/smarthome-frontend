"use client";

import { useState } from "react";
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

interface PasswordCardProps {
  isSaving: boolean;
  onChangePassword: (
    oldPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) => Promise<void>;
}

const EMPTY_FORM = { oldPassword: "", newPassword: "", confirmPassword: "" };

export function PasswordCard({
  isSaving,
  onChangePassword,
}: PasswordCardProps) {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  function update(key: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    await onChangePassword(
      form.oldPassword,
      form.newPassword,
      form.confirmPassword,
    );
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function handleCancel() {
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          {t("security")}
        </CardTitle>
        <CardDescription>{t("changePasswordDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        {!showForm ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowForm(true)}
          >
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
                value={form.oldPassword}
                onChange={(e) => update("oldPassword", e.target.value)}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("newPassword")}</Label>
              <Input
                id="newPassword"
                type="password"
                value={form.newPassword}
                onChange={(e) => update("newPassword", e.target.value)}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("confirmNewPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                disabled={isSaving}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? t("changingPassword") : t("changePassword")}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
