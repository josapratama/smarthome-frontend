"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { apiFetchBrowser } from "@/lib/api/client/fetch";

export interface PendingInvite {
  homeId: number;
  homeName: string;
  inviterName: string;
  inviterEmail: string;
  roleInHome: "MEMBER" | "GUEST";
  invitedAt: string;
  status: "INVITED";
}

export function usePendingInvites() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: invites, isLoading } = useQuery({
    queryKey: ["user-pending-invites"],
    queryFn: async () => {
      const response = await apiFetchBrowser<{ data: PendingInvite[] }>(
        "/api/v1/user/pending-invites",
      );
      return response.data || [];
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (homeId: number) => {
      await apiFetchBrowser(`/api/v1/homes/${homeId}/accept-invite`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast.success(t("invitationAcceptedSuccess"));
      queryClient.invalidateQueries({ queryKey: ["user-pending-invites"] });
      queryClient.invalidateQueries({ queryKey: ["user-homes"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || t("failedToAcceptInvitation"));
    },
  });

  const declineMutation = useMutation({
    mutationFn: async (homeId: number) => {
      await apiFetchBrowser(`/api/v1/homes/${homeId}/decline-invite`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast.success(t("invitationDeclined"));
      queryClient.invalidateQueries({ queryKey: ["user-pending-invites"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || t("failedToDeclineInvitation"));
    },
  });

  return {
    invites: invites || [],
    isLoading,
    acceptInvite: acceptMutation.mutate,
    declineInvite: declineMutation.mutate,
    isAccepting: acceptMutation.isPending,
    isDeclining: declineMutation.isPending,
  };
}
