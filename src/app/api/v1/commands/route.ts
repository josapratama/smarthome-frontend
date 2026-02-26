import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/server/backend";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const deviceId = searchParams.get("deviceId");
    const status = searchParams.get("status");
    const limit = searchParams.get("limit") || "50";

    let url = `/api/v1/admin/commands?limit=${limit}`;
    if (deviceId) url += `&deviceId=${deviceId}`;
    if (status) url += `&status=${status}`;

    const data = await backendFetch(url, { method: "GET" });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching commands:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch commands" },
      { status: error.status || 500 },
    );
  }
}

export const dynamic = "force-dynamic";
