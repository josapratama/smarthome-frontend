import { getAccessToken } from "@/lib/api/server/auth-cookies";
import { upstreamFetch } from "@/lib/api/server/upstream";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = getAccessToken();
  if (!token)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { res: upstream, payload } = await upstreamFetch("/auth/admin/users", {
    method: "GET",
    headers: { authorization: `Bearer ${token}` },
  });

  return NextResponse.json(payload ?? null, { status: upstream.status });
}
