import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/server/backend";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { homeId: string; userId: string } },
) {
  try {
    const body = await request.json();
    const response = await backendFetch(
      `/api/v1/homes/${params.homeId}/members/${params.userId}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      },
    );

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update member role" },
      { status: error.status || 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { homeId: string; userId: string } },
) {
  try {
    const response = await backendFetch(
      `/api/v1/homes/${params.homeId}/members/${params.userId}`,
      {
        method: "DELETE",
      },
    );

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to remove member" },
      { status: error.status || 500 },
    );
  }
}

export const dynamic = "force-dynamic";
