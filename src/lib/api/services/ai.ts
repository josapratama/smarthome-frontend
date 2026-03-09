import { api } from "../client/axios";

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

// Get AI statistics
export async function getAIStats(): Promise<AIStats> {
  const response = await api.get<{ data: AIStats }>("/v1/ai/stats");
  return response.data.data;
}

// Get energy predictions
export async function getEnergyPredictions(params?: {
  homeId?: number;
  limit?: number;
}): Promise<EnergyPrediction[]> {
  const response = await api.get<{ data: EnergyPrediction[] }>(
    "/v1/ai/predictions/energy",
    { params },
  );
  return response.data.data;
}

// Get anomalies
export async function getAnomalies(params?: {
  status?: "OPEN" | "INVESTIGATING" | "RESOLVED" | "ALL";
  limit?: number;
}): Promise<Anomaly[]> {
  const response = await api.get<{ data: Anomaly[] }>("/v1/ai/anomalies", {
    params,
  });
  return response.data.data;
}

// Update anomaly status
export async function updateAnomalyStatus(
  anomalyId: number,
  status: "INVESTIGATING" | "RESOLVED",
): Promise<Anomaly> {
  const response = await api.patch<{ data: Anomaly }>(
    `/v1/ai/anomalies/${anomalyId}`,
    { status },
  );
  return response.data.data;
}

// Get AI rules
export async function getAIRules(params?: {
  type?: "automation" | "alert" | "optimization" | "all";
  isActive?: "true" | "false" | "all";
}): Promise<AIRule[]> {
  const response = await api.get<{ data: AIRule[] }>("/v1/ai/rules", {
    params,
  });
  return response.data.data;
}

// Create AI rule
export async function createAIRule(input: CreateAIRuleInput): Promise<AIRule> {
  const response = await api.post<{ data: AIRule }>("/v1/ai/rules", input);
  return response.data.data;
}

// Update AI rule
export async function updateAIRule(
  ruleId: number,
  input: Partial<CreateAIRuleInput> & { isActive?: boolean },
): Promise<AIRule> {
  const response = await api.patch<{ data: AIRule }>(
    `/v1/ai/rules/${ruleId}`,
    input,
  );
  return response.data.data;
}

// Delete AI rule
export async function deleteAIRule(ruleId: number): Promise<void> {
  await api.delete(`/v1/ai/rules/${ruleId}`);
}
