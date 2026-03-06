import { apiFetchBrowser } from "./client.browser";

export type RoomPrivacy = "PUBLIC" | "PRIVATE" | "SHARED" | "RESTRICTED";
export type RoomAccessLevel = "OWNER" | "CONTROL" | "VIEW" | "NONE";

export interface RoomAccessGrant {
  id: number;
  roomId: number;
  userId: number;
  accessLevel: RoomAccessLevel;
  grantedBy: number;
  grantedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  user: {
    id: number;
    username: string;
    email: string;
    avatarUrl: string | null;
  };
  grantor: {
    id: number;
    username: string;
  };
}

export interface RoomAccessLog {
  id: number;
  roomId: number;
  userId: number;
  action: string;
  deviceId: number | null;
  channelId: number | null;
  allowed: boolean;
  reason: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  device: {
    id: number;
    deviceName: string;
  } | null;
  channel: {
    id: number;
    name: string;
  } | null;
}

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  accessLevel?: RoomAccessLevel;
}

/**
 * Grant access to a user for a room
 */
export async function grantRoomAccess(
  roomId: number,
  userId: number,
  accessLevel: RoomAccessLevel,
  expiresAt?: string,
) {
  return apiFetchBrowser(`/api/v1/rooms/${roomId}/access/grant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, accessLevel, expiresAt }),
  });
}

/**
 * Revoke access from a user for a room
 */
export async function revokeRoomAccess(roomId: number, userId: number) {
  return apiFetchBrowser(`/api/v1/rooms/${roomId}/access/revoke`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
}

/**
 * Get all access grants for a room
 */
export async function getRoomGrants(
  roomId: number,
): Promise<RoomAccessGrant[]> {
  const data = await apiFetchBrowser<{ data: RoomAccessGrant[] }>(
    `/api/v1/rooms/${roomId}/access/grants`,
  );
  return data.data;
}

/**
 * Get access logs for a room
 */
export async function getRoomAccessLogs(
  roomId: number,
  options?: {
    limit?: number;
    offset?: number;
    userId?: number;
    allowed?: boolean;
  },
): Promise<RoomAccessLog[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.offset) params.append("offset", options.offset.toString());
  if (options?.userId) params.append("userId", options.userId.toString());
  if (options?.allowed !== undefined)
    params.append("allowed", options.allowed.toString());

  const data = await apiFetchBrowser<{ data: RoomAccessLog[] }>(
    `/api/v1/rooms/${roomId}/access/logs?${params.toString()}`,
  );
  return data.data;
}

/**
 * Update room privacy level
 */
export async function updateRoomPrivacy(
  roomId: number,
  privacyLevel: RoomPrivacy,
) {
  return apiFetchBrowser(`/api/v1/rooms/${roomId}/privacy`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ privacyLevel }),
  });
}

/**
 * Set room owner
 */
export async function setRoomOwner(roomId: number, ownerId: number) {
  return apiFetchBrowser(`/api/v1/rooms/${roomId}/owner`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ownerId }),
  });
}

/**
 * Check if current user has access to a room
 */
export async function checkRoomAccess(
  roomId: number,
  level: RoomAccessLevel = "CONTROL",
): Promise<AccessCheckResult> {
  const data = await apiFetchBrowser<{ data: AccessCheckResult }>(
    `/api/v1/rooms/${roomId}/access/check?level=${level}`,
  );
  return data.data;
}
