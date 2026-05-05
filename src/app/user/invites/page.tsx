"use client";

import { useTranslation } from "@/hooks/use-translation";
import { usePendingInvites } from "./hooks";
import { PendingInvitesCard, InvitationsInfo } from "./components";

export default function UserInvitesPage() {
  const { t } = useTranslation();
  const {
    invites,
    isLoading,
    acceptInvite,
    declineInvite,
    isAccepting,
    isDeclining,
  } = usePendingInvites();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t("invitations")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("manageYourHomeInvitations")}
        </p>
      </div>

      {/* Pending Invitations */}
      <PendingInvitesCard
        invites={invites}
        isLoading={isLoading}
        onAccept={acceptInvite}
        onDecline={declineInvite}
        isAccepting={isAccepting}
        isDeclining={isDeclining}
      />

      {/* Information */}
      <InvitationsInfo />
    </div>
  );
}
