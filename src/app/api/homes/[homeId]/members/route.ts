import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/server/backend";

export async function GET(
  request: NextRequest,
  { params }: { params: { homeId: string } },
) {
  try {
    const response = await backendFetch(
      `/api/v1/homes/${params.homeId}/members`,
      {
        method: "GET",
      },
    );

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch members" },
      { status: error.status || 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { homeId: string } },
) {
  try {
    const body = await request.json();
    const response = await backendFetch(
      `/api/v1/homes/${params.homeId}/members`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to invite member" },
      { status: error.status || 500 },
    );
  }
}

export const dynamic = "force-dynamic";
