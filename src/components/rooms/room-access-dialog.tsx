"use client";

import { useState } from "react";
import { X, Shield, Users } from "lucide-react";
import { RoomPrivacySettings } from "./room-privacy-settings";
import { RoomAccessManagement } from "./room-access-management";
import { useTranslation } from "@/hooks/use-translation";

interface RoomAccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: number;
  roomName: string;
  homeId: number;
  currentPrivacy: "PUBLIC" | "PRIVATE" | "SHARED" | "RESTRICTED";
}

export function RoomAccessDialog({
  isOpen,
  onClose,
  roomId,
  roomName,
  homeId,
  currentPrivacy,
}: RoomAccessDialogProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"privacy" | "access">("privacy");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t("accessControl")}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {roomName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
          <button
            onClick={() => setActiveTab("privacy")}
            className={`
              flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors
              ${
                activeTab === "privacy"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }
            `}
          >
            <Shield className="w-4 h-4" />
            <span className="font-medium">{t("privacySettings")}</span>
          </button>
          <button
            onClick={() => setActiveTab("access")}
            className={`
              flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors
              ${
                activeTab === "access"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }
            `}
          >
            <Users className="w-4 h-4" />
            <span className="font-medium">{t("manageAccess")}</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "privacy" ? (
            <RoomPrivacySettings
              roomId={roomId}
              currentPrivacy={currentPrivacy}
              onUpdate={() => {
                // Optionally refresh parent component
              }}
            />
          ) : (
            <RoomAccessManagement roomId={roomId} homeId={homeId} />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
