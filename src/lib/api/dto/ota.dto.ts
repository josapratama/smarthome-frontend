/**
 * OTA (Over-The-Air) Update DTOs
 */

export interface OtaJobDTO {
  id: number;
  deviceId: number;
  firmwareReleaseId: number;
  status: string;
  progress?: number | null;
  lastError?: string | null;
  sentAt?: string | null;
  downloadingAt?: string | null;
  appliedAt?: string | null;
  failedAt?: string | null;
  commandId?: number | null;
  createdAt: string;
  updatedAt: string;
  // Legacy fields for backward compatibility
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface OtaTriggerRequest {
  deviceId: number;
  firmwareReleaseId: number;
}
