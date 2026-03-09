import { upstreamFetch } from "@/lib/api/server/upstream";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    console.log("[Forgot Password] Request body:", body);

    const data = await upstreamFetch("/forgot-password", {
      method: "POST",
      body: JSON.stringify(body),
    });

    console.log("[Forgot Password] Response data:", data);

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("[Forgot Password] Error:", error);

    const status = error.status || 500;
    const message = error.message || error.error || "Failed to process request";

    return NextResponse.json({ error: message, ...error }, { status });
  }
}
