"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";

export function useAvatar(onSuccess: () => void) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/auth/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success(t("avatarUploadedSuccess"));
        onSuccess();
      } else {
        const data = await res.json();
        toast.error(data.error || t("failedUploadAvatar"));
      }
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      toast.error(t("failedUploadAvatar"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("deleteAvatarConfirm"))) return;

    try {
      const res = await fetch("/api/auth/profile/avatar", {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(t("avatarDeletedSuccess"));
        onSuccess();
      } else {
        toast.error(t("failedDeleteAvatar"));
      }
    } catch (error) {
      console.error("Failed to delete avatar:", error);
      toast.error(t("failedDeleteAvatar"));
    }
  };

  const triggerUpload = () => fileInputRef.current?.click();

  return {
    fileInputRef,
    isUploading,
    handleUpload,
    handleDelete,
    triggerUpload,
  };
}
