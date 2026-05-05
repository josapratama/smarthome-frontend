import { apiFetchBrowser } from "../client/fetch";

export interface PrivacySettings {
  profileVisibility: "PUBLIC" | "FRIENDS" | "PRIVATE";
  showOnlineStatus: boolean;
  showLocation: boolean;
  showActivity: boolean;
  allowFriendRequests: boolean;
  allowMessages: boolean;
  dataCollection: boolean;
  analyticsTracking: boolean;
}

/**
 * Get user privacy settings
 */
export async function getPrivacySettings(): Promise<PrivacySettings> {
  const response = await apiFetchBrowser("/api/v1/privacy/settings");
  return response.data;
}

/**
 * Update user privacy settings
 */
export async function updatePrivacySettings(
  settings: Partial<PrivacySettings>,
): Promise<PrivacySettings> {
  const response = await apiFetchBrowser("/api/v1/privacy/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  return response.data;
}

/**
 * Download user data (GDPR)
 */
export async function downloadUserData(): Promise<any> {
  const response = await apiFetchBrowser("/api/v1/privacy/download-data");
  return response.data;
}

/**
 * Delete user account (GDPR)
 */
export async function deleteUserData(): Promise<void> {
  await apiFetchBrowser("/api/v1/privacy/delete-data", {
    method: "DELETE",
  });
}
