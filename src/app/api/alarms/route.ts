import { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/server/backend";
import { handleApiError } from "@/lib/api/server/error-handler";
import type { AlarmEventDTO } from "@/lib/api/dto/alarms.dto";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();

    if (searchParams.get("deviceId")) {
      const deviceId = parseInt(searchParams.get("deviceId")!);
      if (!isNaN(deviceId) && deviceId > 0) {
        params.set("deviceId", deviceId.toString());
      }
    }

    if (searchParams.get("status")) {
      params.set("status", searchParams.get("status")!);
    }

    if (searchParams.get("severity")) {
      params.set("severity", searchParams.get("severity")!);
    }

    const queryString = params.toString();
    const url = queryString
      ? `/api/v1/alarms?${queryString}`
      : "/api/v1/alarms";

    const data = await backendFetch<{ data: AlarmEventDTO[] }>(url);
    return Response.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
