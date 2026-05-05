import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/server/backend";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { type: string } },
) {
  try {
    const response = await backendFetch(
      `/api/v1/notifications/templates/${params.type}`,
      {
        method: "DELETE",
      },
    );

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete template" },
      { status: error.status || 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { type: string } },
) {
  try {
    const body = await request.json();

    const response = await backendFetch(
      `/api/v1/notifications/templates/${params.type}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      },
    );

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update template" },
      { status: error.status || 500 },
    );
  }
}

export const dynamic = "force-dynamic";
