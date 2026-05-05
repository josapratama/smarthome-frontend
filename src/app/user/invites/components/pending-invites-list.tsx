"use client";

import { format } from "date-fns";
import { CheckCircle, XCircle, Home, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/use-translation";
import type { PendingInvite } from "../hooks/use-pending-invites";

interface PendingInvitesListProps {
  invites: PendingInvite[];
  isLoading: boolean;
  onAccept: (homeId: number) => void;
  onDecline: (homeId: number) => void;
  isAccepting: boolean;
  isDeclining: boolean;
}

export function PendingInvitesList({
  invites,
  isLoading,
  onAccept,
  onDecline,
  isAccepting,
  isDeclining,
}: PendingInvitesListProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-4">
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
      </div>
    );
  }

  if (invites.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
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
                {t("invitedBy")} {invite.inviterName}
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
              onClick={() => onAccept(invite.homeId)}
              disabled={isAccepting || isDeclining}
            >
              {isAccepting ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <CheckCircle className="h-3 w-3 mr-1" />
              )}
              {t("accept")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDecline(invite.homeId)}
              disabled={isAccepting || isDeclining}
            >
              {isDeclining ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {t("decline")}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
