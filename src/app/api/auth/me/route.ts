import { backendFetch } from "@/lib/api/server/backend";
import { handleApiError } from "@/lib/api/server/error-handler";
import type { UserDTO } from "@/lib/api/dto/auth.dto";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await backendFetch<{ data: UserDTO }>(
      "/api/v1/auth/me",
      {},
      { auth: "admin_cookie" },
    );
    return Response.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
