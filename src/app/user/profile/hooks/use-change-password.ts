"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import type { PasswordForm } from "../types";

const INITIAL_PASSWORD_FORM: PasswordForm = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function useChangePassword() {
  const { t } = useTranslation();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(
    INITIAL_PASSWORD_FORM,
  );

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t("passwordsDoNotMatch"));
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error(t("passwordMinLength"));
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const remainingChanges = data.data?.remainingChanges;
        toast.success(
          t("passwordChangedSuccess").replace(
            "{count}",
            (remainingChanges ?? 0).toString(),
          ),
        );
        setPasswordForm(INITIAL_PASSWORD_FORM);
        setShowPasswordForm(false);
      } else {
        const data = await res.json();
        const errorMap: Record<string, string> = {
          PASSWORD_CHANGE_LIMIT_EXCEEDED: t("passwordChangeLimitExceeded"),
          INVALID_CREDENTIALS: t("currentPasswordIncorrect"),
        };
        toast.error(
          errorMap[data.error] || data.error || t("failedChangePassword"),
        );
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error(t("failedChangePassword"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setShowPasswordForm(false);
    setPasswordForm(INITIAL_PASSWORD_FORM);
  };

  const updateField = (field: keyof PasswordForm, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  return {
    showPasswordForm,
    setShowPasswordForm,
    isSaving,
    passwordForm,
    updateField,
    handleChangePassword,
    handleCancel,
  };
}
