import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { config } from "@/lib/config";

/**
 * Generic proxy for all /api/proxy/* → backend /api/v1/*
 * Forwards httpOnly access_token as Authorization header
 *
 * Usage: /api/proxy/channels/device/208 → backend /api/v1/channels/device/208
 */
async function handler(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const path = params.path.join("/");
  const url = new URL(req.url);
  const backendUrl = `${config.backendUrl}/api/v1/${path}${url.search}`;

  try {
    const body =
      req.method !== "GET" && req.method !== "HEAD"
        ? await req.text()
        : undefined;

    const res = await fetch(backendUrl, {
      method: req.method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body,
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(`[proxy] ${req.method} ${backendUrl} error:`, error);
    return NextResponse.json({ error: "PROXY_ERROR" }, { status: 502 });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
