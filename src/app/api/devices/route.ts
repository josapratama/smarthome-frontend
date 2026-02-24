import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/server/backend";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const homeId = searchParams.get("homeId");

    const url = homeId ? `/api/v1/devices?homeId=${homeId}` : "/api/v1/devices";

    const response = await backendFetch(url, {
      method: "GET",
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch devices" },
      { status: error.status || 500 },
    );
  }
}

export const dynamic = "force-dynamic";
