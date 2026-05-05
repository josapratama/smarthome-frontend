import { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/server/backend";
import { handleApiError } from "@/lib/api/server/error-handler";
import type {
  HomeInviteTokenDTO,
  InviteCreateRequest,
} from "@/lib/api/dto/invites.dto";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();

    if (searchParams.get("homeId")) {
      const homeId = parseInt(searchParams.get("homeId")!);
      if (!isNaN(homeId) && homeId > 0) {
        params.set("homeId", homeId.toString());
      }
    }

    if (searchParams.get("status")) {
      params.set("status", searchParams.get("status")!);
    }

    const queryString = params.toString();
    const url = queryString
      ? `/api/v1/invites?${queryString}`
      : "/api/v1/invites";

    const data = await backendFetch<{ data: HomeInviteTokenDTO[] }>(url);
    return Response.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: InviteCreateRequest = await request.json();

    const data = await backendFetch("/api/v1/invites", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return Response.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
