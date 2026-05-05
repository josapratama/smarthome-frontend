import { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/server/backend";
import { handleApiError } from "@/lib/api/server/error-handler";
import type { OtaJobDTO } from "@/lib/api/dto/ota.dto";

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

    const data = await backendFetch<{ data: OtaJobDTO[] }>(
      `/api/v1/ota/devices/${id}/jobs`,
      {},
      { auth: "admin_cookie" },
    );
    return Response.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
