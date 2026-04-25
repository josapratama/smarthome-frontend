"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/use-translation";
import { MembersList } from "./members-list";
import type { HomeMember } from "@/lib/api/services/members";

interface MembersContentProps {
  members: HomeMember[];
  homeId: number;
  currentUserId: number;
  isOwner: boolean;
  isLoading: boolean;
  onUpdate: () => void;
}

export function MembersContent({
  members,
  homeId,
  currentUserId,
  isOwner,
  isLoading,
  onUpdate,
}: MembersContentProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("membersList")}</CardTitle>
        <CardDescription>
          {isOwner
            ? t("manageAccessAndPermissions")
            : t("viewHomeMembersAndRoles")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : (
          <MembersList
            members={members}
            homeId={homeId}
            currentUserId={currentUserId}
            onUpdate={onUpdate}
          />
        )}
      </CardContent>
    </Card>
  );
}
