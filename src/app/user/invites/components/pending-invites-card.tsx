"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { PendingInvitesList } from "./pending-invites-list";
import type { PendingInvite } from "../hooks/use-pending-invites";

interface PendingInvitesCardProps {
  invites: PendingInvite[];
  isLoading: boolean;
  onAccept: (homeId: number) => void;
  onDecline: (homeId: number) => void;
  isAccepting: boolean;
  isDeclining: boolean;
}

export function PendingInvitesCard({
  invites,
  isLoading,
  onAccept,
  onDecline,
  isAccepting,
  isDeclining,
}: PendingInvitesCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          {t("pendingInvitations")}
        </CardTitle>
        <CardDescription>{t("acceptOrDeclineHomeInvitations")}</CardDescription>
      </CardHeader>
      <CardContent>
        <PendingInvitesList
          invites={invites}
          isLoading={isLoading}
          onAccept={onAccept}
          onDecline={onDecline}
          isAccepting={isAccepting}
          isDeclining={isDeclining}
        />
      </CardContent>
    </Card>
  );
}
