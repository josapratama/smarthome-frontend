"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";

export interface AppInfoItem {
  key: string;
  value: string;
  displayOrder: number;
}

export interface AppInfoData {
  general?: AppInfoItem[];
  about?: AppInfoItem[];
  contact?: AppInfoItem[];
  legal?: AppInfoItem[];
}

export function useAppInfo() {
  const { t } = useTranslation();
  const [appInfo, setAppInfo] = useState<AppInfoData>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppInfo();
  }, []);

  const loadAppInfo = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/app-info");
      const data = await res.json();
      if (res.ok) {
        setAppInfo(data.data);
      } else {
        toast.error(t("failedToLoadAppInfo"));
      }
    } catch (error) {
      console.error("Failed to load app info:", error);
      toast.error(t("failedToLoadAppInfo"));
    } finally {
      setIsLoading(false);
    }
  };

  const hasData = Object.keys(appInfo).length > 0;

  return {
    appInfo,
    isLoading,
    hasData,
    refetch: loadAppInfo,
  };
}
