import { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/server/backend";
import { handleApiError } from "@/lib/api/server/error-handler";
import type { OtaTriggerRequest } from "@/lib/api/dto/ota.dto";

export async function POST(request: NextRequest) {
  try {
    const body: OtaTriggerRequest = await request.json();

    const data = await backendFetch("/api/v1/ota/trigger", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return Response.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
