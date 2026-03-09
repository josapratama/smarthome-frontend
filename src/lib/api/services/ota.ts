import { api } from "../client/axios";

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
  createdAt: string;
  updatedAt: string;
  release?: FirmwareRelease;
}

export const otaApi = {
  // Get available firmware releases
  listReleases: async (platform?: string): Promise<FirmwareRelease[]> => {
    const params = platform ? `?platform=${platform}` : "";
    const { data } = await api.get<{ data: { releases: FirmwareRelease[] } }>(
      `/v1/firmware${params}`,
    );
    return data.data.releases;
  },

  // Get OTA jobs for a device
  listJobs: async (deviceId: number): Promise<OtaJob[]> => {
    const { data } = await api.get<{ data: { jobs: OtaJob[] } }>(
      `/v1/devices/${deviceId}/ota`,
    );
    return data.data.jobs;
  },

  // Get single OTA job
  getJob: async (deviceId: number, jobId: number): Promise<OtaJob> => {
    const { data } = await api.get<{ data: { job: OtaJob } }>(
      `/v1/devices/${deviceId}/ota/${jobId}`,
    );
    return data.data.job;
  },

  // Trigger OTA update
  triggerUpdate: async (
    deviceId: number,
    releaseId: number,
  ): Promise<OtaJob> => {
    const { data } = await api.post<{ data: { job: OtaJob } }>(
      `/v1/devices/${deviceId}/ota`,
      { releaseId },
    );
    return data.data.job;
  },

  // Cancel OTA job
  cancelJob: async (deviceId: number, jobId: number): Promise<void> => {
    await api.delete(`/v1/devices/${deviceId}/ota/${jobId}`);
  },

  // Retry failed OTA job
  retryJob: async (deviceId: number, jobId: number): Promise<OtaJob> => {
    const { data } = await api.post<{ data: { job: OtaJob } }>(
      `/v1/devices/${deviceId}/ota/${jobId}/retry`,
    );
    return data.data.job;
  },
};
