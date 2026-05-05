"use client";

import { usePendingInvites } from "./hooks";
import { PendingInvitesCard } from "./components";

/**
 * Self-contained UserInvites widget — shows pending home invitations.
 * Used on the dashboard to surface invites without navigating away.
 */
export function UserInvites() {
  const {
    invites,
    isLoading,
    acceptInvite,
    declineInvite,
    isAccepting,
    isDeclining,
  } = usePendingInvites();

  if (!isLoading && invites.length === 0) return null;

  return (
    <PendingInvitesCard
      invites={invites}
      isLoading={isLoading}
      onAccept={acceptInvite}
      onDecline={declineInvite}
      isAccepting={isAccepting}
      isDeclining={isDeclining}
    />
  );
}
