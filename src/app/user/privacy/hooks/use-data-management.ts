"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { downloadUserData, deleteUserData } from "@/lib/api/services/privacy";

export function useDataManagement() {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDownloadData = async () => {
    setIsProcessing(true);
    try {
      const data = await downloadUserData();

      // Convert to JSON and download
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `my-data-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(t("dataDownloaded"));
    } catch (error) {
      console.error("Failed to download data:", error);
      toast.error(t("failedToDownloadData"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteData = async () => {
    if (!confirm(t("deleteDataConfirm"))) return;

    setIsProcessing(true);
    try {
      await deleteUserData();
      toast.success(t("dataDeleted"));

      // Redirect to login after a delay
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 2000);
    } catch (error) {
      console.error("Failed to delete data:", error);
      toast.error(t("failedToDeleteData"));
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleDownloadData,
    handleDeleteData,
  };
}
