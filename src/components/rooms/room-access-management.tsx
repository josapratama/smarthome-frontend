"use client";

import { useState, useEffect } from "react";
import {
  getRoomGrants,
  grantRoomAccess,
  revokeRoomAccess,
  type RoomAccessGrant,
  type RoomAccessLevel,
} from "@/lib/api/room-access";
import { getHomeMembers } from "@/lib/api/homes";
import { UserPlus, Trash2, Clock, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useTranslation } from "@/hooks/use-translation";

interface RoomAccessManagementProps {
  roomId: number;
  homeId: number;
}

const accessLevelOptions: RoomAccessLevel[] = ["OWNER", "CONTROL", "VIEW"];

export function RoomAccessManagement({
  roomId,
  homeId,
}: RoomAccessManagementProps) {
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
  const [expiresAt, setExpiresAt] = useState<string>("");

  useEffect(() => {
    loadData();
  }, [roomId, homeId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [grantsData, membersData] = await Promise.all([
        getRoomGrants(roomId),
        getHomeMembers(homeId),
      ]);
      setGrants(grantsData);
      setHomeMembers(membersData);
    } catch (error: any) {
      toast.error(error.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

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
      await loadData();
    } catch (error: any) {
      toast.error(error.message || t("failedGrantAccess"));
    } finally {
      setIsGranting(false);
    }
  };

  const handleRevokeAccess = async (userId: number, username: string) => {
    if (!confirm(`${t("confirmRevokeAccess")} ${username}?`)) {
      return;
    }

    try {
      await revokeRoomAccess(roomId, userId);
      toast.success(t("accessRevoked"));
      await loadData();
    } catch (error: any) {
      toast.error(error.message || t("failedRevokeAccess"));
    }
  };

  // Filter out users who already have access
  const availableUsers = homeMembers.filter(
    (member) => !grants.some((grant) => grant.userId === member.userId),
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("manageAccess")}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {grants.length} {grants.length === 1 ? "user has" : "users have"}{" "}
            access
          </p>
        </div>
        <button
          onClick={() => setShowGrantForm(!showGrantForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t("grantAccess")}</span>
        </button>
      </div>

      {/* Grant Form */}
      {showGrantForm && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">
            {t("grantAccess")}
          </h4>

          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("selectUser")}
            </label>
            <select
              value={selectedUserId || ""}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">{t("selectUser")}</option>
              {availableUsers.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.user.username} ({member.user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Access Level Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("selectAccessLevel")}
            </label>
            <select
              value={selectedAccessLevel}
              onChange={(e) =>
                setSelectedAccessLevel(e.target.value as RoomAccessLevel)
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {accessLevelOptions.map((level) => (
                <option key={level} value={level}>
                  {t(`access${level}` as any)} -{" "}
                  {t(`access${level}Desc` as any)}
                </option>
              ))}
            </select>
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("setExpiration")}
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t("noExpiration")}
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={handleGrantAccess}
              disabled={isGranting || !selectedUserId}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGranting ? t("loading") : t("grantAccess")}
            </button>
            <button
              onClick={() => {
                setShowGrantForm(false);
                setSelectedUserId(null);
                setExpiresAt("");
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}

      {/* Grants List */}
      <div className="space-y-3">
        {grants.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{t("noAccessGrants")}</p>
          </div>
        ) : (
          grants.map((grant) => (
            <div
              key={grant.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                {/* User Avatar */}
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {grant.user.username}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {grant.user.email}
                  </p>
                </div>

                {/* Access Level Badge */}
                <div className="flex-shrink-0">
                  <span
                    className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${
                      grant.accessLevel === "OWNER"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                        : grant.accessLevel === "CONTROL"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }
                  `}
                  >
                    {t(`access${grant.accessLevel}` as any)}
                  </span>
                </div>

                {/* Expiration */}
                {grant.expiresAt && (
                  <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                    <Clock className="w-4 h-4" />
                    <span>
                      {format(new Date(grant.expiresAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                )}
              </div>

              {/* Revoke Button */}
              <button
                onClick={() =>
                  handleRevokeAccess(grant.userId, grant.user.username)
                }
                className="ml-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                title={t("revokeAccess")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
