import { apiFetchBrowser } from "../client/fetch";

export type OtaJobStatus =
  | "PENDING"
  | "SENT"
  | "DOWNLOADING"
  | "APPLIED"
  | "FAILED"
  | "TIMEOUT";

export interface FirmwareRelease {
  id: number;
  platform: string;
  version: string;
  sha256: string;
  sizeBytes: number;
  filePath: string;
  notes?: string;
  createdAt: string;
}

export interface OtaJob {
  id: number;
  deviceId: number;
  releaseId: number;
  status: OtaJobStatus;
  progress?: number;
  lastError?: string;
  sentAt?: string;
  downloadingAt?: string;
  appliedAt?: string;
  failedAt?: string;
  commandId?: number | null;
  createdAt: string;
  updatedAt: string;
  release?: FirmwareRelease;
}

export const otaApi = {
  // GET /api/v1/firmware/releases
  listReleases: async (platform?: string): Promise<FirmwareRelease[]> => {
    const url = platform
      ? `/api/v1/firmware/releases?platform=${platform}`
      : "/api/v1/firmware/releases";
    const res = await apiFetchBrowser<{ data: FirmwareRelease[] }>(url);
    return Array.isArray(res.data) ? res.data : [];
  },

  // GET /api/v1/ota/devices/{deviceId}/jobs
  listJobs: async (deviceId: number): Promise<OtaJob[]> => {
    const res = await apiFetchBrowser<{ data: OtaJob[] }>(
      `/api/v1/ota/devices/${deviceId}/jobs`,
    );
    return Array.isArray(res.data) ? res.data : [];
  },

  // GET /api/v1/ota/jobs/{otaJobId}
  getJob: async (deviceId: number, jobId: number): Promise<OtaJob> => {
    const res = await apiFetchBrowser<{ data: OtaJob }>(
      `/api/v1/ota/jobs/${jobId}`,
    );
    return res.data;
  },

  // POST /api/v1/ota/devices/{deviceId}
  triggerUpdate: async (
    deviceId: number,
    releaseId: number,
  ): Promise<{
    otaJobId: number;
    commandId: number | null;
    status: OtaJobStatus;
  }> => {
    const res = await apiFetchBrowser<{
      data: {
        otaJobId: number;
        commandId: number | null;
        status: OtaJobStatus;
      };
    }>(`/api/v1/ota/devices/${deviceId}`, {
      method: "POST",
      body: JSON.stringify({ releaseId }),
    });
    return res.data;
  },

  // DELETE /api/v1/ota/jobs/{otaJobId}  (cancel) — not yet implemented in backend
  cancelJob: async (deviceId: number, jobId: number): Promise<void> => {
    await apiFetchBrowser(`/api/v1/ota/jobs/${jobId}`, {
      method: "DELETE",
    });
  },

  // POST /api/v1/ota/jobs/{otaJobId}/retry — not yet implemented in backend
  retryJob: async (deviceId: number, jobId: number): Promise<OtaJob> => {
    const res = await apiFetchBrowser<{ data: OtaJob }>(
      `/api/v1/ota/jobs/${jobId}/retry`,
      { method: "POST" },
    );
    return res.data;
  },
};
