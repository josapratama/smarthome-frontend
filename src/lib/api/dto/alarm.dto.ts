export type AlarmSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AlarmSource = "DEVICE" | "BACKEND" | "AI" | "USER";
export type AlarmStatus = "OPEN" | "ACKED" | "RESOLVED";

export interface AlarmDTO {
  id: number;
  sensorDataId: number | null;
  sensorReadingId: number | null;
  deviceId: number;
  homeId: number;
  type: string;
  message: string;
  severity: AlarmSeverity;
  source: AlarmSource;
  status: AlarmStatus;
  acknowledgedAt: string | null;
  acknowledgedBy: number | null;
  resolvedAt: string | null;
  resolvedBy: number | null;
  triggeredAt: string;
}

export interface AlarmCreateRequest {
  deviceId: number;
  sensorDataId?: number;
  sensorReadingId?: number;
  type: string;
  message: string;
  severity: AlarmSeverity;
  source?: AlarmSource;
  triggeredAt?: string;
}

export interface AlarmsQuery {
  from?: string;
  to?: string;
  status?: AlarmStatus;
  limit?: number;
}
