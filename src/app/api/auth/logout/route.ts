// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearAuthCookies } from "@/lib/api/server/auth-cookies";
import { upstreamFetch } from "@/lib/api/server/upstream";

export async function POST() {
  const jar = await cookies();
  const sessionId = jar.get("admin_session_id")?.value ?? null;

  // best effort logout ke backend
  if (sessionId) {
    await upstreamFetch("/logout", {
      method: "POST",
      body: JSON.stringify({ sessionId: Number(sessionId) }),
    }).catch(() => null);
  }

  await clearAuthCookies();

  const resp = NextResponse.json({ ok: true }, { status: 200 });
  resp.cookies.set("admin_session_id", "", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return resp;
}
