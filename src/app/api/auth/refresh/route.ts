import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  clearAuthCookies,
  getRefreshToken,
  setAuthCookies,
} from "@/lib/api/server/auth-cookies";
import { authUpstream } from "@/lib/api/server/auth-upstream";

export async function POST() {
  const jar = await cookies();

  const refreshToken = await getRefreshToken();
  const sessionId = jar.get("admin_session_id")?.value ?? null;

  if (!refreshToken || !sessionId) {
    await clearAuthCookies();
    return NextResponse.json(
      { message: "No refresh session" },
      { status: 401 },
    );
  }

  const { res, payload } = await authUpstream.refresh(
    Number(sessionId),
    refreshToken,
  );

  if (!res.ok || !payload || "error" in payload) {
    await clearAuthCookies();
    return NextResponse.json(payload ?? { message: "Refresh gagal" }, {
      status: 401,
    });
  }

  const data = payload.data;
  if (!data.accessToken) {
    await clearAuthCookies();
    return NextResponse.json(
      { message: "Backend tidak mengirim accessToken" },
      { status: 502 },
    );
  }

  // Allow both ADMIN and USER roles
  // (removed ADMIN-only restriction to support multi-role frontend)

  await setAuthCookies(data.accessToken, data.refreshToken);

  const resp = NextResponse.json({ ok: true }, { status: 200 });

  if (data.sessionId) {
    resp.cookies.set("admin_session_id", String(data.sessionId), {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      path: "/",
    });
  }

  if (data.user?.role) {
    resp.cookies.set("user_role", data.user.role, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return resp;
}
