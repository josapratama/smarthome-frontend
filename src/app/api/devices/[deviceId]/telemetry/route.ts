import { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/server/backend";
import { handleApiError } from "@/lib/api/server/error-handler";
import type { TelemetryDTO } from "@/lib/api/dto/telemetry.dto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> },
) {
  try {
    const { deviceId } = await params;
    const id = parseInt(deviceId);

    if (isNaN(id) || id <= 0) {
      return Response.json({ error: "Invalid device ID" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = new URLSearchParams();

    // Forward date range filters if provided
    if (searchParams.get("from")) {
      queryParams.set("from", searchParams.get("from")!);
    }

    if (searchParams.get("to")) {
      queryParams.set("to", searchParams.get("to")!);
    }

    if (searchParams.get("limit")) {
      const limit = parseInt(searchParams.get("limit")!);
      if (!isNaN(limit) && limit > 0 && limit <= 1000) {
        queryParams.set("limit", limit.toString());
      }
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `/devices/${id}/telemetry?${queryString}`
      : `/devices/${id}/telemetry`;

    const data = await backendFetch<{ data: TelemetryDTO[] }>(
      url,
      {},
      { auth: "admin_cookie" },
    );
    return Response.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
