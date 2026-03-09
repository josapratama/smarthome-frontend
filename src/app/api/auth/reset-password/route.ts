import { upstreamFetch } from "@/lib/api/server/upstream";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const { res: upstream, payload } = await upstreamFetch("/v1/reset-password", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!upstream) {
    return NextResponse.json(
      { error: "Failed to connect to backend" },
      { status: 500 },
    );
  }

  return NextResponse.json(payload ?? null, { status: upstream.status });
}
