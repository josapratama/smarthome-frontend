import { config } from "@/lib/config";
import type { AdminProfile } from "./profile.types";

export function getAvatarUrl(profile: AdminProfile): string | undefined {
  if (profile.avatarUrl) {
    return `${config.publicBackendUrl}${profile.avatarUrl}`;
  }
  if (profile.googlePicture) {
    return profile.googlePicture;
  }
  return undefined;
}
