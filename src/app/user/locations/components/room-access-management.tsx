"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserPlus, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useRoomAccess } from "../hooks/use-room-access";
import { GrantAccessForm } from "./grant-access-form";
import { GrantList } from "./grant-list";

interface RoomAccessManagementProps {
  roomId: number;
  homeId: number;
}

export function RoomAccessManagement({
  roomId,
  homeId,
}: RoomAccessManagementProps) {
  const { t } = useTranslation();
  const {
    grants,
    isLoading,
    isGranting,
    showGrantForm,
    setShowGrantForm,
    selectedUserId,
    setSelectedUserId,
    selectedAccessLevel,
    setSelectedAccessLevel,
    expiresAt,
    setExpiresAt,
    availableUsers,
    handleGrantAccess,
    revokeDialogUserId,
    revokeDialogUsername,
    openRevokeDialog,
    handleRevokeAccess,
    cancelRevoke,
  } = useRoomAccess(roomId, homeId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t("manageAccess")}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {grants.length}{" "}
            {grants.length === 1
              ? t("userHasAccess") || "user has access"
              : t("usersHaveAccess") || "users have access"}
          </p>
        </div>
        <Button
          onClick={() => setShowGrantForm(!showGrantForm)}
          className="gap-2"
        >
          <UserPlus className="h-4 w-4" />
          {t("grantAccess")}
        </Button>
      </div>

      {/* Grant form */}
      {showGrantForm && (
        <GrantAccessForm
          availableUsers={availableUsers}
          selectedUserId={selectedUserId}
          onSelectUser={setSelectedUserId}
          selectedAccessLevel={selectedAccessLevel}
          onSelectAccessLevel={setSelectedAccessLevel}
          expiresAt={expiresAt}
          onExpiresAtChange={setExpiresAt}
          isGranting={isGranting}
          onGrant={handleGrantAccess}
          onCancel={() => {
            setShowGrantForm(false);
            setSelectedUserId(null);
            setExpiresAt("");
          }}
        />
      )}

      {/* Grants list */}
      <GrantList grants={grants} onRevoke={openRevokeDialog} />

      {/* Revoke confirmation dialog */}
      <AlertDialog
        open={!!revokeDialogUserId}
        onOpenChange={(open) => !open && cancelRevoke()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("revokeAccess")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmRevokeAccess") || "Revoke access for"} &ldquo;
              {revokeDialogUsername}&rdquo;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelRevoke}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeAccess}>
              {t("revoke") || "Revoke"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
