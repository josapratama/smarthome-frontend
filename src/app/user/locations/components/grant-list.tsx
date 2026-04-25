"use client";

import { Button } from "@/components/ui/button";
import { User, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "@/hooks/use-translation";
import type { RoomAccessGrant } from "@/lib/api/services/room-access";

const ACCESS_LEVEL_CLASS: Record<string, string> = {
  OWNER:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  CONTROL: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  VIEW: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

interface GrantListProps {
  grants: RoomAccessGrant[];
  onRevoke: (userId: number, username: string) => void;
}

export function GrantList({ grants, onRevoke }: GrantListProps) {
  const { t } = useTranslation();

  if (grants.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>{t("noAccessGrants")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {grants.map((grant) => (
        <div
          key={grant.id}
          className="flex items-center justify-between p-4 rounded-lg border bg-card"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{grant.user.username}</p>
              <p className="text-sm text-muted-foreground truncate">
                {grant.user.email}
              </p>
            </div>

            {/* Access level badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${
                ACCESS_LEVEL_CLASS[grant.accessLevel] ?? ACCESS_LEVEL_CLASS.VIEW
              }`}
            >
              {t(`access${grant.accessLevel}` as any)}
            </span>

            {/* Expiration */}
            {grant.expiresAt && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                <Clock className="w-4 h-4" />
                <span>{format(new Date(grant.expiresAt), "MMM dd, yyyy")}</span>
              </div>
            )}
          </div>

          {/* Revoke */}
          <Button
            variant="ghost"
            size="icon"
            className="ml-4 text-destructive hover:text-destructive shrink-0"
            title={t("revokeAccess")}
            onClick={() => onRevoke(grant.userId, grant.user.username)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
