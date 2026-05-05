import { backendFetch } from "@/lib/api/server/backend";
import { handleApiError } from "@/lib/api/server/error-handler";
import type { NotificationEndpointDTO } from "@/lib/api/dto/notifications.dto";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await backendFetch<{ data: NotificationEndpointDTO[] }>(
      "/api/v1/notifications/endpoints",
      {},
      { auth: "admin_cookie" },
    );
    return Response.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
