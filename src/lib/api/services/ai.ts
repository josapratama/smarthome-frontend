import { apiFetchBrowser } from "../client/fetch";

export interface AIStats {
  totalModels: number;
  activePredictions: number;
  activeAutomations: number;
  detectedAnomalies: number;
}

export interface EnergyPrediction {
  id: number;
  timestamp: string;
  predictedUsage: number;
  confidence: number;
  type: "DAILY" | "WEEKLY" | "MONTHLY";
}

export interface Anomaly {
  id: number;
  deviceId: number;
  deviceName: string;
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  detectedAt: string;
  status: "OPEN" | "INVESTIGATING" | "RESOLVED";
}

export interface AIRule {
  id: number;
  name: string;
  description: string | null;
  type: string;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  isActive: boolean;
  priority: number;
  executionCount: number;
  lastExecutedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAIRuleInput {
  name: string;
  description?: string;
  type: "automation" | "alert" | "optimization";
  conditions: {
    trigger:
      | "sensor_value"
      | "time_schedule"
      | "device_state"
      | "energy_threshold";
    deviceId?: number;
    operator?: "gt" | "lt" | "eq" | "gte" | "lte" | "ne";
    value?: number | string | boolean;
    schedule?: string;
  };
  actions: {
    actionType:
      | "control_device"
      | "send_notification"
      | "create_alarm"
      | "log_event";
    deviceId?: number;
    command?: string;
    message?: string;
    severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  };
  priority?: number;
}

export async function getAIStats(): Promise<AIStats> {
  const res = await apiFetchBrowser<{ data: AIStats }>("/api/v1/ai/stats");
  return res.data;
}

export async function getEnergyPredictions(params?: {
  homeId?: number;
  limit?: number;
}): Promise<EnergyPrediction[]> {
  const p = new URLSearchParams();
  if (params?.homeId) p.append("homeId", String(params.homeId));
  if (params?.limit) p.append("limit", String(params.limit));
  const res = await apiFetchBrowser<{ data: EnergyPrediction[] }>(
    `/api/v1/ai/predictions/energy?${p.toString()}`,
  );
  return res.data;
}

export async function getAnomalies(params?: {
  status?: string;
  limit?: number;
}): Promise<Anomaly[]> {
  const p = new URLSearchParams();
  if (params?.status) p.append("status", params.status);
  if (params?.limit) p.append("limit", String(params.limit));
  const res = await apiFetchBrowser<{ data: Anomaly[] }>(
    `/api/v1/ai/anomalies?${p.toString()}`,
  );
  return res.data;
}

export async function updateAnomalyStatus(
  anomalyId: number,
  status: "INVESTIGATING" | "RESOLVED",
): Promise<Anomaly> {
  const res = await apiFetchBrowser<{ data: Anomaly }>(
    `/api/v1/ai/anomalies/${anomalyId}`,
    { method: "PATCH", body: JSON.stringify({ status }) },
  );
  return res.data;
}

export async function getAIRules(params?: {
  type?: string;
  isActive?: string;
}): Promise<AIRule[]> {
  const p = new URLSearchParams();
  if (params?.type) p.append("type", params.type);
  if (params?.isActive) p.append("isActive", params.isActive);
  const res = await apiFetchBrowser<{ data: AIRule[] }>(
    `/api/v1/ai/rules?${p.toString()}`,
  );
  return res.data;
}

export async function createAIRule(input: CreateAIRuleInput): Promise<AIRule> {
  const res = await apiFetchBrowser<{ data: AIRule }>("/api/v1/ai/rules", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data;
}

export async function updateAIRule(
  ruleId: number,
  input: Partial<CreateAIRuleInput> & { isActive?: boolean },
): Promise<AIRule> {
  const res = await apiFetchBrowser<{ data: AIRule }>(
    `/api/v1/ai/rules/${ruleId}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
  return res.data;
}

export async function deleteAIRule(ruleId: number): Promise<void> {
  await apiFetchBrowser(`/api/v1/ai/rules/${ruleId}`, { method: "DELETE" });
}
