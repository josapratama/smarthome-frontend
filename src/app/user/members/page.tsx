"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useHomes, useMembers, useCurrentUser } from "./hooks";
import {
  EmptyState,
  HomeSelector,
  MembersStats,
  MembersContent,
  InviteMemberDialog,
} from "./components";

export default function UserMembersPage() {
  const { t } = useTranslation();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const { currentUserId } = useCurrentUser();
  const {
    homes,
    selectedHomeId,
    setSelectedHomeId,
    selectedHome,
    isLoading: isLoadingHomes,
  } = useHomes();

  const {
    members,
    isLoading: isLoadingMembers,
    stats,
    refetch: refetchMembers,
  } = useMembers(selectedHomeId ? parseInt(selectedHomeId) : null);

  const isOwner = selectedHome?.ownerUserId === currentUserId;
  const isLoading = isLoadingHomes || isLoadingMembers;

  // Loading state
  if (isLoadingHomes && homes.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  // Empty state
  if (homes.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("members")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("manageHomeMembersAndInvites")}
          </p>
        </div>
        {isOwner && selectedHomeId && (
          <Button onClick={() => setInviteDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("inviteMember")}
          </Button>
        )}
      </div>

      {/* Home Selector */}
      <HomeSelector
        homes={homes}
        selectedHomeId={selectedHomeId}
        onSelectHome={setSelectedHomeId}
        currentUserId={currentUserId}
      />

      {/* Statistics */}
      <MembersStats stats={stats} />

      {/* Members List */}
      <MembersContent
        members={members}
        homeId={parseInt(selectedHomeId)}
        currentUserId={currentUserId}
        isOwner={isOwner}
        isLoading={isLoading}
        onUpdate={refetchMembers}
      />

      {/* Invite Dialog */}
      {selectedHomeId && (
        <InviteMemberDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          homeId={parseInt(selectedHomeId)}
          onSuccess={refetchMembers}
        />
      )}
    </div>
  );
}
