"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";
import {
  getRoomGrants,
  grantRoomAccess,
  revokeRoomAccess,
  type RoomAccessGrant,
  type RoomAccessLevel,
} from "@/lib/api/services/room-access";
import { getHomeMembers } from "@/lib/api/services/homes";

export const ACCESS_LEVEL_OPTIONS: RoomAccessLevel[] = [
  "OWNER",
  "CONTROL",
  "VIEW",
];

export function useRoomAccess(roomId: number, homeId: number) {
  const { t } = useTranslation();
  const [grants, setGrants] = useState<RoomAccessGrant[]>([]);
  const [homeMembers, setHomeMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGranting, setIsGranting] = useState(false);
  const [showGrantForm, setShowGrantForm] = useState(false);

  // Grant form state
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedAccessLevel, setSelectedAccessLevel] =
    useState<RoomAccessLevel>("CONTROL");
  const [expiresAt, setExpiresAt] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [grantsData, membersData] = await Promise.all([
        getRoomGrants(roomId),
        getHomeMembers(homeId),
      ]);
      setGrants(grantsData);
      setHomeMembers(membersData);
    } catch (error: any) {
      toast.error(
        error.message || t("failedToLoadData") || "Failed to load data",
      );
    } finally {
      setIsLoading(false);
    }
  }, [roomId, homeId, t]);

  const handleGrantAccess = async () => {
    if (!selectedUserId) {
      toast.error(t("selectUser"));
      return;
    }
    setIsGranting(true);
    try {
      await grantRoomAccess(
        roomId,
        selectedUserId,
        selectedAccessLevel,
        expiresAt || undefined,
      );
      toast.success(t("accessGranted"));
      setShowGrantForm(false);
      setSelectedUserId(null);
      setExpiresAt("");
      loadData();
    } catch (error: any) {
      toast.error(error.message || t("failedGrantAccess"));
    } finally {
      setIsGranting(false);
    }
  };

  const [revokeDialogUserId, setRevokeDialogUserId] = useState<number | null>(
    null,
  );
  const [revokeDialogUsername, setRevokeDialogUsername] = useState("");

  const openRevokeDialog = (userId: number, username: string) => {
    setRevokeDialogUserId(userId);
    setRevokeDialogUsername(username);
  };

  const handleRevokeAccess = async () => {
    if (!revokeDialogUserId) return;
    try {
      await revokeRoomAccess(roomId, revokeDialogUserId);
      toast.success(t("accessRevoked"));
      setRevokeDialogUserId(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || t("failedRevokeAccess"));
    }
  };

  const cancelRevoke = () => setRevokeDialogUserId(null);

  // Users not yet granted access
  const availableUsers = useMemo(
    () =>
      homeMembers.filter(
        (member) => !grants.some((grant) => grant.userId === member.userId),
      ),
    [homeMembers, grants],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
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
    // Revoke dialog
    revokeDialogUserId,
    revokeDialogUsername,
    openRevokeDialog,
    handleRevokeAccess,
    cancelRevoke,
  };
}
