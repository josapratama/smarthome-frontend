"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  MoreHorizontal,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetchBrowser } from "@/lib/api/client.browser";

interface PendingInvite {
  homeMemberId: number;
  userId: number;
  homeId: number;
  homeName: string;
  userEmail: string;
  roleInHome: "MEMBER" | "GUEST";
  status: "INVITED" | "ACTIVE" | "REVOKED";
  invitedAt: string;
  joinedAt?: string;
}

export function InviteList() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: invites, isLoading } = useQuery({
    queryKey: ["pending-invites"],
    queryFn: async () => {
      const response = await apiFetchBrowser<{ data: PendingInvite[] }>(
        "/api/v1/admin/pending-invites",
      );
      return response.data || [];
    },
  });

  const resendMutation = useMutation({
    mutationFn: async ({
      homeId,
      userId,
    }: {
      homeId: number;
      userId: number;
    }) => {
      await apiFetchBrowser(
        `/api/v1/homes/${homeId}/members/${userId}/resend`,
        {
          method: "POST",
        },
      );
    },
    onSuccess: () => {
      toast.success(t("inviteResent"));
      queryClient.invalidateQueries({ queryKey: ["pending-invites"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || t("failedResendInvite"));
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async ({
      homeId,
      userId,
    }: {
      homeId: number;
      userId: number;
    }) => {
      await apiFetchBrowser(`/api/v1/homes/${homeId}/members/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast.success(t("inviteRevoked"));
      queryClient.invalidateQueries({ queryKey: ["pending-invites"] });
      queryClient.invalidateQueries({ queryKey: ["invite-stats"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || t("failedRevokeInvite"));
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "INVITED":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "ACTIVE":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "REVOKED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "INVITED":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "REVOKED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t("pendingInvitations")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!invites || invites.length === 0) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t("pendingInvitations")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Mail className="h-10 w-10 text-muted-foreground/50" />
            <h3 className="mt-3 text-sm font-semibold">
              {t("noPendingInvitations")}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("sentInvitationsWillAppear")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{t("pendingInvitations")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {invites.map((invite) => (
          <div
            key={`${invite.homeId}-${invite.userId}`}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(invite.status)}
              <div>
                <div className="font-medium text-sm">{invite.userEmail}</div>
                <div className="text-xs text-muted-foreground">
                  {invite.homeName} • {invite.roleInHome.toLowerCase()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("invited")}{" "}
                  {format(new Date(invite.invitedAt), "MMM d, yyyy")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs ${getStatusColor(invite.status)}`}
              >
                {invite.status.toLowerCase()}
              </Badge>

              {invite.status === "INVITED" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        resendMutation.mutate({
                          homeId: invite.homeId,
                          userId: invite.userId,
                        })
                      }
                      disabled={resendMutation.isPending}
                    >
                      <RefreshCw className="h-4 w-4" />
                      {t("resendInvitation")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        revokeMutation.mutate({
                          homeId: invite.homeId,
                          userId: invite.userId,
                        })
                      }
                      disabled={revokeMutation.isPending}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t("revokeInvitation")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
