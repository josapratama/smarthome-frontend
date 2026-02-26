import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/server/backend";

export async function POST(
  req: NextRequest,
  { params }: { params: { deviceId: string } },
) {
  try {
    const body = await req.json();
    const { deviceId } = params;

    const data = await backendFetch(`/api/v1/devices/${deviceId}/commands`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Error sending command:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send command" },
      { status: error.status || 500 },
    );
  }
}

export const dynamic = "force-dynamic";
