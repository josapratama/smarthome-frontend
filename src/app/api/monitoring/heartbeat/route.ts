import { backendFetch } from "@/lib/api/server/backend";
import { handleApiError } from "@/lib/api/server/error-handler";

export async function GET() {
  try {
    // Heartbeat endpoint sebenarnya tidak ada di backend sebagai GET /heartbeat
    // Ini adalah endpoint untuk monitoring status sistem
    // Untuk sementara return status OK
    return Response.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      message: "System is running",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
