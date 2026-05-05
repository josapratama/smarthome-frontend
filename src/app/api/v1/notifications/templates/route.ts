import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/server/backend";

export async function GET(request: NextRequest) {
  try {
    const response = await backendFetch("/api/v1/notifications/templates", {
      method: "GET",
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch templates" },
      { status: error.status || 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await backendFetch("/api/v1/notifications/templates", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create template" },
      { status: error.status || 500 },
    );
  }
}

export const dynamic = "force-dynamic";
