import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/server/backend";

export async function GET(request: NextRequest) {
  try {
    const response = await backendFetch("/api/v1/homes", {
      method: "GET",
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch homes" },
      { status: error.status || 500 },
    );
  }
}

export const dynamic = "force-dynamic";
