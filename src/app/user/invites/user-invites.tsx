"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { CheckCircle, XCircle, Home, Mail, Clock, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetchBrowser } from "@/lib/api/client/fetch";

interface PendingInvite {
  homeId: number;
  homeName: string;
  inviterName: string;
  inviterEmail: string;
  roleInHome: "MEMBER" | "GUEST";
  invitedAt: string;
  status: "INVITED";
}

export function UserInvites() {
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
      toast.success("Invitation accepted successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-pending-invites"] });
      queryClient.invalidateQueries({ queryKey: ["user-homes"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to accept invitation");
    },
  });

  const declineMutation = useMutation({
    mutationFn: async (homeId: number) => {
      await apiFetchBrowser(`/api/v1/homes/${homeId}/decline-invite`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast.success("Invitation declined");
      queryClient.invalidateQueries({ queryKey: ["user-pending-invites"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to decline invitation");
    },
  });

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Pending Invitations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!invites || invites.length === 0) {
    return null; // Don't show the card if there are no invites
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-500" />
          Pending Invitations
          <Badge variant="secondary" className="ml-auto">
            {invites.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {invites.map((invite) => (
          <div
            key={invite.homeId}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Home className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium text-sm">{invite.homeName}</div>
                <div className="text-xs text-muted-foreground">
                  Invited by {invite.inviterName}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {invite.roleInHome.toLowerCase()}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(new Date(invite.invitedAt), "MMM d")}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => acceptMutation.mutate(invite.homeId)}
                disabled={acceptMutation.isPending || declineMutation.isPending}
              >
                {acceptMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCircle className="h-3 w-3" />
                )}
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => declineMutation.mutate(invite.homeId)}
                disabled={acceptMutation.isPending || declineMutation.isPending}
              >
                {declineMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                Decline
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
