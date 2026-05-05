/**
 * Command DTOs
 */

export interface CommandDTO {
  id: number;
  deviceId: number;
  command: string;
  status: "PENDING" | "SENT" | "ACKED" | "FAILED" | "TIMEOUT";
  createdAt: string;
  sentAt?: string;
  ackedAt?: string;
}

export interface CommandCreateRequest {
  deviceId: number;
  command: string;
  payload?: any;
}
