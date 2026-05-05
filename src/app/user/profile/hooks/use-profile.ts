"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import type { UserProfile } from "../types";

export function useProfile() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedUsername, setEditedUsername] = useState("");
  const [editedEmail, setEditedEmail] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
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
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast.error(t("failedLoadProfile"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

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
        body: JSON.stringify({
          username: editedUsername,
          email: editedEmail,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setProfile(data.data);
        setIsEditing(false);
        toast.success(t("profileUpdated"));
      } else {
        toast.error(data.error || t("profileUpdateFailed"));
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error(t("profileUpdateFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditedUsername(profile.username);
      setEditedEmail(profile.email);
    }
    setIsEditing(false);
  };

  return {
    profile,
    isLoading,
    isEditing,
    isSaving,
    editedUsername,
    editedEmail,
    setEditedUsername,
    setEditedEmail,
    setIsEditing,
    handleSave,
    handleCancel,
    refetch: loadProfile,
  };
}
