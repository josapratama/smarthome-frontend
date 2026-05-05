import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/server/backend";
import { handleApiError } from "@/lib/api/server/error-handler";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const id = parseInt(jobId);

  if (isNaN(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
  }

  try {
    const data = await backendFetch(
      `/api/v1/ota/jobs/${id}`,
      {},
      { auth: "admin_cookie" },
    );
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
