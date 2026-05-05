"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";

import type { AdminProfile } from "../lib/profile.types";
import { ProfileCard } from "./profile-card";
import { AccountInfoCard } from "./account-info-card";
import { PasswordCard } from "./password-card";
import { AccountActionsCard } from "./account-actions-card";

export function ProfileView() {
  const router = useRouter();
  const { t } = useTranslation();

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [editedUsername, setEditedUsername] = useState("");
  const [editedEmail, setEditedEmail] = useState("");

  // ── Topbar title ──────────────────────────────────────────
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("topbar-title-change", { detail: t("profileSettings") }),
    );
    return () => {
      window.dispatchEvent(
        new CustomEvent("topbar-title-change", { detail: null }),
      );
    };
  }, [t]);

  // ── Load profile ──────────────────────────────────────────
  async function loadProfile() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (res.ok && data.data) {
        setProfile(data.data);
        setEditedUsername(data.data.username);
        setEditedEmail(data.data.email);
      } else {
        toast.error(t("failedLoadProfile"));
      }
    } catch {
      toast.error(t("failedLoadProfile"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save profile ──────────────────────────────────────────
  async function handleSave() {
    if (!editedUsername.trim()) {
      toast.error(t("usernameRequired"));
      return;
    }
    if (!editedEmail.trim() || !editedEmail.includes("@")) {
      toast.error(t("emailInvalid"));
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: editedUsername, email: editedEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.data);
        setIsEditing(false);
        toast.success(t("profileUpdated"));
      } else {
        toast.error(data.error || t("profileUpdateFailed"));
      }
    } catch {
      toast.error(t("profileUpdateFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    if (profile) {
      setEditedUsername(profile.username);
      setEditedEmail(profile.email);
    }
    setIsEditing(false);
  }

  // ── Avatar upload ─────────────────────────────────────────
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("pleaseSelectImage"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("imageSizeLimit"));
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await fetch("/api/auth/profile/avatar", {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        toast.success(t("avatarUploadedSuccess"));
        loadProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || t("failedUploadAvatar"));
      }
    } catch {
      toast.error(t("failedUploadAvatar"));
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  // ── Avatar delete ─────────────────────────────────────────
  async function handleDeleteAvatar() {
    if (!confirm(t("deleteAvatarConfirm"))) return;
    try {
      const res = await fetch("/api/auth/profile/avatar", { method: "DELETE" });
      if (res.ok) {
        toast.success(t("avatarDeletedSuccess"));
        loadProfile();
      } else toast.error(t("failedDeleteAvatar"));
    } catch {
      toast.error(t("failedDeleteAvatar"));
    }
  }

  // ── Change password ───────────────────────────────────────
  async function handleChangePassword(
    oldPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    if (newPassword !== confirmPassword) {
      toast.error(t("passwordsDoNotMatch"));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t("passwordMinLength"));
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      if (res.ok) {
        const data = await res.json();
        const remaining = data.data?.remainingChanges ?? 0;
        toast.success(
          t("passwordChangedSuccess").replace("{count}", String(remaining)),
        );
      } else {
        const data = await res.json();
        const msg =
          data.error === "PASSWORD_CHANGE_LIMIT_EXCEEDED"
            ? t("passwordChangeLimitExceeded")
            : data.error === "INVALID_CREDENTIALS"
              ? t("currentPasswordIncorrect")
              : data.error || t("failedChangePassword");
        toast.error(msg);
      }
    } catch {
      toast.error(t("failedChangePassword"));
    } finally {
      setIsSaving(false);
    }
  }

  // ── Logout ────────────────────────────────────────────────
  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      toast.error(t("failedLogout"));
    }
  }

  // ── Render ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("failedLoadProfile")}</p>
      </div>
    );
  }

  const isGoogleUser = profile.authProvider === "google";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left: avatar card */}
        <ProfileCard
          profile={profile}
          isUploadingAvatar={isUploadingAvatar}
          onAvatarUpload={handleAvatarUpload}
          onDeleteAvatar={handleDeleteAvatar}
        />

        {/* Right: account info + password + actions */}
        <div className="md:col-span-2 space-y-6">
          <AccountInfoCard
            profile={profile}
            isEditing={isEditing}
            isSaving={isSaving}
            editedUsername={editedUsername}
            editedEmail={editedEmail}
            onUsernameChange={setEditedUsername}
            onEmailChange={setEditedEmail}
            onEditStart={() => setIsEditing(true)}
            onSave={handleSave}
            onCancel={handleCancel}
          />

          <Separator />

          {!isGoogleUser && (
            <PasswordCard
              isSaving={isSaving}
              onChangePassword={handleChangePassword}
            />
          )}

          <AccountActionsCard onLogout={handleLogout} />
        </div>
      </div>
    </div>
  );
}
