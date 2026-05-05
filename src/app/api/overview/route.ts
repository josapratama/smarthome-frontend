import { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/server/backend";
import { handleApiError } from "@/lib/api/server/error-handler";
import type { OverviewDTO } from "@/lib/api/dto/overview.dto";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const data = await backendFetch<{ data: OverviewDTO }>("/api/v1/overview");
    return Response.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
