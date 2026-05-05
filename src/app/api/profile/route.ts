import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/server/backend";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await backendFetch("/api/v1/profile", {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: error.status || 500 },
    );
  }
}

export const dynamic = "force-dynamic";
