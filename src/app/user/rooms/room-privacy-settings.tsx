"use client";

import { useState } from "react";
import { updateRoomPrivacy, type RoomPrivacy } from "@/lib/api/room-access";
import { Lock, Users, UserCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";

interface RoomPrivacySettingsProps {
  roomId: number;
  currentPrivacy: RoomPrivacy;
  onUpdate?: () => void;
}

const privacyOptions: Array<{
  value: RoomPrivacy;
  icon: typeof Lock;
  colorClass: string;
}> = [
  {
    value: "PUBLIC",
    icon: Users,
    colorClass: "text-green-600 dark:text-green-400",
  },
  {
    value: "PRIVATE",
    icon: Lock,
    colorClass: "text-red-600 dark:text-red-400",
  },
  {
    value: "SHARED",
    icon: UserCheck,
    colorClass: "text-blue-600 dark:text-blue-400",
  },
  {
    value: "RESTRICTED",
    icon: ShieldAlert,
    colorClass: "text-orange-600 dark:text-orange-400",
  },
];

export function RoomPrivacySettings({
  roomId,
  currentPrivacy,
  onUpdate,
}: RoomPrivacySettingsProps) {
  const { t } = useTranslation();
  const [privacy, setPrivacy] = useState<RoomPrivacy>(currentPrivacy);
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePrivacyChange = async (newPrivacy: RoomPrivacy) => {
    if (newPrivacy === privacy) return;

    setIsUpdating(true);
    try {
      await updateRoomPrivacy(roomId, newPrivacy);
      setPrivacy(newPrivacy);
      toast.success(t("privacyUpdated"));
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || t("failedUpdatePrivacy"));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t("privacySettings")}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("privacyLevel")}:{" "}
          <span className="font-medium">{t(`privacy${privacy}` as any)}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {privacyOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = privacy === option.value;
          const descKey = `privacy${option.value}Desc` as any;

          return (
            <button
              key={option.value}
              onClick={() => handlePrivacyChange(option.value)}
              disabled={isUpdating}
              className={`
                relative p-4 rounded-lg border-2 transition-all text-left
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }
                ${isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <Icon className={`w-6 h-6 mt-0.5 ${option.colorClass}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {t(`privacy${option.value}` as any)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t(descKey)}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
