import { NextRequest } from "next/server";
import { backendFetch, backendUpload } from "@/lib/api/server/backend";
import { handleApiError } from "@/lib/api/server/error-handler";
import type { FirmwareReleaseDTO } from "@/lib/api/dto/firmware.dto";

export async function GET() {
  try {
    const data = await backendFetch<{ data: FirmwareReleaseDTO[] }>(
      "/firmware/releases",
      {},
      { auth: "admin_cookie" },
    );
    return Response.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const data = await backendUpload("/api/v1/firmware/releases", formData);

    return Response.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
