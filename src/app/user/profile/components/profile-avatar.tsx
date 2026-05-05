"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Trash2 } from "lucide-react";
import type { UserProfile } from "../types";
import { getAvatarUrl, getDisplayName, getInitials } from "../utils/profile";

interface ProfileAvatarProps {
  profile: UserProfile;
  isGoogleUser: boolean;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: () => void;
  onTriggerUpload: () => void;
}

export function ProfileAvatar({
  profile,
  isGoogleUser,
  isUploading,
  fileInputRef,
  onUpload,
  onDelete,
  onTriggerUpload,
}: ProfileAvatarProps) {
  const displayName = getDisplayName(profile);
  const initials = getInitials(displayName);
  const avatarUrl = getAvatarUrl(profile);

  return (
    <div className="relative">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
      </Avatar>

      {!isGoogleUser && (
        <div className="absolute -bottom-2 -right-2 flex gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onUpload}
            className="hidden"
          />
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full"
            onClick={onTriggerUpload}
            disabled={isUploading}
          >
            <Camera className="h-4 w-4" />
          </Button>
          {profile.avatarUrl && (
            <Button
              size="icon"
              variant="destructive"
              className="h-8 w-8 rounded-full"
              onClick={onDelete}
              disabled={isUploading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
