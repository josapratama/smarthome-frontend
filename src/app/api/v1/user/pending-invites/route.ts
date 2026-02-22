import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/server/backend";
import { handleApiError } from "@/lib/api/server/error-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await backendFetch("/api/v1/user/pending-invites", {
      method: "GET",
    });

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
