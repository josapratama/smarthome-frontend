import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/server/backend";

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } },
) {
  try {
    const response = await backendFetch(`/api/v1/rooms/${params.roomId}`, {
      method: "GET",
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch room" },
      { status: error.status || 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { roomId: string } },
) {
  try {
    const body = await request.json();
    const response = await backendFetch(`/api/v1/rooms/${params.roomId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update room" },
      { status: error.status || 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { roomId: string } },
) {
  try {
    const response = await backendFetch(`/api/v1/rooms/${params.roomId}`, {
      method: "DELETE",
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete room" },
      { status: error.status || 500 },
    );
  }
}

export const dynamic = "force-dynamic";
