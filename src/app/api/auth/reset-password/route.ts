import { upstreamFetch } from "@/lib/api/server/upstream";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const data = await upstreamFetch("/reset-password", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || error.error || "Failed to process request";

    return NextResponse.json({ error: message, ...error }, { status });
  }
}
