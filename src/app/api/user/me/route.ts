import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { config } from "@/lib/config";

/**
 * Proxy /api/user/me → backend /api/v1/me
 * Reads httpOnly access_token cookie and forwards as Authorization header
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const res = await fetch(`${config.backendUrl}/api/v1/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(data ?? { error: "UNAUTHORIZED" }, {
        status: res.status,
      });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[/api/user/me] error:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
