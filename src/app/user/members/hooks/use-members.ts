"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";
import { membersApi, type HomeMember } from "@/lib/api/services/members";

export function useMembers(homeId: number | null) {
  const { t } = useTranslation();
  const [members, setMembers] = useState<HomeMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMembers = useCallback(async () => {
    if (!homeId) {
      setMembers([]);
      return;
    }

    setIsLoading(true);
    try {
      const membersData = await membersApi.listByHome(homeId);
      setMembers(membersData);
    } catch (error: any) {
      console.error("Failed to load members:", error);
      toast.error(error.message || t("failedToLoadMembers"));
    } finally {
      setIsLoading(false);
    }
  }, [homeId, t]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const stats = {
    total: members.length,
    active: members.filter((m) => m.status === "ACTIVE").length,
    invited: members.filter((m) => m.status === "INVITED").length,
    owners: members.filter((m) => m.roleInHome === "OWNER").length,
  };

  return {
    members,
    isLoading,
    stats,
    refetch: loadMembers,
  };
}
