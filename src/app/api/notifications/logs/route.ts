import { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/server/backend";
import { handleApiError } from "@/lib/api/server/error-handler";
import type { NotificationLogDTO } from "@/lib/api/dto/notifications.dto";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();

    if (searchParams.get("endpointId")) {
      const endpointId = parseInt(searchParams.get("endpointId")!);
      if (!isNaN(endpointId) && endpointId > 0) {
        params.set("endpointId", endpointId.toString());
      }
    }

    if (searchParams.get("success")) {
      const success = searchParams.get("success");
      if (success === "true" || success === "false") {
        params.set("success", success);
      }
    }

    const queryString = params.toString();
    const url = queryString
      ? `/api/v1/notifications/logs?${queryString}`
      : "/api/v1/notifications/logs";

    const data = await backendFetch<{ data: NotificationLogDTO[] }>(
      url,
      {},
      { auth: "admin_cookie" },
    );
    return Response.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
