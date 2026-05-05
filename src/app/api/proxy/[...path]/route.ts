import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { config } from "@/lib/config";

/**
 * Generic proxy for all /api/proxy/* → backend /api/v1/*
 * Forwards httpOnly access_token as Authorization header.
 *
 * Handles three body types:
 *  - multipart/form-data  → ArrayBuffer (preserves binary + boundary)
 *  - other POST/PUT/PATCH → text (JSON, etc.)
 *  - GET/HEAD             → no body
 */
async function handler(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const cookieStore = cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const path = params.path.join("/");
  const url = new URL(req.url);
  const backendUrl = `${config.backendUrl}/api/v1/${path}${url.search}`;

  console.log(`[proxy] ${req.method} /api/proxy/${path} → ${backendUrl}`);

  try {
    const contentType = req.headers.get("content-type") ?? "";
    const isMultipart = contentType.includes("multipart/form-data");
    const hasBody = req.method !== "GET" && req.method !== "HEAD";

    // Read body — preserve binary for multipart, text for everything else
    const body = hasBody
      ? isMultipart
        ? await req.arrayBuffer()
        : await req.text()
      : undefined;

    // Build forward headers
    const forwardHeaders: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    if (hasBody) {
      if (isMultipart) {
        // Must forward the original Content-Type including the boundary parameter
        forwardHeaders["Content-Type"] = contentType;
      } else {
        // Default to application/json for non-multipart requests
        forwardHeaders["Content-Type"] = contentType || "application/json";
      }
    }

    const res = await fetch(backendUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
    });

    // Try JSON first; fall back to text for non-JSON responses (e.g. binary downloads)
    const resContentType = res.headers.get("content-type") ?? "";
    if (resContentType.includes("application/json")) {
      const data = await res.json().catch(() => null);
      return NextResponse.json(data, { status: res.status });
    } else {
      const text = await res.text().catch(() => "");
      return new NextResponse(text, {
        status: res.status,
        headers: { "Content-Type": resContentType || "text/plain" },
      });
    }
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
