import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/server/backend";

export async function GET(
  request: NextRequest,
  { params }: { params: { homeId: string } },
) {
  try {
    const response = await backendFetch(`/api/v1/homes/${params.homeId}`, {
      method: "GET",
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch home" },
      { status: error.status || 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { homeId: string } },
) {
  try {
    const body = await request.json();
    const response = await backendFetch(`/api/v1/homes/${params.homeId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update home" },
      { status: error.status || 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { homeId: string } },
) {
  try {
    const response = await backendFetch(`/api/v1/homes/${params.homeId}`, {
      method: "DELETE",
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete home" },
      { status: error.status || 500 },
    );
  }
}

export const dynamic = "force-dynamic";
