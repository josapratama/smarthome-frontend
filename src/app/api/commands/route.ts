import { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/server/backend";
import { handleApiError } from "@/lib/api/server/error-handler";
import type {
  CommandDTO,
  CommandCreateRequest,
} from "@/lib/api/dto/commands.dto";

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

    const queryString = params.toString();
    const url = queryString
      ? `/api/v1/commands?${queryString}`
      : "/api/v1/commands";

    const data = await backendFetch<{ data: CommandDTO[] }>(url);
    return Response.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CommandCreateRequest = await request.json();

    const data = await backendFetch("/api/v1/commands", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return Response.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
