"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Calendar } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { ProfileAvatar } from "./profile-avatar";
import { getDisplayName } from "../utils/profile";
import type { UserProfile } from "../types";

interface ProfileCardProps {
  profile: UserProfile;
  isGoogleUser: boolean;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteAvatar: () => void;
  onTriggerUpload: () => void;
}

export function ProfileCard({
  profile,
  isGoogleUser,
  isUploading,
  fileInputRef,
  onUpload,
  onDeleteAvatar,
  onTriggerUpload,
}: ProfileCardProps) {
  const { t } = useTranslation();
  const displayName = getDisplayName(profile);

  return (
    <Card className="md:col-span-1 rounded-2xl shadow-sm border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t("profile")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center text-center space-y-4">
          <ProfileAvatar
            profile={profile}
            isGoogleUser={isGoogleUser}
            isUploading={isUploading}
            fileInputRef={fileInputRef}
            onUpload={onUpload}
            onDelete={onDeleteAvatar}
            onTriggerUpload={onTriggerUpload}
          />

          <div>
            <h3 className="font-semibold text-lg">{displayName}</h3>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>

          <Badge variant={profile.role === "ADMIN" ? "default" : "secondary"}>
            <Shield className="h-3 w-3 mr-1" />
            {profile.role}
          </Badge>

          {isGoogleUser && (
            <Badge variant="outline" className="gap-1">
              <svg className="h-3 w-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
              </svg>
              {t("googleAccount")}
            </Badge>
          )}
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {t("joined")} {new Date(profile.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
