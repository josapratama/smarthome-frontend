"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, Calendar, Camera, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { AdminProfile } from "../lib/profile.types";
import { getAvatarUrl } from "../lib/profile.utils";

interface ProfileCardProps {
  profile: AdminProfile;
  isUploadingAvatar: boolean;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteAvatar: () => void;
}

export function ProfileCard({
  profile,
  isUploadingAvatar,
  onAvatarUpload,
  onDeleteAvatar,
}: ProfileCardProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isGoogleUser = profile.authProvider === "google";
  const displayName = profile.googleName || profile.username;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="md:col-span-1">
      <CardHeader>
        <CardTitle>{t("profile")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={getAvatarUrl(profile)} alt={displayName} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            {!isGoogleUser && (
              <div className="absolute -bottom-2 -right-2 flex gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onAvatarUpload}
                  className="hidden"
                />
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                {profile.avatarUrl && (
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8 rounded-full"
                    onClick={onDeleteAvatar}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Name + email */}
          <div>
            <h3 className="font-semibold text-lg">{displayName}</h3>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>

          {/* Role badge */}
          <Badge variant={profile.role === "ADMIN" ? "default" : "secondary"}>
            <Shield className="h-3 w-3 mr-1" />
            {profile.role}
          </Badge>

          {/* Google badge */}
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
