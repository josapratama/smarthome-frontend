import type { UserProfile } from "../types";

export function getAvatarUrl(profile: UserProfile): string | undefined {
  if (profile.avatarUrl) {
    return `http://localhost:3000${profile.avatarUrl}`;
  }
  if (profile.googlePicture) {
    return profile.googlePicture;
  }
  return undefined;
}

export function getDisplayName(profile: UserProfile): string {
  return profile.googleName || profile.username;
}

export function getInitials(displayName: string): string {
  return displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function isGoogleUser(profile: UserProfile): boolean {
  return profile.authProvider === "google";
}
