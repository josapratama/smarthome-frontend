/**
 * Server-side utility to manage authentication cookies
 * Used in Next.js API routes to set/clear HTTP-only cookies
 */

import { cookies } from "next/headers";
import { config } from "@/lib/config";

const isProduction = process.env.NODE_ENV === "production";

export async function setAuthCookies(
  accessToken: string,
  refreshToken?: string,
) {
  const cookieStore = await cookies();

  // Set access token (shorter expiry)
  cookieStore.set("access_token", accessToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  // Set refresh token if provided (longer expiry)
  if (refreshToken) {
    cookieStore.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  cookieStore.delete("admin_session_id");
  cookieStore.delete("user_role");
}

export async function getAuthCookies() {
  const cookieStore = await cookies();

  return {
    accessToken: cookieStore.get("access_token")?.value,
    refreshToken: cookieStore.get("refresh_token")?.value,
    sessionId: cookieStore.get("admin_session_id")?.value,
  };
}

export async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export async function getRefreshToken() {
  const cookieStore = await cookies();
  return cookieStore.get("refresh_token")?.value;
}
