import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Returns the current access token to the browser client.
 * Used by axios client to initialize its in-memory token on page load.
 * The token is stored in an httpOnly cookie so it can't be read by JS directly.
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  return NextResponse.json({ accessToken: token });
}

export const dynamic = "force-dynamic";
